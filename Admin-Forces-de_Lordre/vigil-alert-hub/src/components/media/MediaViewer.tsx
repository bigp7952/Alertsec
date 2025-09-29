import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Maximize2,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic as AudioIcon,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Signalement } from "@/lib/mock-data"

interface MediaViewerProps {
  signalement: Signalement
}

export default function MediaViewer({ signalement }: MediaViewerProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showAllMedias, setShowAllMedias] = useState(false)

  const allMedias = [
    ...(signalement.medias?.photos || []).map(photo => ({ type: 'photo', url: photo, name: `Photo ${signalement.medias?.photos?.indexOf(photo) + 1}` })),
    ...(signalement.medias?.videos || []).map(video => ({ type: 'video', url: video, name: `Vidéo ${signalement.medias?.videos?.indexOf(video) + 1}` })),
    ...(signalement.medias?.audios || []).map(audio => ({ type: 'audio', url: audio, name: `Audio ${signalement.medias?.audios?.indexOf(audio) + 1}` }))
  ]

  const currentMedia = allMedias[currentMediaIndex]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'photo': return <ImageIcon className="h-4 w-4" />
      case 'video': return <VideoIcon className="h-4 w-4" />
      case 'audio': return <AudioIcon className="h-4 w-4" />
      default: return <ImageIcon className="h-4 w-4" />
    }
  }

  if (!signalement.medias || allMedias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Médias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun média disponible pour ce signalement
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Médias ({allMedias.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllMedias(!showAllMedias)}
            >
              {showAllMedias ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAllMedias ? 'Masquer' : 'Voir tout'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lecteur principal */}
        {currentMedia && (
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden">
              {currentMedia.type === 'photo' && (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <img 
                    src={currentMedia.url} 
                    alt={currentMedia.name}
                    className="max-w-full max-h-64 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                      e.currentTarget.alt = 'Image non disponible'
                    }}
                  />
                </div>
              )}
              
              {currentMedia.type === 'video' && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    className="w-full h-full object-contain"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    muted={isMuted}
                  >
                    <source src={currentMedia.url} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              )}
              
              {currentMedia.type === 'audio' && (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <AudioIcon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{currentMedia.name}</p>
                      <audio 
                        controls
                        className="mt-2"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        muted={isMuted}
                      >
                        <source src={currentMedia.url} type="audio/mpeg" />
                        Votre navigateur ne supporte pas la lecture audio.
                      </audio>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={currentMedia.type === 'photo'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMuteToggle}
                  disabled={currentMedia.type === 'photo'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(currentMedia.url, currentMedia.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMediaIndex(currentMediaIndex - 1)}
                  disabled={currentMediaIndex === 0}
                >
                  Précédent
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {currentMediaIndex + 1} / {allMedias.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMediaIndex(currentMediaIndex + 1)}
                  disabled={currentMediaIndex === allMedias.length - 1}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Liste de tous les médias */}
        {showAllMedias && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tous les médias</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allMedias.map((media, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative border rounded-lg p-2 cursor-pointer transition-colors",
                    currentMediaIndex === index 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setCurrentMediaIndex(index)}
                >
                  <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                    {getMediaIcon(media.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium truncate">{media.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {media.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques des médias */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {signalement.medias?.photos?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Photos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {signalement.medias?.videos?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Vidéos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {signalement.medias?.audios?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Audios</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
