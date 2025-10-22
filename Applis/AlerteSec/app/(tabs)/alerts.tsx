import { useApp } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Couleurs du thème
const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  critical: '#DC2626',
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceDark: '#1E293B',
  text: '#1E293B',
  textLight: '#64748B',
  textDark: '#F1F5F9',
  border: '#E2E8F0',
  borderDark: '#334155',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  // Couleurs pour les alertes
  emergency: '#DC2626',
  urgent: '#F59E0B',
  normal: '#3B82F6',
};

// Types pour les alertes
interface AlertData {
  id: string;
  type: 'emergency' | 'urgent' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'resolved';
  category: string;
  urgency: 'immediate' | 'urgent' | 'normal';
  estimatedDuration?: string;
  affectedArea?: string;
  additionalInfo?: string;
  responseTime?: number;
  resolutionNotes?: string;
}

export default function AlertsScreen() {
  // Contexte global
  const { userType } = useApp();
  const { signalements, fetchCitizenSignalements, createSignalement, signalementsLoading } = useApi();

  // États
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertData | null>(null);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'normal' as 'immediate' | 'urgent' | 'normal',
  });

  // Refs pour animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Données simulées
  const mockAlerts: AlertData[] = [
    {
      id: '1',
      type: 'emergency',
      severity: 'critical',
      title: 'Accident de circulation',
      description: 'Accident grave sur l\'avenue Bourguiba',
      location: { latitude: 14.7167, longitude: -17.4677, accuracy: 5, address: 'Avenue Bourguiba, Dakar' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'pending',
      category: 'Accident',
      urgency: 'immediate',
      estimatedDuration: '2-3 heures',
      affectedArea: 'Centre-ville',
    },
    {
      id: '2',
      type: 'urgent',
      severity: 'high',
      title: 'Agression signalée',
      description: 'Agression dans le quartier de Mermoz',
      location: { latitude: 14.7200, longitude: -17.4700, accuracy: 8, address: 'Mermoz, Dakar' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'processing',
      category: 'Sécurité',
      urgency: 'urgent',
      estimatedDuration: '1-2 heures',
      affectedArea: 'Mermoz',
    },
    {
      id: '3',
      type: 'normal',
      severity: 'medium',
      title: 'Véhicule en panne',
      description: 'Véhicule bloquant la circulation',
      location: { latitude: 14.7100, longitude: -17.4600, accuracy: 10, address: 'Route de la Corniche, Dakar' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'resolved',
      category: 'Circulation',
      urgency: 'normal',
      estimatedDuration: '30 minutes',
      affectedArea: 'Corniche',
      resolutionNotes: 'Véhicule remorqué par les services de dépannage',
    },
  ];

  useEffect(() => {
    loadRealData();
    startAnimations();
  }, []);

  const loadRealData = async () => {
    try {
      await fetchCitizenSignalements();
      
      // Convertir les signalements en format AlertData
      const convertedAlerts = signalements.map(s => ({
        id: s.id.toString(),
        type: s.priorite === 'critique' ? 'emergency' : s.priorite === 'haute' ? 'urgent' : 'normal',
        severity: s.priorite === 'critique' ? 'critical' : s.priorite === 'haute' ? 'high' : 'medium',
        title: s.type,
        description: s.description,
        location: {
          latitude: s.latitude,
          longitude: s.longitude,
          accuracy: 5,
          address: s.adresse,
        },
        timestamp: new Date(s.date_signalement),
        status: s.status === 'non traité' ? 'pending' : s.status === 'en cours' ? 'processing' : 'resolved',
        category: s.type,
        urgency: s.priorite === 'critique' ? 'immediate' : s.priorite === 'haute' ? 'urgent' : 'normal',
      }));

      setAlerts(convertedAlerts);
      setFilteredAlerts(convertedAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback sur les données simulées
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await loadRealData();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = (filter: 'all' | 'pending' | 'processing' | 'resolved') => {
    setSelectedFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (filter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.status === filter));
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.title.trim() || !newAlert.description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Créer le signalement via l'API
      const signalementData = {
        description: newAlert.description,
        type: newAlert.category || newAlert.title,
        priorite: newAlert.urgency === 'immediate' ? 'critique' : newAlert.urgency === 'urgent' ? 'haute' : 'normale',
        latitude: 14.7167, // Position par défaut
        longitude: -17.4677,
        adresse: 'Position actuelle',
      };

      const newSignalement = await createSignalement(signalementData);

      // Créer l'alerte locale pour l'affichage
      const alert: AlertData = {
        id: newSignalement.id.toString(),
        type: newAlert.urgency === 'immediate' ? 'emergency' : newAlert.urgency === 'urgent' ? 'urgent' : 'normal',
        severity: newAlert.urgency === 'immediate' ? 'critical' : newAlert.urgency === 'urgent' ? 'high' : 'medium',
        title: newAlert.title,
        description: newAlert.description,
        location: { latitude: 14.7167, longitude: -17.4677, accuracy: 5, address: 'Position actuelle' },
        timestamp: new Date(),
        status: 'pending',
        category: newAlert.category,
        urgency: newAlert.urgency,
      };

      const updatedAlerts = [alert, ...alerts];
      setAlerts(updatedAlerts);
      setFilteredAlerts(updatedAlerts);
      setShowCreateModal(false);
      setNewAlert({ title: '', description: '', category: '', urgency: 'normal' });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Votre signalement a été créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      Alert.alert('Erreur', 'Impossible de créer le signalement');
    }
  };

  const handleEditAlert = (alert: AlertData) => {
    setEditingAlert(alert);
    setNewAlert({
      title: alert.title,
      description: alert.description,
      category: alert.category,
      urgency: alert.urgency,
    });
    setShowCreateModal(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlert || !newAlert.title.trim() || !newAlert.description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const updatedAlerts = alerts.map(alert => 
      alert.id === editingAlert.id 
        ? { 
            ...alert, 
            title: newAlert.title,
            description: newAlert.description,
            category: newAlert.category,
            urgency: newAlert.urgency,
            type: newAlert.urgency === 'immediate' ? 'emergency' : newAlert.urgency === 'urgent' ? 'urgent' : 'normal',
            severity: newAlert.urgency === 'immediate' ? 'critical' : newAlert.urgency === 'urgent' ? 'high' : 'medium',
          }
        : alert
    );
    
    setAlerts(updatedAlerts);
    setFilteredAlerts(updatedAlerts);
    setShowCreateModal(false);
    setEditingAlert(null);
    setNewAlert({ title: '', description: '', category: '', urgency: 'normal' });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Succès', 'Votre signalement a été modifié avec succès');
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce signalement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
            setAlerts(updatedAlerts);
            setFilteredAlerts(updatedAlerts);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'processing': return COLORS.primary;
      case 'resolved': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return COLORS.emergency;
      case 'urgent': return COLORS.urgent;
      case 'normal': return COLORS.normal;
      default: return COLORS.textLight;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'urgent': return 'alert-circle';
      case 'normal': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const renderAlertCard = (alert: AlertData) => (
    <Animatable.View
      key={alert.id}
      animation="fadeInUp"
      duration={600}
      style={styles.alertCard}
    >
      <View style={styles.alertCardHeader}>
        <View style={[styles.alertTypeIndicator, { backgroundColor: getTypeColor(alert.type) }]}>
          <Ionicons name={getTypeIcon(alert.type) as any} size={14} color={COLORS.white} />
        </View>
        <View style={styles.alertHeaderInfo}>
          <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
          <Text style={styles.alertTime}>
            {Math.round((Date.now() - alert.timestamp.getTime()) / 60000)}min
          </Text>
        </View>
        <View style={styles.alertActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAlert(alert)}
          >
            <Ionicons name="create" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAlert(alert.id)}
          >
            <Ionicons name="trash" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.alertDescription} numberOfLines={2}>
        {alert.description}
      </Text>
      
      <View style={styles.alertFooter}>
        <View style={styles.alertMeta}>
          <Text style={styles.alertCategory}>{alert.category}</Text>
          <Text style={styles.alertLocation}>{alert.location.address}</Text>
        </View>
        <View style={[styles.alertStatus, { backgroundColor: getStatusColor(alert.status) }]}>
          <Text style={styles.alertStatusText}>{getStatusText(alert.status)}</Text>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Mes Signalements</Text>
            <Text style={styles.subtitle}>{filteredAlerts.length} signalement(s)</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[
            { key: 'all', label: 'Tous' },
            { key: 'pending', label: 'En attente' },
            { key: 'processing', label: 'En cours' },
            { key: 'resolved', label: 'Résolus' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyStateTitle}>Aucun signalement</Text>
            <Text style={styles.emptyStateDescription}>
              {selectedFilter === 'all' 
                ? 'Vous n\'avez pas encore créé de signalement'
                : `Aucun signalement ${selectedFilter === 'pending' ? 'en attente' : selectedFilter === 'processing' ? 'en cours' : 'résolu'}`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Créer un signalement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAlerts.map(renderAlertCard)
        )}
      </ScrollView>

      {/* Modal de création/édition */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setEditingAlert(null);
                setNewAlert({ title: '', description: '', category: '', urgency: 'normal' });
              }}
            >
              <Text style={styles.modalCancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAlert ? 'Modifier le signalement' : 'Nouveau signalement'}
            </Text>
            <TouchableOpacity
              onPress={editingAlert ? handleUpdateAlert : handleCreateAlert}
            >
              <Text style={styles.modalSaveButton}>Enregistrer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre *</Text>
              <TextInput
                style={styles.textInput}
                value={newAlert.title}
                onChangeText={(text) => setNewAlert({ ...newAlert, title: text })}
                placeholder="Titre du signalement"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newAlert.description}
                onChangeText={(text) => setNewAlert({ ...newAlert, description: text })}
                placeholder="Description détaillée"
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catégorie</Text>
              <TextInput
                style={styles.textInput}
                value={newAlert.category}
                onChangeText={(text) => setNewAlert({ ...newAlert, category: text })}
                placeholder="Ex: Accident, Sécurité, Circulation"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Urgence</Text>
              <View style={styles.urgencyButtons}>
                {[
                  { key: 'normal', label: 'Normale', color: COLORS.normal },
                  { key: 'urgent', label: 'Urgente', color: COLORS.urgent },
                  { key: 'immediate', label: 'Immédiate', color: COLORS.emergency },
                ].map((urgency) => (
                  <TouchableOpacity
                    key={urgency.key}
                    style={[
                      styles.urgencyButton,
                      { borderColor: urgency.color },
                      newAlert.urgency === urgency.key && { backgroundColor: urgency.color },
                    ]}
                    onPress={() => setNewAlert({ ...newAlert, urgency: urgency.key as any })}
                  >
                    <Text
                      style={[
                        styles.urgencyButtonText,
                        newAlert.urgency === urgency.key && { color: COLORS.white },
                      ]}
                    >
                      {urgency.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertHeaderInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  alertTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertMeta: {
    flex: 1,
  },
  alertCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  alertStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
});