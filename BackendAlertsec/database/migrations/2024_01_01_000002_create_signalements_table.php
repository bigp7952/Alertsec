<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signalements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citoyen_id')->constrained('users')->onDelete('cascade');
            $table->string('description');
            $table->enum('niveau', ['danger-critical', 'danger-medium', 'safe-zone']);
            $table->enum('status', ['non traité', 'en cours', 'traité'])->default('non traité');
            $table->enum('type', ['agression', 'vol', 'accident', 'incendie', 'autre']);
            $table->enum('priorite', ['critique', 'haute', 'moyenne', 'basse'])->default('moyenne');
            
            // Géolocalisation
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('adresse');
            
            // Heure et date
            $table->time('heure');
            $table->timestamp('date_signalement');
            
            // Agent assigné
            $table->foreignId('agent_assigne_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('date_assignation')->nullable();
            $table->timestamp('date_traitement')->nullable();
            
            // Médias
            $table->json('medias')->nullable(); // {photos: [], videos: [], audios: []}
            
            // Informations de contact du citoyen
            $table->json('contact')->nullable(); // {telephone: '', email: ''}
            
            // Notes et commentaires
            $table->text('notes_agent')->nullable();
            $table->text('notes_superviseur')->nullable();
            
            $table->timestamps();
            
            // Index pour les requêtes fréquentes
            $table->index(['status', 'niveau']);
            $table->index(['agent_assigne_id', 'status']);
            $table->index(['date_signalement', 'niveau']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalements');
    }
};










