<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('vitesse', 5, 2)->nullable(); // km/h
            $table->decimal('direction', 5, 2)->nullable(); // degrés
            $table->integer('batterie')->nullable(); // pourcentage
            $table->boolean('is_online')->default(true);
            $table->timestamp('derniere_activite');
            
            // Mission en cours
            $table->foreignId('signalement_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('debut_mission')->nullable();
            $table->timestamp('fin_mission_prevue')->nullable();
            
            $table->timestamps();
            
            // Index
            $table->index(['agent_id', 'created_at']);
            $table->index(['is_online', 'derniere_activite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_tracking');
    }
};





