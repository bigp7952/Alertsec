import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, MapPin, Clock, User, Phone, MessageSquare, Camera, Video, Mic, Plus, Filter, Search, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { MediaViewer } from '@/components/media/MediaViewer';
import { AutoAssignment } from '@/components/assignment/AutoAssignment';
import { CommunicationPanel } from '@/components/communication/CommunicationPanel';
import { AgentTracker } from '@/components/tracking/AgentTracker';
import { DangerZones } from '@/components/zones/DangerZones';
import { CreateSignalementForm } from '@/components/forms/CreateSignalementForm';
import { useSignalements, useAgentTracking } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext'
import { type Signalement, type User } from '@/lib/api';

export default function SignalementsPage() {
  const { hasPermission } = useAuth()
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Utiliser les hooks API
  const { 
    signalements, 
    loading: signalementsLoading, 
    error: signalementsError,
    fetchSignalements,
    assignAgent,
    autoAssignAgent,
    updateSignalement,
    deleteSignalement,
  } = useSignalements();

  const { 
    agents, 
    positions, 
    loading: agentsLoading 
  } = useAgentTracking();

  // Fonction pour gérer l'assignation d'agent
  const handleAssignAgent = async (signalementId: number, agentId?: number) => {
    try {
      if (agentId) {
        await assignAgent(signalementId, agentId);
      } else {
        await autoAssignAgent(signalementId);
      }
      // Rafraîchir les données après assignation
      await fetchSignalements();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const handleStatusChange = async (signalementId: number, status: 'en cours' | 'traité') => {
    try {
      await updateSignalement(signalementId, { status });
      await fetchSignalements();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleDelete = async (signalementId: number) => {
    try {
      await deleteSignalement(signalementId);
      await fetchSignalements();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Fonction pour filtrer les signalements
  const filteredSignalements = signalements.filter(signalement => {
    const matchesStatus = filterStatus === 'all' || signalement.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || signalement.priorite === filterPriority;
    const matchesSearch = searchTerm === '' || 
      signalement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signalement.adresse.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Fonction pour obtenir l'icône du niveau de danger
  const getDangerIcon = (niveau: string) => {
    switch (niveau) {
      case 'danger-critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'danger-medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-green-500" />;
    }
  };

  // Fonction pour obtenir la couleur du badge de priorité
  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'critique':
        return 'bg-red-500';
      case 'haute':
        return 'bg-orange-500';
      case 'moyenne':
        return 'bg-yellow-500';
      case 'basse':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fonction pour obtenir la couleur du badge de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en cours':
        return 'bg-blue-500';
      case 'traité':
        return 'bg-green-500';
      case 'non traité':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fonction pour compter les médias
  const getMediaCount = (signalement: Signalement) => {
    if (!signalement.medias) return { photos: 0, videos: 0, audios: 0 };
    
    const medias = typeof signalement.medias === 'string' 
      ? JSON.parse(signalement.medias) 
      : signalement.medias;
    
    return {
      photos: medias.photos?.length || 0,
      videos: medias.videos?.length || 0,
      audios: medias.audios?.length || 0
    };
  };

  if (signalementsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des signalements...</span>
      </div>
    );
  }

  if (signalementsError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erreur lors du chargement des signalements: {signalementsError}</p>
        <Button onClick={fetchSignalements} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton nouveau signalement */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Signalements</h1>
          <p className="text-gray-600">Gestion des signalements et assignation des agents</p>
        </div>
        {hasPermission('edit_signalements') && (
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau signalement
        </Button>
        )}
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="non traité">Non traité</SelectItem>
                  <SelectItem value="en cours">En cours</SelectItem>
                  <SelectItem value="traité">Traité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par description ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>

            <Button onClick={fetchSignalements} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des signalements */}
      <div className="grid gap-4">
        {filteredSignalements.map((signalement) => {
          const mediaCount = getMediaCount(signalement);
          
          return (
            <Card key={signalement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getDangerIcon(signalement.niveau)}
                      <h3 className="font-semibold text-lg">{signalement.type}</h3>
                      <Badge className={getPriorityColor(signalement.priorite)}>
                        {signalement.priorite}
                      </Badge>
                      <Badge className={getStatusColor(signalement.status)}>
                        {signalement.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{signalement.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{signalement.adresse}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(signalement.date_signalement).toLocaleString()}</span>
                      </div>
                      {signalement.agent_assigne && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{signalement.agent_assigne.nom} {signalement.agent_assigne.prenom}</span>
                        </div>
                      )}
                    </div>

                    {/* Indicateurs de médias */}
                    {(mediaCount.photos > 0 || mediaCount.videos > 0 || mediaCount.audios > 0) && (
                      <div className="flex items-center space-x-2 mt-2">
                        {mediaCount.photos > 0 && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Camera className="h-4 w-4" />
                            <span>{mediaCount.photos}</span>
                          </div>
                        )}
                        {mediaCount.videos > 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <Video className="h-4 w-4" />
                            <span>{mediaCount.videos}</span>
                          </div>
                        )}
                        {mediaCount.audios > 0 && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Mic className="h-4 w-4" />
                            <span>{mediaCount.audios}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {hasPermission('view_signalements') && (
                    <Button
                      onClick={() => {
                        setSelectedSignalement(signalement);
                        setShowDetails(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    )}
                    {hasPermission('assign_agents') && (
                    <Button
                      onClick={() => handleAssignAgent(signalement.id)}
                      variant="default"
                      size="sm"
                      disabled={signalement.status === 'traité'}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Assigner
                    </Button>
                    )}
                    {hasPermission('update_status') && signalement.status !== 'en cours' && (
                    <Button
                      onClick={() => handleStatusChange(signalement.id, 'en cours')}
                      variant="secondary"
                      size="sm"
                    >
                      Prendre en charge
                    </Button>
                    )}
                    {hasPermission('update_status') && signalement.status !== 'traité' && (
                    <Button
                      onClick={() => handleStatusChange(signalement.id, 'traité')}
                      variant="outline"
                      size="sm"
                    >
                      Marquer résolu
                    </Button>
                    )}
                    {hasPermission('edit_all') && (
                    <Button
                      onClick={() => handleDelete(signalement.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Supprimer
                    </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Message si aucun signalement */}
      {filteredSignalements.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun signalement trouvé</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de détails du signalement */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du signalement #{selectedSignalement?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedSignalement && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="media">Médias</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="assignment">Assignation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Type:</strong> {selectedSignalement.type}</div>
                      <div><strong>Priorité:</strong> {selectedSignalement.priorite}</div>
                      <div><strong>Statut:</strong> {selectedSignalement.status}</div>
                      <div><strong>Date:</strong> {new Date(selectedSignalement.date_signalement).toLocaleString()}</div>
                      <div><strong>Heure:</strong> {selectedSignalement.heure}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Localisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Adresse:</strong> {selectedSignalement.adresse}</div>
                      <div><strong>Latitude:</strong> {selectedSignalement.latitude}</div>
                      <div><strong>Longitude:</strong> {selectedSignalement.longitude}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSignalement.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <MediaViewer signalement={selectedSignalement} />
              </TabsContent>

              <TabsContent value="communication">
                <CommunicationPanel signalement={selectedSignalement} />
              </TabsContent>

              <TabsContent value="assignment">
                <div className="space-y-4">
                  <AutoAssignment 
                    signalement={selectedSignalement} 
                    agents={agents}
                    onAssign={handleAssignAgent}
                  />
                  <AgentTracker 
                    agents={agents}
                    positions={positions}
                  />
                  <DangerZones />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de création de signalement */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau signalement</DialogTitle>
          </DialogHeader>
          <CreateSignalementForm onClose={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

