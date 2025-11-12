import { useApp } from '@/contexts/AppContext';
import { useApi } from '@/contexts/ApiContext';
import { User } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

// Couleurs pour citoyens
const COLORS = {
  primary: '#0091F5',
  primaryLight: '#E6F4FE',
  primaryDark: '#005793',
  success: '#10B981',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#FFFFFF',
  backgroundLight: '#F9FAFB',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

export default function LoginCitoyenScreen() {
  const { setAuthenticated, setUserType } = useApp();
  const api = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setIsLoading(true);
    // Mode mock: simuler une connexion réussie et charger les données mock
    setTimeout(async () => {
      setIsLoading(false);
      
      // Mettre à jour le contexte App
      setUserType('citizen');
      setAuthenticated(true);
      
      // Créer un utilisateur mock et le définir dans ApiContext
      const mockUser: User = {
        id: 501,
        matricule: 'CTZ' + Date.now().toString().slice(-6),
        nom: 'Citoyen',
        prenom: 'Test',
        grade: 'citoyen',
        unite: 'citoyen',
        secteur: 'citoyen',
        role: 'citoyen',
        email: email,
        telephone: '',
        adresse: '',
      };
      
      // Définir directement l'utilisateur dans le contexte API (via setState si accessible)
      // Pour l'instant, on va juste charger les signalements directement
      await api.fetchCitizenSignalements();
      
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleRegister = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/register-citoyen');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.backgroundGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          
          {/* Logo et titre */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-circle" size={40} color="#667eea" />
            </View>
            
            <Text style={styles.title}>Connexion Citoyen</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour signaler et recevoir des alertes
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Adresse email *</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mot de passe oublié */}
            <TouchableOpacity 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/auth/forgot-password');
              }}
              style={styles.forgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <LoadingSpinner />
                  <Text style={styles.buttonText}>
                    Connexion...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Se connecter
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Lien vers inscription */}
          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerText}>
              Pas encore de compte ?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Composant de loading spinner
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
      <Text style={{ color: '#FFFFFF', fontSize: 18 }}>⭐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});