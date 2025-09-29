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

    setTimeout(() => {
      setIsLoading(false);
      
      if (email === 'demo@alertesec.fr' && password === 'Demo123!') {
        // Authentifier l'utilisateur comme citoyen
        setUserType('citizen');
        setAuthenticated(true);
        
        Alert.alert(
          'Connexion réussie',
          'Bienvenue dans AlerteSec !',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    }, 2000);
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
                <Ionicons name="person-circle" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Connexion Citoyen</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour signaler et recevoir des alertes
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Adresse email</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: focusedField === 'email' ? COLORS.primary : COLORS.border }
              ]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
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
                  autoComplete="password"
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
                  <Text style={styles.submitText}>Connexion...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>Se connecter</Text>
                  <Ionicons name="log-in" size={20} color={COLORS.white} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Bouton inscription */}
          <TouchableOpacity
            onPress={handleRegister}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>Créer un compte</Text>
            <Ionicons name="person-add" size={18} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Compte démo */}
          <View style={styles.demoContainer}>
            <BlurView intensity={10} style={styles.demoBlur}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={16} color={COLORS.warning} />
                <Text style={styles.demoTitle}>Compte de démonstration</Text>
              </View>
              <Text style={styles.demoText}>
                Email: demo@alertesec.fr{'\n'}
                Mot de passe: Demo123!
              </Text>
            </BlurView>
          </View>

          {/* Info sécurité */}
          <View style={styles.securityInfo}>
            <BlurView intensity={15} style={styles.securityBlur}>
              <View style={styles.securityHeader}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
                <Text style={styles.securityTitle}>Vos données sont protégées</Text>
              </View>
              <Text style={styles.securityText}>
                Chiffrement de bout en bout • Données anonymisées • Conforme RGPD
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    gap: 8,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  demoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
  securityInfo: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  securityBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryLight,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textLight,
  },
});