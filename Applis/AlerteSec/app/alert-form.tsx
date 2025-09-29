import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
  surface: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

interface AlertFormData {
  type: 'security' | 'medical' | 'traffic' | 'fire' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
  };
  photo?: string;
}

export default function AlertFormScreen() {
  // États du formulaire
  const [formData, setFormData] = useState<AlertFormData>({
    type: 'security',
    severity: 'medium',
    title: '',
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
    },
    photo: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPermission, setPhotoPermission] = useState<boolean | null>(null);

  // Animations
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Types d'alertes rapides
  const alertTypes = [
    { id: 'security', name: 'Sécurité', icon: 'shield', color: COLORS.error },
    { id: 'medical', name: 'Médical', icon: 'medical', color: COLORS.critical },
    { id: 'traffic', name: 'Circulation', icon: 'car', color: COLORS.warning },
    { id: 'fire', name: 'Incendie', icon: 'flame', color: COLORS.error },
    { id: 'other', name: 'Autre', icon: 'ellipsis-horizontal', color: COLORS.textLight },
  ];

  const severityLevels = [
    { id: 'low', name: 'Faible', color: COLORS.success },
    { id: 'medium', name: 'Moyen', color: COLORS.warning },
    { id: 'high', name: 'Élevé', color: COLORS.error },
    { id: 'critical', name: 'Critique', color: COLORS.critical },
  ];

  useEffect(() => {
    initializeLocation();
    requestPhotoPermission();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          },
        }));
      }
    } catch (error) {
      console.error('Erreur localisation:', error);
    }
  };

  const requestPhotoPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPhotoPermission(status === 'granted');
    } catch (error) {
      console.error('Erreur permission photo:', error);
    }
  };

  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, type: type as any }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSeveritySelect = (severity: string) => {
    setFormData(prev => ({ ...prev, severity: severity as any }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePhotoPicker = async () => {
    if (!photoPermission) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Erreur sélection photo:', error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Erreur caméra:', error);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: undefined }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir le titre et la description');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Alerte envoyée',
        'Votre signalement a été transmis aux forces de l\'ordre',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header compact */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Alerte</Text>
          <View style={styles.headerSpacer} />
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type d'alerte - Compact */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Type d'alerte</Text>
          <View style={styles.typeGrid}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  formData.type === type.id && styles.typeButtonActive,
                  { borderColor: formData.type === type.id ? type.color : COLORS.border },
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={formData.type === type.id ? type.color : COLORS.textLight}
                />
                <Text
                  style={[
                    styles.typeText,
                    formData.type === type.id && { color: type.color },
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Niveau de gravité - Compact */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Niveau de gravité</Text>
          <View style={styles.severityContainer}>
            {severityLevels.map((severity) => (
              <TouchableOpacity
                key={severity.id}
                style={[
                  styles.severityButton,
                  formData.severity === severity.id && styles.severityButtonActive,
                  { backgroundColor: formData.severity === severity.id ? severity.color : COLORS.surface },
                ]}
                onPress={() => handleSeveritySelect(severity.id)}
              >
                <Text
                  style={[
                    styles.severityText,
                    { color: formData.severity === severity.id ? COLORS.white : severity.color },
                  ]}
                >
                  {severity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Formulaire principal */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Détails de l'alerte</Text>
            
            {/* Titre */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Titre *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Résumé de la situation"
                placeholderTextColor={COLORS.textLight}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                maxLength={50}
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Décrivez la situation en détail"
                placeholderTextColor={COLORS.textLight}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            {/* Photo optionnelle */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Photo (optionnelle)</Text>
              {formData.photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={handleCameraCapture}>
                    <Ionicons name="camera" size={20} color={COLORS.primary} />
                    <Text style={styles.photoButtonText}>Caméra</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={handlePhotoPicker}>
                    <Ionicons name="image" size={20} color={COLORS.primary} />
                    <Text style={styles.photoButtonText}>Galerie</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Bouton d'envoi */}
        <Animated.View
          style={[
            styles.submitContainer,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            <LinearGradient
              colors={isFormValid ? [COLORS.primary, COLORS.primaryDark] : [COLORS.textLight, COLORS.textLight]}
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.submitText}>Envoi en cours...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                  <Text style={styles.submitText}>Envoyer l'alerte</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    gap: 6,
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  severityButtonActive: {
    borderColor: COLORS.transparent,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  photoContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});