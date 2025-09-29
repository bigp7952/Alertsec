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
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#FFFFFF',
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
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          
          {/* Titre */}
          <View style={styles.titleSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.logoGradient}
              >
                <Ionicons name="shield" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Connexion Force</Text>
            <Text style={styles.subtitle}>
              Accès réservé aux forces de l'ordre
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            
            {/* Matricule */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Matricule</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: focusedField === 'matricule' ? COLORS.primary : COLORS.border }
              ]}>
                <Ionicons name="card-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  value={matricule}
                  onChangeText={setMatricule}
                  onFocus={() => setFocusedField('matricule')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ex: POL12345"
                  autoCapitalize="characters"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Nom */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nom de famille</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: focusedField === 'nom' ? COLORS.primary : COLORS.border }
              ]}>
                <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  value={nom}
                  onChangeText={setNom}
                  onFocus={() => setFocusedField('nom')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="MARTIN"
                  autoCapitalize="characters"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: focusedField === 'password' ? COLORS.primary : COLORS.border }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.textLight} 
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
            style={[styles.submitButton, { opacity: isLoading ? 0.6 : 1 }]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animatable.View
                    animation="rotate"
                    iterationCount="infinite"
                    duration={1000}
                  >
                    <Ionicons name="refresh" size={20} color={COLORS.white} />
                  </Animatable.View>
                  <Text style={styles.submitText}>Vérification...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>Accéder à l'interface</Text>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Compte démo */}
          <View style={styles.demoContainer}>
            <BlurView intensity={10} style={styles.demoBlur}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={16} color={COLORS.warning} />
                <Text style={styles.demoTitle}>Compte de démonstration</Text>
              </View>
              <Text style={styles.demoText}>
                Matricule: DEMO{'\n'}
                Nom: DEMO{'\n'}
                Mot de passe: demo123
              </Text>
            </BlurView>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  demoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  demoBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.warningLight,
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
    color: COLORS.warning,
  },
  demoText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});