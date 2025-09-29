import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterCitoyenScreen() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { prenom, nom, email, telephone, password, confirmPassword } = formData;

    if (!prenom || !nom || !email || !telephone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return false;
    }

    if (telephone.length < 10) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulation d'une inscription
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Inscription réussie', 
        'Votre compte a été créé avec succès !',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-6"
          >
            <Text className="text-neutral-600 text-base">← Retour</Text>
          </TouchableOpacity>
        </View>

        <Animated.View 
          className="flex-1 px-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          
          {/* Logo et titre */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">📝</Text>
            </View>
            
            <Text className="text-2xl font-bold text-neutral-800 mb-2">
              Créer un compte
            </Text>
            
            <Text className="text-base text-neutral-600 text-center">
              Rejoignez la communauté AlerteSec
            </Text>
          </View>

          {/* Formulaire */}
          <View className="space-y-4 mb-6">
            
            {/* Prénom et Nom */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700 mb-2">
                  Prénom *
                </Text>
                <TextInput
                  value={formData.prenom}
                  onChangeText={(value) => updateFormData('prenom', value)}
                  placeholder="Jean"
                  autoCapitalize="words"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700 mb-2">
                  Nom *
                </Text>
                <TextInput
                  value={formData.nom}
                  onChangeText={(value) => updateFormData('nom', value)}
                  placeholder="Dupont"
                  autoCapitalize="words"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Adresse email *
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                placeholder="jean.dupont@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Téléphone */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Numéro de téléphone *
              </Text>
              <TextInput
                value={formData.telephone}
                onChangeText={(value) => updateFormData('telephone', value)}
                placeholder="06 12 34 56 78"
                keyboardType="phone-pad"
                autoComplete="tel"
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mot de passe */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Mot de passe *
              </Text>
              <View className="relative">
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 pr-12 text-base"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <Text className="text-neutral-500 text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmation mot de passe */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                Confirmer le mot de passe *
              </Text>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="••••••••"
                secureTextEntry={true}
                autoComplete="new-password"
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>

          </View>

          {/* Conditions d'utilisation */}
          <TouchableOpacity 
            onPress={() => setAcceptTerms(!acceptTerms)}
            className="flex-row items-start mb-6"
          >
            <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              acceptTerms ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'
            }`}>
              {acceptTerms && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="flex-1 text-sm text-neutral-600 leading-5">
              J'accepte les{' '}
              <Text className="text-primary-500 underline">
                conditions d'utilisation
              </Text>
              {' '}et la{' '}
              <Text className="text-primary-500 underline">
                politique de confidentialité
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`rounded-xl py-4 items-center mb-6 ${
              isLoading ? 'bg-neutral-300' : 'bg-primary-500'
            }`}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <LoadingSpinner />
                <Text className="text-white text-base font-semibold ml-2">
                  Création...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-semibold">
                Créer mon compte
              </Text>
            )}
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-neutral-600 text-sm">
              Déjà un compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary-500 text-sm font-semibold">
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Composant de loading spinner (réutilisé du login)
function LoadingSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Text className="text-white text-lg">⭐</Text>
    </Animated.View>
  );
}
