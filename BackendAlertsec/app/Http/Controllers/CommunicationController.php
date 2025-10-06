<?php

namespace App\Http\Controllers;

use App\Models\Communication;
use App\Models\Signalement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommunicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Communication::with(['signalement', 'user']);

        // Filtres
        if ($request->filled('signalement_id')) {
            $query->where('signalement_id', $request->signalement_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('lu')) {
            $query->where('lu', $request->boolean('lu'));
        }

        $communications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $communications
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'signalement_id' => 'required|exists:signalements,id',
            'type' => 'required|in:message,appel,sms',
            'contenu' => 'required|string|max:1000',
            'pieces_jointes' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $signalement = Signalement::findOrFail($request->signalement_id);

        // Vérifier que l'utilisateur peut communiquer sur ce signalement
        if (!$this->peutCommuniquer($user, $signalement)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à communiquer sur ce signalement'
            ], 403);
        }

        $communication = Communication::create([
            'signalement_id' => $request->signalement_id,
            'user_id' => $user->id,
            'type' => $request->type,
            'contenu' => $request->contenu,
            'envoyeur' => $user->role === 'citoyen' ? 'citoyen' : 'agent',
            'pieces_jointes' => $request->pieces_jointes,
        ]);

        // Notifier les autres participants
        $this->notifierParticipants($communication, $signalement);

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé avec succès',
            'data' => $communication->load(['user'])
        ], 201);
    }

    public function show($id)
    {
        $communication = Communication::with(['signalement', 'user'])
            ->findOrFail($id);

        // Marquer comme lu si c'est un destinataire
        if ($communication->user_id !== request()->user()->id) {
            $communication->marquerCommeLue();
        }

        return response()->json([
            'success' => true,
            'data' => $communication
        ]);
    }

    public function getBySignalement(Request $request, $signalementId)
    {
        $signalement = Signalement::findOrFail($signalementId);
        $user = $request->user();

        // Vérifier les permissions
        if (!$this->peutCommuniquer($user, $signalement)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à voir les communications de ce signalement'
            ], 403);
        }

        $communications = Communication::where('signalement_id', $signalementId)
            ->with(['user'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Marquer tous les messages non lus comme lus
        $communications->where('user_id', '!=', $user->id)
            ->where('lu', false)
            ->each(function ($communication) {
                $communication->marquerCommeLue();
            });

        return response()->json([
            'success' => true,
            'data' => $communications
        ]);
    }

    public function markAsRead($id)
    {
        $communication = Communication::findOrFail($id);
        $user = request()->user();

        // Vérifier que l'utilisateur peut marquer ce message comme lu
        if ($communication->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas marquer votre propre message comme lu'
            ], 400);
        }

        $communication->marquerCommeLue();

        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $communications = Communication::whereHas('signalement', function ($query) use ($user) {
            if ($user->isCitoyen()) {
                $query->where('citoyen_id', $user->id);
            } elseif ($user->isAgent()) {
                $query->where('agent_assigne_id', $user->id);
            }
        })->where('user_id', '!=', $user->id)
        ->where('lu', false);

        $count = $communications->count();
        $communications->update(['lu' => true, 'date_lecture' => now()]);

        return response()->json([
            'success' => true,
            'message' => "{$count} messages marqués comme lus"
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();

        $query = Communication::whereHas('signalement', function ($query) use ($user) {
            if ($user->isCitoyen()) {
                $query->where('citoyen_id', $user->id);
            } elseif ($user->isAgent()) {
                $query->where('agent_assigne_id', $user->id);
            }
        })->where('user_id', '!=', $user->id)
        ->where('lu', false);

        $count = $query->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count]
        ]);
    }

    public function getConversations(Request $request)
    {
        $user = $request->user();

        $query = Communication::whereHas('signalement', function ($query) use ($user) {
            if ($user->isCitoyen()) {
                $query->where('citoyen_id', $user->id);
            } elseif ($user->isAgent()) {
                $query->where('agent_assigne_id', $user->id);
            }
        })->with(['signalement', 'user']);

        $communications = $query->get()
            ->groupBy('signalement_id')
            ->map(function ($messages, $signalementId) use ($user) {
                $signalement = $messages->first()->signalement;
                $dernierMessage = $messages->sortByDesc('created_at')->first();
                $messagesNonLus = $messages->where('user_id', '!=', $user->id)->where('lu', false)->count();

                return [
                    'signalement_id' => $signalementId,
                    'signalement' => [
                        'id' => $signalement->id,
                        'type' => $signalement->type,
                        'niveau' => $signalement->niveau,
                        'status' => $signalement->status,
                        'adresse' => $signalement->adresse,
                    ],
                    'dernier_message' => [
                        'id' => $dernierMessage->id,
                        'contenu' => $dernierMessage->contenu,
                        'type' => $dernierMessage->type,
                        'envoyeur' => $dernierMessage->envoyeur,
                        'created_at' => $dernierMessage->created_at,
                        'user' => $dernierMessage->user,
                    ],
                    'messages_non_lus' => $messagesNonLus,
                    'total_messages' => $messages->count(),
                ];
            })
            ->sortByDesc(function ($conversation) {
                return $conversation['dernier_message']['created_at'];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $communications
        ]);
    }

    public function update(Request $request, $id)
    {
        $communication = Communication::findOrFail($id);
        $user = $request->user();

        // Seul l'expéditeur peut modifier son message
        if ($communication->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier ce message'
            ], 403);
        }

        // Vérifier que le message n'est pas trop ancien (5 minutes)
        if ($communication->created_at->diffInMinutes(now()) > 5) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier un message de plus de 5 minutes'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'contenu' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $communication->update([
            'contenu' => $request->contenu,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message modifié avec succès',
            'data' => $communication->load(['user'])
        ]);
    }

    public function destroy($id)
    {
        $communication = Communication::findOrFail($id);
        $user = request()->user();

        // Seul l'expéditeur peut supprimer son message
        if ($communication->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à supprimer ce message'
            ], 403);
        }

        // Vérifier que le message n'est pas trop ancien (5 minutes)
        if ($communication->created_at->diffInMinutes(now()) > 5) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un message de plus de 5 minutes'
            ], 400);
        }

        $communication->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message supprimé avec succès'
        ]);
    }

    // Méthodes privées
    private function peutCommuniquer($user, $signalement)
    {
        // L'admin et les superviseurs peuvent communiquer sur tous les signalements
        if ($user->isAdmin() || $user->isSuperviseur()) {
            return true;
        }

        // Le citoyen qui a créé le signalement
        if ($user->isCitoyen() && $signalement->citoyen_id === $user->id) {
            return true;
        }

        // L'agent assigné au signalement
        if ($user->isAgent() && $signalement->agent_assigne_id === $user->id) {
            return true;
        }

        return false;
    }

    private function notifierParticipants($communication, $signalement)
    {
        $participants = collect();

        // Ajouter le citoyen
        $participants->push($signalement->citoyen);

        // Ajouter l'agent assigné s'il existe
        if ($signalement->agentAssigne) {
            $participants->push($signalement->agentAssigne);
        }

        // Ajouter les superviseurs
        $superviseurs = User::whereIn('role', ['admin', 'superviseur'])->get();
        $participants = $participants->merge($superviseurs);

        // Notifier tous les participants sauf l'expéditeur
        foreach ($participants->unique('id') as $participant) {
            if ($participant->id !== $communication->user_id) {
                \App\Models\Notification::create([
                    'user_id' => $participant->id,
                    'titre' => 'Nouveau message',
                    'message' => "Nouveau message sur le signalement #{$signalement->id}",
                    'type' => 'info',
                    'donnees' => [
                        'signalement_id' => $signalement->id,
                        'communication_id' => $communication->id
                    ],
                    'action_url' => "/signalements/{$signalement->id}/communications",
                ]);
            }
        }
    }
}





