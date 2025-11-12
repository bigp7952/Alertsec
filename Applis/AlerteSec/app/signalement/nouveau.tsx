import { PrimaryButton } from '@/components/ui/buttons';
import { useApi } from '@/contexts/ApiContext';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const TYPES_SIGNALEMENT = [
  { id: 'agression', label: 'Agression', icon: '👊' },
  { id: 'vol', label: 'Vol', icon: '💰' },
  { id: 'accident', label: 'Accident', icon: '🚗' },
  { id: 'incendie', label: 'Incendie', icon: '🔥' },
  { id: 'autre', label: 'Autre', icon: '⚠️' }
];

const NIVEAUX_GRAVITE = [
  { id: 'critique', label: 'Critique', color: 'bg-danger-500', description: 'Danger immédiat' },
  { id: 'moyen', label: 'Moyen', color: 'bg-warning-500', description: 'Situation préoccupante' },
  { id: 'mineur', label: 'Mineur', color: 'bg-success-500', description: 'Incident léger' }
];

export default function NouveauSignalementScreen() {
  const { createSignalement } = useApi();
  const [type, setType] = useState('');
  const [gravite, setGravite] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La géolocalisation est nécessaire pour créer un signalement.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
  };

  const handleSubmit = async () => {
    if (!type || !gravite) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type et un niveau de gravité.');
      return;
    }

    if (!location) {
      Alert.alert('Erreur', 'Impossible de déterminer votre position. Veuillez réessayer.');
      return;
    }

    setIsLoading(true);

    try {
      // Convertir le type et la gravité au format attendu
      const prioriteMap: { [key: string]: string } = {
        'critique': 'critique',
        'moyen': 'haute',
        'mineur': 'moyenne'
      };

      const signalementData = {
        description: description || `Signalement de type ${type}`,
        type: type,
        priorite: prioriteMap[gravite] || 'moyenne',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        adresse: `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}`
      };

      // Créer le signalement via le contexte
      await createSignalement(signalementData);

      setIsLoading(false);
      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été transmis aux forces de l\'ordre.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer le signalement. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="pt-12 pb-6 px-6 bg-white border-b border-neutral-200">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-neutral-600 text-base">← Retour</Text>
          </TouchableOpacity>
          
          <Text className="text-2xl font-bold text-neutral-800 mb-2">
            Nouveau signalement
          </Text>
          <Text className="text-sm text-neutral-600">
            Décrivez la situation pour alerter les forces de l'ordre
          </Text>
        </View>

        <View className="flex-1 px-6 pt-6">
          
          {/* Type de signalement */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Type de signalement *
            </Text>
            
            <View className="flex-row flex-wrap gap-3">
              {TYPES_SIGNALEMENT.map((typeItem) => (
                <TouchableOpacity
                  key={typeItem.id}
                  onPress={() => setType(typeItem.id)}
                  className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
                    type === typeItem.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <Text className="text-lg mr-2">{typeItem.icon}</Text>
                  <Text className={`font-medium ${
                    type === typeItem.id ? 'text-primary-700' : 'text-neutral-700'
                  }`}>
                    {typeItem.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Niveau de gravité */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Niveau de gravité *
            </Text>
            
            <View className="space-y-3">
              {NIVEAUX_GRAVITE.map((niveau) => (
                <TouchableOpacity
                  key={niveau.id}
                  onPress={() => setGravite(niveau.id)}
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    gravite === niveau.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <View className={`w-4 h-4 rounded-full ${niveau.color} mr-3`} />
                  <View className="flex-1">
                    <Text className={`font-semibold ${
                      gravite === niveau.id ? 'text-primary-700' : 'text-neutral-800'
                    }`}>
                      {niveau.label}
                    </Text>
                    <Text className="text-sm text-neutral-600">
                      {niveau.description}
                    </Text>
                  </View>
                  {gravite === niveau.id && (
                    <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Description (optionnelle)
            </Text>
            
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez la situation en quelques mots..."
              multiline
              numberOfLines={4}
              className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-base"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Localisation */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Localisation
            </Text>
            
            <View className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">📍</Text>
                <Text className="text-sm font-semibold text-primary-700">
                  Position détectée automatiquement
                </Text>
              </View>
              
              {location ? (
                <Text className="text-xs text-primary-600">
                  Lat: {location.coords.latitude.toFixed(6)}, Lon: {location.coords.longitude.toFixed(6)}
                </Text>
              ) : (
                <Text className="text-xs text-primary-600">
                  Détection en cours...
                </Text>
              )}
            </View>
          </View>

          {/* Bouton d'envoi */}
          <PrimaryButton
            title={isLoading ? "Envoi en cours..." : "Envoyer le signalement"}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!type || !gravite || !location}
            fullWidth
            className="mb-8"
          />

          {/* Info légale */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Text className="text-lg mr-2">ℹ️</Text>
              <Text className="text-sm font-semibold text-neutral-700">
                Information importante
              </Text>
            </View>
            <Text className="text-xs text-neutral-600 leading-4">
              Votre signalement sera transmis aux forces de l'ordre compétentes. 
              Les fausses alertes sont passibles d'amende. Vos données personnelles 
              sont protégées conformément à notre politique de confidentialité.
            </Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
