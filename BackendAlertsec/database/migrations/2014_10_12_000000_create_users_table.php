<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('grade');
            $table->string('unite');
            $table->string('secteur');
            $table->enum('role', ['admin', 'superviseur', 'agent', 'operateur', 'citoyen']);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('code_service')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamp('derniere_connexion')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'suspendu'])->default('actif');
            
            // Informations de contact
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            
            // Informations pour les agents
            $table->json('specialites')->nullable(); // Types de signalements qu'ils peuvent traiter
            $table->integer('experience')->nullable(); // Années d'expérience
            $table->integer('charge_travail')->default(0); // Nombre de signalements en cours
            $table->integer('distance_max')->default(10); // Distance maximale pour assignation (km)
            $table->decimal('taux_reussite', 5, 2)->nullable(); // Taux de réussite en %
            $table->integer('temps_moyen_intervention')->nullable(); // Temps moyen d'intervention en minutes
            
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
