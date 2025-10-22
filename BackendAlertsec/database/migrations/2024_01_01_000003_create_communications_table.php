<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('signalement_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['message', 'appel', 'sms']);
            $table->text('contenu');
            $table->enum('envoyeur', ['citoyen', 'agent', 'systeme']);
            $table->boolean('lu')->default(false);
            $table->timestamp('date_lecture')->nullable();
            
            // Pièces jointes
            $table->json('pieces_jointes')->nullable(); // Fichiers audio, images, etc.
            
            $table->timestamps();
            
            // Index
            $table->index(['signalement_id', 'created_at']);
            $table->index(['user_id', 'lu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};










