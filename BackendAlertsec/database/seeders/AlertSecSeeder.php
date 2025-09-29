<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Signalement;
use App\Models\ZoneDanger;
use App\Models\AgentTracking;
use Illuminate\Support\Facades\Hash;

class AlertSecSeeder extends Seeder
{
    public function run(): void
    {
        // Créer des utilisateurs de test
        
        // Admin
        $admin = User::create([
            'matricule' => 'ADM001',
            'nom' => 'Ndiaye',
            'prenom' => 'Amadou',
            'grade' => 'Commissaire Divisionnaire',
            'unite' => 'Direction Générale',
            'secteur' => 'Dakar',
            'role' => 'admin',
            'email' => 'admin@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 33 823 45 67',
            'adresse' => 'Préfecture de Police, Dakar',
        ]);

        // Superviseurs
        $superviseur1 = User::create([
            'matricule' => 'SUP001',
            'nom' => 'Diop',
            'prenom' => 'Moussa',
            'grade' => 'Lieutenant',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Thiès',
            'role' => 'superviseur',
            'email' => 'superviseur1@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 33 951 23 45',
            'adresse' => 'Commissariat Central, Thiès',
        ]);

        $superviseur2 = User::create([
            'matricule' => 'SUP002',
            'nom' => 'Sarr',
            'prenom' => 'Fatou',
            'grade' => 'Capitaine',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Saint-Louis',
            'role' => 'superviseur',
            'email' => 'superviseur2@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 33 961 34 56',
            'adresse' => 'Commissariat, Saint-Louis',
        ]);

        $superviseur3 = User::create([
            'matricule' => 'SUP003',
            'nom' => 'Fall',
            'prenom' => 'Ibrahima',
            'grade' => 'Lieutenant',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Kaolack',
            'role' => 'superviseur',
            'email' => 'superviseur3@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 33 941 45 67',
            'adresse' => 'Commissariat, Kaolack',
        ]);

        // Agents
        $agent1 = User::create([
            'matricule' => 'AGT001',
            'nom' => 'Ba',
            'prenom' => 'Cheikh',
            'grade' => 'Brigadier',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Dakar',
            'role' => 'agent',
            'email' => 'agent1@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 77 123 45 67',
            'adresse' => 'Point E, Dakar',
            'specialites' => ['agression', 'vol', 'accident'],
            'experience' => 8,
            'charge_travail' => 2,
            'distance_max' => 15,
            'taux_reussite' => 92.5,
            'temps_moyen_intervention' => 18,
        ]);

        $agent2 = User::create([
            'matricule' => 'AGT002',
            'nom' => 'Diallo',
            'prenom' => 'Aïcha',
            'grade' => 'Garde de la Paix',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Thiès',
            'role' => 'agent',
            'email' => 'agent2@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 77 234 56 78',
            'adresse' => 'Centre-ville, Thiès',
            'specialites' => ['incendie', 'accident'],
            'experience' => 5,
            'charge_travail' => 1,
            'distance_max' => 12,
            'taux_reussite' => 88.0,
            'temps_moyen_intervention' => 22,
        ]);

        $agent3 = User::create([
            'matricule' => 'AGT003',
            'nom' => 'Gueye',
            'prenom' => 'Mamadou',
            'grade' => 'Brigadier-Chef',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Saint-Louis',
            'role' => 'agent',
            'email' => 'agent3@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 77 345 67 89',
            'adresse' => 'Île de Ndar, Saint-Louis',
            'specialites' => ['agression', 'vol'],
            'experience' => 12,
            'charge_travail' => 0,
            'distance_max' => 20,
            'taux_reussite' => 95.0,
            'temps_moyen_intervention' => 15,
        ]);

        $agent4 = User::create([
            'matricule' => 'AGT004',
            'nom' => 'Seck',
            'prenom' => 'Aminata',
            'grade' => 'Brigadier',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Kaolack',
            'role' => 'agent',
            'email' => 'agent4@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 77 456 78 90',
            'adresse' => 'Centre-ville, Kaolack',
            'specialites' => ['incendie', 'agression'],
            'experience' => 6,
            'charge_travail' => 1,
            'distance_max' => 18,
            'taux_reussite' => 90.0,
            'temps_moyen_intervention' => 20,
        ]);

        $agent5 = User::create([
            'matricule' => 'AGT005',
            'nom' => 'Cissé',
            'prenom' => 'Ousmane',
            'grade' => 'Garde de la Paix',
            'unite' => 'Brigade de Sécurité',
            'secteur' => 'Ziguinchor',
            'role' => 'agent',
            'email' => 'agent5@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 77 567 89 01',
            'adresse' => 'Centre-ville, Ziguinchor',
            'specialites' => ['vol', 'accident'],
            'experience' => 4,
            'charge_travail' => 0,
            'distance_max' => 25,
            'taux_reussite' => 85.0,
            'temps_moyen_intervention' => 25,
        ]);

        // Citoyens
        $citoyen1 = User::create([
            'matricule' => 'CIT001',
            'nom' => 'Ndiaye',
            'prenom' => 'Fatima',
            'grade' => 'Citoyen',
            'unite' => 'Public',
            'secteur' => 'Dakar',
            'role' => 'citoyen',
            'email' => 'citoyen1@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 78 123 45 67',
            'adresse' => 'Almadies, Dakar',
        ]);

        $citoyen2 = User::create([
            'matricule' => 'CIT002',
            'nom' => 'Sow',
            'prenom' => 'Moussa',
            'grade' => 'Citoyen',
            'unite' => 'Public',
            'secteur' => 'Thiès',
            'role' => 'citoyen',
            'email' => 'citoyen2@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 78 234 56 78',
            'adresse' => 'Centre-ville, Thiès',
        ]);

        $citoyen3 = User::create([
            'matricule' => 'CIT003',
            'nom' => 'Diagne',
            'prenom' => 'Khadija',
            'grade' => 'Citoyen',
            'unite' => 'Public',
            'secteur' => 'Saint-Louis',
            'role' => 'citoyen',
            'email' => 'citoyen3@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 78 345 67 89',
            'adresse' => 'Guet Ndar, Saint-Louis',
        ]);

        $citoyen4 = User::create([
            'matricule' => 'CIT004',
            'nom' => 'Faye',
            'prenom' => 'Amadou',
            'grade' => 'Citoyen',
            'unite' => 'Public',
            'secteur' => 'Kaolack',
            'role' => 'citoyen',
            'email' => 'citoyen4@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 78 456 78 90',
            'adresse' => 'Ndiaffate, Kaolack',
        ]);

        $citoyen5 = User::create([
            'matricule' => 'CIT005',
            'nom' => 'Mbaye',
            'prenom' => 'Aïda',
            'grade' => 'Citoyen',
            'unite' => 'Public',
            'secteur' => 'Ziguinchor',
            'role' => 'citoyen',
            'email' => 'citoyen5@alertsec.com',
            'password' => Hash::make('password'),
            'statut' => 'actif',
            'telephone' => '+221 78 567 89 01',
            'adresse' => 'Centre-ville, Ziguinchor',
        ]);

        // Créer des zones de danger
        $zone1 = ZoneDanger::create([
            'nom' => 'Centre-ville Dakar',
            'latitude_centre' => 14.6937,
            'longitude_centre' => -17.4441,
            'rayon' => 500,
            'type' => 'critical',
            'niveau_risque' => 85,
            'nombre_alertes' => 15,
            'population' => 2500,
            'dernier_incident' => now()->subHours(2),
            'facteurs_risque' => ['Vols fréquents', 'Trafic dense', 'Foule importante'],
            'recommandations' => ['Augmenter les patrouilles', 'Éclairage public renforcé', 'Caméras de surveillance'],
        ]);

        $zone2 = ZoneDanger::create([
            'nom' => 'Marché Sandaga',
            'latitude_centre' => 14.6760,
            'longitude_centre' => -17.4574,
            'rayon' => 300,
            'type' => 'medium',
            'niveau_risque' => 65,
            'nombre_alertes' => 8,
            'population' => 1200,
            'dernier_incident' => now()->subDays(1),
            'facteurs_risque' => ['Éclairage insuffisant', 'Foule dense'],
            'recommandations' => ['Patrouilles régulières', 'Surveillance renforcée'],
        ]);

        $zone3 = ZoneDanger::create([
            'nom' => 'Almadies',
            'latitude_centre' => 14.7167,
            'longitude_centre' => -17.5000,
            'rayon' => 400,
            'type' => 'safe',
            'niveau_risque' => 25,
            'nombre_alertes' => 2,
            'population' => 800,
            'dernier_incident' => now()->subDays(7),
            'facteurs_risque' => ['Quartier résidentiel calme'],
            'recommandations' => ['Surveillance préventive'],
        ]);

        $zone4 = ZoneDanger::create([
            'nom' => 'Centre-ville Thiès',
            'latitude_centre' => 14.7886,
            'longitude_centre' => -16.9260,
            'rayon' => 350,
            'type' => 'medium',
            'niveau_risque' => 55,
            'nombre_alertes' => 6,
            'population' => 1500,
            'dernier_incident' => now()->subDays(2),
            'facteurs_risque' => ['Trafic important', 'Zones commerciales'],
            'recommandations' => ['Patrouilles régulières', 'Amélioration éclairage'],
        ]);

        $zone5 = ZoneDanger::create([
            'nom' => 'Île de Ndar - Saint-Louis',
            'latitude_centre' => 16.0229,
            'longitude_centre' => -16.4902,
            'rayon' => 200,
            'type' => 'safe',
            'niveau_risque' => 30,
            'nombre_alertes' => 3,
            'population' => 600,
            'dernier_incident' => now()->subDays(5),
            'facteurs_risque' => ['Zone historique', 'Tourisme'],
            'recommandations' => ['Surveillance touristique'],
        ]);

        $zone6 = ZoneDanger::create([
            'nom' => 'Centre-ville Kaolack',
            'latitude_centre' => 14.1517,
            'longitude_centre' => -16.0753,
            'rayon' => 400,
            'type' => 'medium',
            'niveau_risque' => 60,
            'nombre_alertes' => 7,
            'population' => 1800,
            'dernier_incident' => now()->subHours(8),
            'facteurs_risque' => ['Zone commerciale', 'Marché central'],
            'recommandations' => ['Patrouilles marchés', 'Surveillance renforcée'],
        ]);

        $zone7 = ZoneDanger::create([
            'nom' => 'Centre-ville Ziguinchor',
            'latitude_centre' => 12.5833,
            'longitude_centre' => -16.2719,
            'rayon' => 300,
            'type' => 'medium',
            'niveau_risque' => 45,
            'nombre_alertes' => 4,
            'population' => 1000,
            'dernier_incident' => now()->subDays(3),
            'facteurs_risque' => ['Zone frontalière', 'Trafic fluvial'],
            'recommandations' => ['Contrôle frontière', 'Patrouilles fluviales'],
        ]);

        // Créer des signalements
        $signalement1 = Signalement::create([
            'citoyen_id' => $citoyen1->id,
            'description' => 'Vol à l\'arraché au marché Sandaga',
            'niveau' => 'danger-critical',
            'status' => 'en cours',
            'type' => 'vol',
            'priorite' => 'critique',
            'latitude' => 14.6760,
            'longitude' => -17.4574,
            'adresse' => 'Marché Sandaga, Dakar',
            'heure' => '14:30:00',
            'date_signalement' => now()->subHours(2),
            'agent_assigne_id' => $agent1->id,
            'date_assignation' => now()->subHours(1),
            'contact' => ['telephone' => '+221 78 123 45 67'],
            'medias' => ['photos' => ['photo1.jpg'], 'videos' => [], 'audios' => []],
        ]);

        $signalement2 = Signalement::create([
            'citoyen_id' => $citoyen2->id,
            'description' => 'Accident de voiture sur la route nationale',
            'niveau' => 'danger-critical',
            'status' => 'en cours',
            'type' => 'accident',
            'priorite' => 'haute',
            'latitude' => 14.7886,
            'longitude' => -16.9260,
            'adresse' => 'Route Nationale, Thiès',
            'heure' => '16:45:00',
            'date_signalement' => now()->subMinutes(30),
            'agent_assigne_id' => $agent2->id,
            'date_assignation' => now()->subMinutes(20),
            'contact' => ['telephone' => '+221 78 234 56 78'],
            'medias' => ['photos' => [], 'videos' => ['accident.mp4'], 'audios' => []],
        ]);

        $signalement3 = Signalement::create([
            'citoyen_id' => $citoyen3->id,
            'description' => 'Bagarre dans un bar à Saint-Louis',
            'niveau' => 'danger-medium',
            'status' => 'non traité',
            'type' => 'agression',
            'priorite' => 'moyenne',
            'latitude' => 16.0229,
            'longitude' => -16.4902,
            'adresse' => 'Bar du Port, Saint-Louis',
            'heure' => '22:15:00',
            'date_signalement' => now()->subMinutes(10),
            'contact' => ['telephone' => '+221 78 345 67 89'],
            'medias' => ['photos' => [], 'videos' => [], 'audios' => ['audio1.mp3']],
        ]);

        $signalement4 = Signalement::create([
            'citoyen_id' => $citoyen4->id,
            'description' => 'Incendie dans un magasin au centre-ville',
            'niveau' => 'danger-critical',
            'status' => 'en cours',
            'type' => 'incendie',
            'priorite' => 'critique',
            'latitude' => 14.1517,
            'longitude' => -16.0753,
            'adresse' => 'Centre-ville, Kaolack',
            'heure' => '10:20:00',
            'date_signalement' => now()->subMinutes(45),
            'agent_assigne_id' => $agent4->id,
            'date_assignation' => now()->subMinutes(35),
            'contact' => ['telephone' => '+221 78 456 78 90'],
            'medias' => ['photos' => ['incendie1.jpg', 'incendie2.jpg'], 'videos' => ['incendie.mp4'], 'audios' => []],
        ]);

        $signalement5 = Signalement::create([
            'citoyen_id' => $citoyen5->id,
            'description' => 'Vol de moto à Ziguinchor',
            'niveau' => 'danger-medium',
            'status' => 'traité',
            'type' => 'vol',
            'priorite' => 'haute',
            'latitude' => 12.5833,
            'longitude' => -16.2719,
            'adresse' => 'Centre-ville, Ziguinchor',
            'heure' => '08:15:00',
            'date_signalement' => now()->subHours(5),
            'agent_assigne_id' => $agent5->id,
            'date_assignation' => now()->subHours(4),
            'date_traitement' => now()->subHours(2),
            'contact' => ['telephone' => '+221 78 567 89 01'],
            'medias' => ['photos' => ['moto_vol.jpg'], 'videos' => [], 'audios' => []],
            'notes_agent' => 'Moto récupérée, suspect arrêté',
        ]);

        // Créer des positions de tracking pour les agents
        AgentTracking::create([
            'agent_id' => $agent1->id,
            'latitude' => 14.6760,
            'longitude' => -17.4574,
            'vitesse' => 5.2,
            'direction' => 45.0,
            'batterie' => 85,
            'is_online' => true,
            'derniere_activite' => now()->subMinutes(5),
            'signalement_id' => $signalement1->id,
            'debut_mission' => now()->subHours(1),
            'fin_mission_prevue' => now()->addHours(1),
        ]);

        AgentTracking::create([
            'agent_id' => $agent2->id,
            'latitude' => 14.7886,
            'longitude' => -16.9260,
            'vitesse' => 8.1,
            'direction' => 120.0,
            'batterie' => 72,
            'is_online' => true,
            'derniere_activite' => now()->subMinutes(2),
            'signalement_id' => $signalement2->id,
            'debut_mission' => now()->subMinutes(20),
            'fin_mission_prevue' => now()->addMinutes(100),
        ]);

        AgentTracking::create([
            'agent_id' => $agent3->id,
            'latitude' => 16.0229,
            'longitude' => -16.4902,
            'vitesse' => 0.0,
            'direction' => 0.0,
            'batterie' => 95,
            'is_online' => true,
            'derniere_activite' => now()->subMinutes(1),
        ]);

        AgentTracking::create([
            'agent_id' => $agent4->id,
            'latitude' => 14.1517,
            'longitude' => -16.0753,
            'vitesse' => 12.5,
            'direction' => 90.0,
            'batterie' => 88,
            'is_online' => true,
            'derniere_activite' => now()->subMinutes(2),
            'signalement_id' => $signalement4->id,
            'debut_mission' => now()->subMinutes(35),
            'fin_mission_prevue' => now()->addMinutes(85),
        ]);

        AgentTracking::create([
            'agent_id' => $agent5->id,
            'latitude' => 12.5833,
            'longitude' => -16.2719,
            'vitesse' => 0.0,
            'direction' => 0.0,
            'batterie' => 95,
            'is_online' => true,
            'derniere_activite' => now()->subMinutes(15),
        ]);

        // Créer des communications
        \App\Models\Communication::create([
            'signalement_id' => $signalement1->id,
            'user_id' => $citoyen1->id,
            'type' => 'message',
            'contenu' => 'Le voleur était un homme de grande taille, vêtu d\'une djellaba noire. Il a pris ma direction vers la rue 10.',
            'envoyeur' => 'citoyen',
            'lu' => true,
        ]);

        \App\Models\Communication::create([
            'signalement_id' => $signalement1->id,
            'user_id' => $agent1->id,
            'type' => 'message',
            'contenu' => 'Merci pour ces précisions. Je suis en route, j\'arrive dans 5 minutes.',
            'envoyeur' => 'agent',
            'lu' => false,
        ]);

        \App\Models\Communication::create([
            'signalement_id' => $signalement2->id,
            'user_id' => $citoyen2->id,
            'type' => 'message',
            'contenu' => 'Il y a des blessés graves. Il faut venir rapidement avec une ambulance.',
            'envoyeur' => 'citoyen',
            'lu' => true,
        ]);

        \App\Models\Communication::create([
            'signalement_id' => $signalement2->id,
            'user_id' => $agent2->id,
            'type' => 'message',
            'contenu' => 'Ambulance appelée. J\'arrive avec les secours.',
            'envoyeur' => 'agent',
            'lu' => false,
        ]);

        \App\Models\Communication::create([
            'signalement_id' => $signalement4->id,
            'user_id' => $citoyen4->id,
            'type' => 'message',
            'contenu' => 'L\'incendie se propage rapidement. Il y a du gaz dans le magasin.',
            'envoyeur' => 'citoyen',
            'lu' => true,
        ]);

        // Créer des notifications
        \App\Models\Notification::create([
            'user_id' => $superviseur1->id,
            'titre' => 'Nouveau signalement critique à Thiès',
            'message' => 'Un signalement de vol a été créé au marché Sandaga',
            'type' => 'error',
            'donnees' => ['signalement_id' => $signalement1->id],
            'action_url' => "/signalements/{$signalement1->id}",
        ]);

        \App\Models\Notification::create([
            'user_id' => $agent1->id,
            'titre' => 'Mission assignée - Dakar',
            'message' => 'Un nouveau signalement de vol vous a été assigné au marché Sandaga',
            'type' => 'info',
            'donnees' => ['signalement_id' => $signalement1->id],
            'action_url' => "/signalements/{$signalement1->id}",
        ]);

        \App\Models\Notification::create([
            'user_id' => $superviseur2->id,
            'titre' => 'Accident grave à Thiès',
            'message' => 'Accident de voiture avec blessés sur la route nationale',
            'type' => 'error',
            'donnees' => ['signalement_id' => $signalement2->id],
            'action_url' => "/signalements/{$signalement2->id}",
        ]);

        \App\Models\Notification::create([
            'user_id' => $agent2->id,
            'titre' => 'Mission urgente - Thiès',
            'message' => 'Accident de voiture assigné - intervention immédiate requise',
            'type' => 'warning',
            'donnees' => ['signalement_id' => $signalement2->id],
            'action_url' => "/signalements/{$signalement2->id}",
        ]);

        \App\Models\Notification::create([
            'user_id' => $superviseur3->id,
            'titre' => 'Incendie critique à Kaolack',
            'message' => 'Incendie dans un magasin au centre-ville - risque d\'explosion',
            'type' => 'error',
            'donnees' => ['signalement_id' => $signalement4->id],
            'action_url' => "/signalements/{$signalement4->id}",
        ]);

        $this->command->info('Données de test créées avec succès !');
        $this->command->info('Comptes de test :');
        $this->command->info('Admin: admin@alertsec.com / password');
        $this->command->info('Superviseur: superviseur1@alertsec.com / password');
        $this->command->info('Agent: agent1@alertsec.com / password');
        $this->command->info('Citoyen: citoyen1@alertsec.com / password');
    }
}
