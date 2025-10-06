<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Signalement;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class MediaService
{
    /**
     * Uploader un fichier média
     */
    public function uploadMedia(UploadedFile $file, $signalementId, $type = null)
    {
        try {
            // Déterminer le type de média
            $mediaType = $type ?? $this->determineMediaType($file->getMimeType());
            
            // Générer un nom de fichier unique
            $filename = $this->generateUniqueFilename($file, $mediaType);
            
            // Déterminer le chemin de stockage
            $storagePath = $this->getStoragePath($mediaType, $signalementId);
            $fullPath = $storagePath . '/' . $filename;
            
            // Optimiser et sauvegarder le fichier
            $savedPath = $this->saveFile($file, $fullPath, $mediaType);
            
            // Créer l'enregistrement en base
            $media = Media::create([
                'signalement_id' => $signalementId,
                'nom_fichier' => $filename,
                'chemin' => $savedPath,
                'type' => $mediaType,
                'taille' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_at' => now()
            ]);

            Log::info('Média uploadé avec succès', [
                'media_id' => $media->id,
                'signalement_id' => $signalementId,
                'type' => $mediaType,
                'size' => $file->getSize()
            ]);

            return $media;

        } catch (\Exception $e) {
            Log::error('Erreur upload média', [
                'signalement_id' => $signalementId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Uploader plusieurs fichiers
     */
    public function uploadMultipleMedia(array $files, $signalementId)
    {
        $uploadedMedia = [];
        
        foreach ($files as $file) {
            $uploadedMedia[] = $this->uploadMedia($file, $signalementId);
        }
        
        return $uploadedMedia;
    }

    /**
     * Obtenir les médias d'un signalement
     */
    public function getSignalementMedia($signalementId)
    {
        return Media::where('signalement_id', $signalementId)
            ->orderBy('uploaded_at', 'asc')
            ->get()
            ->groupBy('type');
    }

    /**
     * Obtenir l'URL d'accès à un média
     */
    public function getMediaUrl($mediaId)
    {
        $media = Media::find($mediaId);
        if (!$media) {
            return null;
        }

        if (Storage::exists($media->chemin)) {
            return Storage::url($media->chemin);
        }

        return null;
    }

    /**
     * Supprimer un média
     */
    public function deleteMedia($mediaId)
    {
        $media = Media::find($mediaId);
        if (!$media) {
            return false;
        }

        try {
            // Supprimer le fichier du stockage
            if (Storage::exists($media->chemin)) {
                Storage::delete($media->chemin);
            }

            // Supprimer l'enregistrement en base
            $media->delete();

            Log::info('Média supprimé', ['media_id' => $mediaId]);
            return true;

        } catch (\Exception $e) {
            Log::error('Erreur suppression média', [
                'media_id' => $mediaId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Optimiser une image
     */
    public function optimizeImage($file, $maxWidth = 1920, $maxHeight = 1080, $quality = 85)
    {
        try {
            $image = Image::make($file);
            
            // Redimensionner si nécessaire
            if ($image->width() > $maxWidth || $image->height() > $maxHeight) {
                $image->resize($maxWidth, $maxHeight, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Optimiser la qualité
            $image->encode('jpg', $quality);

            return $image->stream();

        } catch (\Exception $e) {
            Log::error('Erreur optimisation image', ['error' => $e->getMessage()]);
            return $file->getContent();
        }
    }

    /**
     * Créer une miniature d'image
     */
    public function createThumbnail($mediaId, $width = 300, $height = 200)
    {
        $media = Media::find($mediaId);
        if (!$media || $media->type !== 'photo') {
            return null;
        }

        try {
            $thumbnailPath = str_replace('.jpg', '_thumb.jpg', $media->chemin);
            
            if (Storage::exists($media->chemin)) {
                $image = Image::make(Storage::get($media->chemin));
                $image->resize($width, $height, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
                
                $thumbnailContent = $image->encode('jpg', 80);
                Storage::put($thumbnailPath, $thumbnailContent);

                // Mettre à jour le média avec le chemin de la miniature
                $media->update(['thumbnail_path' => $thumbnailPath]);

                return Storage::url($thumbnailPath);
            }

        } catch (\Exception $e) {
            Log::error('Erreur création miniature', [
                'media_id' => $mediaId,
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Obtenir les statistiques des médias
     */
    public function getMediaStats()
    {
        $totalMedia = Media::count();
        $photosCount = Media::where('type', 'photo')->count();
        $videosCount = Media::where('type', 'video')->count();
        $audiosCount = Media::where('type', 'audio')->count();
        
        $totalSize = Media::sum('taille');
        
        return [
            'total' => $totalMedia,
            'photos' => $photosCount,
            'videos' => $videosCount,
            'audios' => $audiosCount,
            'total_size_mb' => round($totalSize / (1024 * 1024), 2)
        ];
    }

    /**
     * Nettoyer les anciens médias
     */
    public function cleanupOldMedia($days = 90)
    {
        $cutoffDate = now()->subDays($days);
        
        $oldMedia = Media::where('uploaded_at', '<', $cutoffDate)
            ->whereDoesntHave('signalement', function ($query) {
                $query->where('created_at', '>', now()->subDays(30));
            })
            ->get();

        $deletedCount = 0;
        
        foreach ($oldMedia as $media) {
            if ($this->deleteMedia($media->id)) {
                $deletedCount++;
            }
        }

        Log::info('Nettoyage médias anciens', [
            'deleted_count' => $deletedCount,
            'days_threshold' => $days
        ]);

        return $deletedCount;
    }

    /**
     * Exporter les médias d'un signalement
     */
    public function exportSignalementMedia($signalementId)
    {
        $media = $this->getSignalementMedia($signalementId);
        
        if ($media->isEmpty()) {
            return null;
        }

        $exportData = [];
        
        foreach ($media as $type => $files) {
            foreach ($files as $file) {
                $exportData[] = [
                    'id' => $file->id,
                    'type' => $file->type,
                    'filename' => $file->nom_fichier,
                    'url' => $this->getMediaUrl($file->id),
                    'size' => $file->taille,
                    'uploaded_at' => $file->uploaded_at
                ];
            }
        }

        return $exportData;
    }

    // Méthodes privées utilitaires

    private function determineMediaType($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'photo';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }
        
        return 'autre';
    }

    private function generateUniqueFilename(UploadedFile $file, $type)
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('Y-m-d_H-i-s');
        $randomString = Str::random(8);
        
        return "{$type}_{$timestamp}_{$randomString}.{$extension}";
    }

    private function getStoragePath($type, $signalementId)
    {
        return "medias/{$type}/signalement_{$signalementId}/" . now()->format('Y/m');
    }

    private function saveFile(UploadedFile $file, $path, $type)
    {
        $content = $file->getContent();
        
        // Optimiser les images
        if ($type === 'photo' && in_array($file->getMimeType(), ['image/jpeg', 'image/png'])) {
            $content = $this->optimizeImage($file);
        }
        
        Storage::put($path, $content);
        
        return $path;
    }

    /**
     * Valider un fichier média
     */
    public function validateMediaFile(UploadedFile $file)
    {
        $allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/avi',
            'video/mov',
            'audio/mpeg',
            'audio/wav',
            'audio/mp3'
        ];

        $maxSize = 10 * 1024 * 1024; // 10MB

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('Type de fichier non autorisé');
        }

        if ($file->getSize() > $maxSize) {
            throw new \Exception('Fichier trop volumineux (max 10MB)');
        }

        return true;
    }

    /**
     * Obtenir les métadonnées d'un média
     */
    public function getMediaMetadata($mediaId)
    {
        $media = Media::find($mediaId);
        if (!$media) {
            return null;
        }

        $metadata = [
            'id' => $media->id,
            'filename' => $media->nom_fichier,
            'type' => $media->type,
            'size' => $media->taille,
            'mime_type' => $media->mime_type,
            'uploaded_at' => $media->uploaded_at,
            'url' => $this->getMediaUrl($media->id)
        ];

        // Ajouter des métadonnées spécifiques selon le type
        if ($media->type === 'photo' && Storage::exists($media->chemin)) {
            try {
                $image = Image::make(Storage::get($media->chemin));
                $metadata['dimensions'] = [
                    'width' => $image->width(),
                    'height' => $image->height()
                ];
            } catch (\Exception $e) {
                // Ignorer les erreurs de métadonnées
            }
        }

        return $metadata;
    }
}





