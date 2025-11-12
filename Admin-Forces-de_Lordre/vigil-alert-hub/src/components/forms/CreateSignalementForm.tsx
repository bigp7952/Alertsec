import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Save, 
  MapPin, 
  User, 
  AlertTriangle,
  Phone,
  Mail
} from "lucide-react"
import type { Signalement } from "@/lib/mock-data"

interface CreateSignalementFormProps {
  onClose: () => void
  onSubmit: (signalement: Omit<Signalement, 'id' | 'created_at' | 'updated_at'>) => void
  isSubmitting?: boolean
}

export default function CreateSignalementForm({ 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}: CreateSignalementFormProps) {
  const [formData, setFormData] = useState({
    citoyen: '',
    description: '',
    niveau: 'danger-medium' as 'danger-critical' | 'danger-medium' | 'safe-zone',
    type: 'autre' as 'agression' | 'vol' | 'accident' | 'incendie' | 'autre',
    localisation: {
      lat: 14.6937,
      lng: -17.4441,
      nom: ''
    },
    contact: {
      telephone: '',
      email: ''
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.citoyen || !formData.description || !formData.localisation.nom) {
      return
    }

    const newSignalement = {
      ...formData,
      heure: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'non traité' as const,
      priorite: formData.niveau === 'danger-critical' ? 'critique' as const :
                formData.niveau === 'danger-medium' ? 'haute' as const : 'moyenne' as const,
      medias: {
        photos: [],
        videos: [],
        audios: []
      },
      communications: []
    }

    onSubmit(newSignalement)
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const getNiveauLabel = (niveau: string) => {
    switch (niveau) {
      case 'danger-critical': return 'Critique'
      case 'danger-medium': return 'Moyen'
      case 'safe-zone': return 'Sécurisé'
      default: return niveau
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agression': return 'Agression'
      case 'vol': return 'Vol'
      case 'accident': return 'Accident'
      case 'incendie': return 'Incendie'
      case 'autre': return 'Autre'
      default: return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Nouveau Signalement
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du citoyen */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations du citoyen
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet *</label>
                  <Input
                    placeholder="Nom et prénom"
                    value={formData.citoyen}
                    onChange={(e) => handleInputChange('citoyen', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de signalement</label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agression">Agression</SelectItem>
                      <SelectItem value="vol">Vol</SelectItem>
                      <SelectItem value="accident">Accident</SelectItem>
                      <SelectItem value="incendie">Incendie</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    placeholder="+221 77 123 45 67"
                    value={formData.contact.telephone}
                    onChange={(e) => handleInputChange('contact.telephone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Décrivez la situation en détail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse ou lieu *</label>
                <Input
                  placeholder="Ex: Supermarché Auchan, Dakar"
                  value={formData.localisation.nom}
                  onChange={(e) => handleInputChange('localisation.nom', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="14.6937"
                    value={formData.localisation.lat}
                    onChange={(e) => handleInputChange('localisation.lat', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-17.4441"
                    value={formData.localisation.lng}
                    onChange={(e) => handleInputChange('localisation.lng', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Niveau de priorité */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Niveau de priorité</label>
              <div className="flex gap-2">
                {(['danger-critical', 'danger-medium', 'safe-zone'] as const).map((niveau) => (
                  <Button
                    key={niveau}
                    type="button"
                    variant={formData.niveau === niveau ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleInputChange('niveau', niveau)}
                    className="flex-1"
                  >
                    <Badge variant={niveau === 'danger-critical' ? 'destructive' : 
                                   niveau === 'danger-medium' ? 'warning' : 'success'}>
                      {getNiveauLabel(niveau)}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.citoyen || !formData.description || !formData.localisation.nom}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer le signalement
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
















