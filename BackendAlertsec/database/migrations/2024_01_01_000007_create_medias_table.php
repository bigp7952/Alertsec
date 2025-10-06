<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('signalement_id')->constrained()->onDelete('cascade');
            $table->string('nom_fichier');
            $table->string('chemin_fichier');
            $table->string('type_mime');
            $table->enum('type_media', ['photo', 'video', 'audio']);
            $table->integer('taille_fichier'); // en bytes
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('date_capture')->nullable();
            
            // Métadonnées
            $table->json('metadonnees')->nullable(); // EXIF, durée vidéo, etc.
            
            $table->timestamps();
            
            // Index
            $table->index(['signalement_id', 'type_media']);
            $table->index(['date_capture', 'type_media']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medias');
    }
};





