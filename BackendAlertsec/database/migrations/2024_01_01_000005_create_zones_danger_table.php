<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones_danger', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->decimal('latitude_centre', 10, 8);
            $table->decimal('longitude_centre', 11, 8);
            $table->integer('rayon'); // en mètres
            $table->enum('type', ['critical', 'medium', 'safe']);
            $table->integer('niveau_risque'); // 0-100
            $table->integer('nombre_alertes');
            $table->integer('population');
            $table->timestamp('dernier_incident');
            $table->json('facteurs_risque'); // array
            $table->json('recommandations'); // array
            $table->json('actions_effectuees')->nullable(); // historique des actions
            
            $table->timestamps();
            
            // Index
            $table->index(['type', 'niveau_risque']);
            $table->index(['dernier_incident', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones_danger');
    }
};





