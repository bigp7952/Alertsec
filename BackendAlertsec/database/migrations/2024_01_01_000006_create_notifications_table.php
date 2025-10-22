<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titre');
            $table->text('message');
            $table->enum('type', ['info', 'warning', 'error', 'success']);
            $table->boolean('lu')->default(false);
            $table->timestamp('date_lecture')->nullable();
            
            // Données additionnelles
            $table->json('donnees')->nullable(); // données spécifiques à la notification
            $table->string('action_url')->nullable(); // URL vers l'action à effectuer
            
            $table->timestamps();
            
            // Index
            $table->index(['user_id', 'lu']);
            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};










