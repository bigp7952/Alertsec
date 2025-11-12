import { useApp } from '@/contexts/AppContext';
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

// Couleurs pour forces de l'ordre
const COLORS = {
  primary: '#EF4444',
  primaryLight: '#FEF2F2',
  primaryDark: '#B91C1C',
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

export default function LoginForceScreen() {
  const { setAuthenticated, setUserType } = useApp();
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
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
    if (!matricule || !nom || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      if (matricule === 'DEMO' && nom === 'DEMO' && password === 'demo123') {
        // Authentifier l'utilisateur comme agent des forces de l'ordre
        setUserType('law_enforcement');
        setAuthenticated(true);
        
        Alert.alert(
          'Accès autorisé',
          'Connexion réussie',
          [{ text: 'OK', onPress: () => router.replace('/agent-dashboard') }]
        );
      } else {
        Alert.alert('Accès refusé', 'Identifiants incorrects');
      }
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#EF4444', '#B91C1C']}
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
              <Ionicons name="shield" size={40} color="#EF4444" />
            </View>
            
            <Text style={styles.title}>Forces de l'Ordre</Text>
            <Text style={styles.subtitle}>
              Accès réservé aux forces de l'ordre
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            
            {/* Matricule */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Matricule *</Text>
              <TextInput
                value={matricule}
                onChangeText={setMatricule}
                placeholder="POL12345"
                autoCapitalize="characters"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Nom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom de famille *</Text>
              <TextInput
                value={nom}
                onChangeText={setNom}
                placeholder="MARTIN"
                autoCapitalize="characters"
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
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#EF4444', '#B91C1C']}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <LoadingSpinner />
                  <Text style={styles.buttonText}>
                    Vérification...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Accéder à l'interface
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Compte démo */}
          <View style={styles.demoContainer}>
            <View style={styles.demoBlur}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.demoTitle}>Compte de démonstration</Text>
              </View>
              <Text style={styles.demoText}>
                Matricule: DEMO{'\n'}
                Nom: DEMO{'\n'}
                Mot de passe: demo123
              </Text>
            </View>
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
  demoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  demoBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  demoText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});