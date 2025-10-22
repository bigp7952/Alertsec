<?php

namespace App\Http\Controllers;

use App\Models\Signalement;
use App\Models\User;
use App\Models\AgentTracking;
use App\Models\Media;
use App\Models\Communication;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Events\SignalementAssigne;

class SignalementController extends Controller
{
    public function index(Request $request)
    {
        // Eager load médias désormais que le modèle pointe la bonne table
        $query = Signalement::with(['citoyen', 'agentAssigne', 'mediasFiles']);

        // Filtrage par secteur pour les superviseurs
        if ($request->filled('secteur_filter')) {
            $secteur = $request->secteur_filter;
            $query->whereHas('citoyen', function($q) use ($secteur) {
                $q->where('secteur', $secteur);
            })->orWhereHas('agentAssigne', function($q) use ($secteur) {
                $q->where('secteur', $secteur);
            });
        }

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('niveau')) {
            $query->where('niveau', $request->niveau);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_assigne_id', $request->agent_id);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_signalement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_signalement', '<=', $request->date_fin);
        }

        // Recherche géographique
        if ($request->filled('latitude') && $request->filled('longitude') && $request->filled('rayon')) {
            $query->dansZone($request->latitude, $request->longitude, $request->rayon);
        }

        try {
            // Retourner une collection simple (attendue par le front)
            $signalements = $query->orderBy('date_signalement', 'desc')->get();

            // Normaliser quelques champs pour éviter les nulls côté front
            $normalized = $signalements->map(function ($s) {
                $s->priorite = $s->priorite ?? 'CRITIQUE';
                $s->heure = $s->heure ?? optional($s->date_signalement)->format('H:i:s');
                // S'assurer que les relations existent
                $s->citoyen = $s->citoyen; // déjà chargé par with()
                $s->agent_assigne = $s->agentAssigne; // alias plus intuitif côté front
                // Normaliser médias en groupes (photos/videos/audios) + URLs
                $photos = collect();
                $videos = collect();
                $audios = collect();
                foreach ($s->mediasFiles as $m) {
                    $item = [
                        'id' => $m->id,
                        'url' => $m->url,
                        'type_mime' => $m->type_mime,
                        'nom_fichier' => $m->nom_fichier,
                        'taille' => $m->formatted_size ?? $m->taille_fichier,
                        'duree' => $m->formatted_duration ?? null,
                    ];
                    if ($m->type_media === 'photo') $photos->push($item);
                    elseif ($m->type_media === 'video') $videos->push($item);
                    elseif ($m->type_media === 'audio') $audios->push($item);
                }
                $s->medias = [
                    'photos' => $photos->values(),
                    'videos' => $videos->values(),
                    'audios' => $audios->values(),
                ];
                unset($s->agentAssigne);
                return $s;
            });

            return response()->json([
                'success' => true,
                'data' => $normalized
            ]);
        } catch (\Throwable $e) {
            \Log::error('Erreur index signalements: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des signalements'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Assouplir la validation pour accepter les payloads JSON du dashboard
        $validator = Validator::make($request->all(), [
            'description' => 'required|string|max:2000',
            'niveau' => 'sometimes|in:danger-critical,danger-medium,safe-zone',
            'type' => 'sometimes|in:agression,vol,accident,incendie,autre',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'adresse' => 'nullable|string|max:255',
            'heure' => 'nullable|date_format:H:i:s',
            'contact' => 'nullable|array',
            'contact.telephone' => 'nullable|string',
            'contact.email' => 'nullable|email',
            // Accepter des URLs/json pour médias depuis le dashboard (pas d'upload fichier requis ici)
            'medias' => 'nullable|array',
            'medias.photos' => 'nullable|array',
            'medias.videos' => 'nullable|array',
            'medias.audios' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $signalement = Signalement::create([
            'citoyen_id' => $user->id,
            'description' => $request->input('description'),
            'niveau' => $request->input('niveau', 'danger-medium'),
            'type' => $request->input('type', 'autre'),
            'priorite' => $this->calculerPriorite([
                'niveau' => $request->input('niveau', 'danger-medium'),
                'type' => $request->input('type', 'autre'),
            ]),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'adresse' => $request->input('adresse'),
            'heure' => $request->input('heure', now()->format('H:i:s')),
            'date_signalement' => now(),
            'contact' => $request->input('contact'),
            // Stocker temporairement les médias côté JSON si envoyés en URLs
            'medias' => $request->input('medias', ['photos' => [], 'videos' => [], 'audios' => []]),
        ]);

        // Optionnel: si upload fichiers (multipart), on crée des entrées Media
        if ($request->hasFile('medias.photos')) {
            foreach ($request->file('medias.photos') as $photo) {
                Media::creerMedia($signalement->id, $photo, 'photo');
            }
        }
        if ($request->hasFile('medias.videos')) {
            foreach ($request->file('medias.videos') as $video) {
                Media::creerMedia($signalement->id, $video, 'video');
            }
        }
        if ($request->hasFile('medias.audios')) {
            foreach ($request->file('medias.audios') as $audio) {
                Media::creerMedia($signalement->id, $audio, 'audio');
            }
        }

        // Notifier les superviseurs et admins
        $this->notifierNouveauSignalement($signalement);

        // Assignation automatique si possible
        $this->assignerAutomatiquement($signalement);

        return response()->json([
            'success' => true,
            'message' => 'Signalement créé avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
        ], 201);
    }

    // Endpoint simplifié pour le dashboard: accepte le payload du formulaire tel quel
    public function quickStore(Request $request)
    {
        try {
            $user = $request->user();
            $payload = $request->all();

            $signalement = Signalement::create([
                'citoyen_id' => $user->id,
                'description' => $payload['description'] ?? '',
                'niveau' => $payload['niveau'] ?? 'danger-medium',
                'type' => $payload['type'] ?? 'autre',
                'priorite' => $this->calculerPriorite([
                    'niveau' => $payload['niveau'] ?? 'danger-medium',
                    'type' => $payload['type'] ?? 'autre',
                ]),
                'latitude' => $payload['localisation']['lat'] ?? $payload['latitude'] ?? null,
                'longitude' => $payload['localisation']['lng'] ?? $payload['longitude'] ?? null,
                'adresse' => $payload['localisation']['nom'] ?? $payload['adresse'] ?? null,
                'heure' => $payload['heure'] ?? now()->format('H:i:s'),
                'date_signalement' => now(),
                'contact' => $payload['contact'] ?? null,
                'medias' => $payload['medias'] ?? ['photos' => [], 'videos' => [], 'audios' => []],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signalement créé (rapide)',
                'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('quickStore failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Création échouée',
            ], 400);
        }
    }

    public function show($id)
    {
        $signalement = Signalement::with([
            'citoyen', 
            'agentAssigne', 
            'mediasFiles', 
            'communications.user'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $signalement
        ]);
    }

    public function update(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur() && 
            $signalement->citoyen_id !== $user->id && 
            $signalement->agent_assigne_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier ce signalement'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'sometimes|string|max:1000',
            'status' => 'sometimes|in:non traité,en cours,traité',
            'notes_agent' => 'nullable|string',
            'notes_superviseur' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $signalement->update($request->only([
            'description', 'status', 'notes_agent', 'notes_superviseur'
        ]));

        // Si marqué comme traité, mettre à jour les dates
        if ($request->status === 'traité') {
            $signalement->marquerCommeTraite($request->notes_agent);
        }

        return response()->json([
            'success' => true,
            'message' => 'Signalement mis à jour avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
        ]);
    }

    public function assigner(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions (seuls admin/superviseur peuvent assigner)
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à assigner des signalements'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'agent_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $agent = User::findOrFail($request->agent_id);

        // Vérifier que l'agent peut traiter ce type de signalement
        if ($agent->specialites && !in_array($signalement->type, $agent->specialites)) {
            return response()->json([
                'success' => false,
                'message' => 'Cet agent ne peut pas traiter ce type de signalement'
            ], 400);
        }

        // Vérifier la charge de travail
        if ($agent->charge_travail >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Cet agent a déjà trop de signalements en cours'
            ], 400);
        }

        $signalement->assignerAgent($request->agent_id);

        // Broadcast à l'agent assigné avec toutes les infos
        try {
            event(new SignalementAssigne($signalement, (int) $request->agent_id));
        } catch (\Throwable $e) {
            \Log::warning('Broadcast SignalementAssigne échoué: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Agent assigné avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
        ]);
    }

    public function assignationAutomatique(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $agentRecommandé = $this->trouverMeilleurAgent($signalement);

        if (!$agentRecommandé) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun agent disponible trouvé'
            ], 404);
        }

        $signalement->assignerAgent($agentRecommandé->id);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigné automatiquement',
            'data' => [
                'signalement' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles']),
                'agent_recommande' => $agentRecommandé
            ]
        ]);
    }

    public function destroy($id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = request()->user();

        // Seuls admin et le créateur peuvent supprimer
        if (!$user->isAdmin() && $signalement->citoyen_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à supprimer ce signalement'
            ], 403);
        }

        // Supprimer les médias associés
        foreach ($signalement->mediasFiles as $media) {
            Storage::delete($media->chemin_fichier);
            $media->delete();
        }

        $signalement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Signalement supprimé avec succès'
        ]);
    }

    public function statistiques(Request $request)
    {
        $query = Signalement::query();

        // Filtres de date
        if ($request->filled('date_debut')) {
            $query->whereDate('date_signalement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_signalement', '<=', $request->date_fin);
        }

        $signalements = $query->get();

        $statistiques = [
            'total' => $signalements->count(),
            'par_status' => $signalements->groupBy('status')->map->count(),
            'par_niveau' => $signalements->groupBy('niveau')->map->count(),
            'par_type' => $signalements->groupBy('type')->map->count(),
            'par_priorite' => $signalements->groupBy('priorite')->map->count(),
            'taux_traitement' => $signalements->count() > 0 ? 
                round(($signalements->where('status', 'traité')->count() / $signalements->count()) * 100, 2) : 0,
            'temps_moyen_traitement' => $this->calculerTempsMoyenTraitement($signalements),
        ];

        return response()->json([
            'success' => true,
            'data' => $statistiques
        ]);
    }

    // Méthodes privées
    private function calculerPriorite($data)
    {
        $score = 0;
        
        // Niveau de danger
        switch ($data['niveau']) {
            case 'danger-critical':
                $score += 40;
                break;
            case 'danger-medium':
                $score += 20;
                break;
            case 'safe-zone':
                $score += 5;
                break;
        }
        
        // Type de signalement
        switch ($data['type']) {
            case 'agression':
                $score += 30;
                break;
            case 'vol':
                $score += 25;
                break;
            case 'accident':
                $score += 20;
                break;
            case 'incendie':
                $score += 35;
                break;
            default:
                $score += 10;
                break;
        }
        
        // Déterminer la priorité
        if ($score >= 70) return 'critique';
        if ($score >= 50) return 'haute';
        if ($score >= 30) return 'moyenne';
        return 'basse';
    }

    private function notifierNouveauSignalement($signalement)
    {
        $superviseurs = User::whereIn('role', ['admin', 'superviseur'])->get();
        
        foreach ($superviseurs as $superviseur) {
            Notification::create([
                'user_id' => $superviseur->id,
                'titre' => 'Nouveau signalement',
                'message' => "Un signalement de type {$signalement->type} a été créé",
                'type' => $signalement->niveau === 'danger-critical' ? 'error' : 'info',
                'donnees' => ['signalement_id' => $signalement->id],
                'action_url' => "/signalements/{$signalement->id}",
            ]);
        }
    }

    private function assignerAutomatiquement($signalement)
    {
        $agentRecommandé = $this->trouverMeilleurAgent($signalement);
        
        if ($agentRecommandé) {
            $signalement->assignerAgent($agentRecommandé->id);
        }
    }

    private function trouverMeilleurAgent($signalement)
    {
        $agents = User::agents()
            ->disponibles()
            ->get();

        $meilleursAgents = collect();

        foreach ($agents as $agent) {
            $dernierePosition = $agent->dernierePosition;
            if (!$dernierePosition) continue;

            // Vérifier les spécialités
            if ($agent->specialites && !in_array($signalement->type, $agent->specialites)) {
                continue;
            }

            // Calculer la distance
            $distance = $agent->calculerDistance($signalement->latitude, $signalement->longitude);
            if ($distance > $agent->distance_max) {
                continue;
            }

            // Calculer le score
            $score = 100;
            $score -= $distance * 5; // Pénalité distance
            $score -= $agent->charge_travail * 10; // Pénalité charge
            $score += $agent->experience * 2; // Bonus expérience
            $score += $agent->taux_reussite ?? 0; // Bonus taux de réussite

            $meilleursAgents->push([
                'agent' => $agent,
                'score' => $score,
                'distance' => $distance
            ]);
        }

        return $meilleursAgents->sortByDesc('score')->first()['agent'] ?? null;
    }

    private function calculerTempsMoyenTraitement($signalements)
    {
        $signalementsTraites = $signalements->where('status', 'traité')
            ->whereNotNull('date_assignation')
            ->whereNotNull('date_traitement');

        if ($signalementsTraites->isEmpty()) {
            return 0;
        }

        $tempsTotal = 0;
        foreach ($signalementsTraites as $signalement) {
            $tempsTotal += $signalement->date_assignation->diffInMinutes($signalement->date_traitement);
        }

        return round($tempsTotal / $signalementsTraites->count(), 2);
    }
}
