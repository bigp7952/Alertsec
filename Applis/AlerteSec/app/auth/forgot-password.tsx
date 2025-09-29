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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

// Couleurs cohérentes
const COLORS = {
  primary: '#0091F5',
  primaryLight: '#E6F4FE',
  primaryDark: '#005793',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#FFFFFF',
  backgroundLight: '#F9FAFB',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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

  // Countdown pour renvoyer l'email
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Validation de l'email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Envoi de l'email de récupération
  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Simulation envoi email
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
      setCountdown(60); // 60 secondes avant de pouvoir renvoyer

      // Animation de succès
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  // Renvoyer l'email
  const handleResendEmail = async () => {
    if (countdown > 0) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setCountdown(60);
      Alert.alert('Email renvoyé', 'Un nouvel email de récupération a été envoyé');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
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
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
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
        
        {/* Section titre */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.iconGradient}
            >
              <Ionicons 
                name={isEmailSent ? "mail-open" : "key"} 
                size={32} 
                color={COLORS.white} 
              />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>
            {isEmailSent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
          </Text>
          
          <Text style={styles.subtitle}>
            {isEmailSent 
              ? 'Consultez votre boîte email pour réinitialiser votre mot de passe'
              : 'Saisissez votre adresse email pour recevoir un lien de récupération'
            }
          </Text>
        </View>

        {!isEmailSent ? (
          // Formulaire de saisie email
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Adresse email</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: focusedField === 'email' ? COLORS.primary : COLORS.border,
                  borderWidth: focusedField === 'email' ? 2 : 1,
                }
              ]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="votre.email@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Bouton d'envoi */}
            <TouchableOpacity
              onPress={handleSendResetEmail}
              disabled={isLoading || !email.trim()}
              style={[
                styles.submitButton, 
                { opacity: (isLoading || !email.trim()) ? 0.6 : 1 }
              ]}
              activeOpacity={0.8}
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
                    <Text style={styles.submitText}>Envoi en cours...</Text>
                  </View>
                ) : (
                  <View style={styles.submitContent}>
                    <Text style={styles.submitText}>Envoyer le lien</Text>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Instructions de sécurité */}
            <View style={styles.securityInfo}>
              <BlurView intensity={15} style={styles.securityBlur}>
                <View style={styles.securityHeader}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
                  <Text style={styles.securityTitle}>Sécurité</Text>
                </View>
                
                <View style={styles.securityList}>
                  <View style={styles.securityItem}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                    <Text style={styles.securityText}>Lien valable 15 minutes</Text>
                  </View>
                  <View style={styles.securityItem}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                    <Text style={styles.securityText}>Usage unique seulement</Text>
                  </View>
                  <View style={styles.securityItem}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                    <Text style={styles.securityText}>Connexion sécurisée</Text>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        ) : (
          // Écran de confirmation
          <Animated.View
            style={[
              styles.confirmationContainer,
              {
                opacity: successAnim,
                transform: [{
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
              },
            ]}
          >
            {/* Email de confirmation */}
            <View style={styles.emailConfirmation}>
              <BlurView intensity={20} style={styles.emailBlur}>
                <View style={styles.emailHeader}>
                  <Ionicons name="mail" size={24} color={COLORS.primary} />
                  <Text style={styles.emailTitle}>Email envoyé à :</Text>
                </View>
                <Text style={styles.emailAddress}>{email}</Text>
              </BlurView>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Étapes suivantes :</Text>
              
              <View style={styles.stepsList}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Ouvrez votre boîte email</Text>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Cliquez sur le lien de récupération</Text>
                </View>
                
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Créez un nouveau mot de passe</Text>
                </View>
              </View>
            </View>

            {/* Bouton de renvoi */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Vous n'avez pas reçu l'email ?</Text>
              
              <TouchableOpacity
                onPress={handleResendEmail}
                disabled={countdown > 0 || isLoading}
                style={[
                  styles.resendButton,
                  { opacity: (countdown > 0 || isLoading) ? 0.6 : 1 }
                ]}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <View style={styles.resendLoadingContainer}>
                    <Animatable.View
                      animation="rotate"
                      iterationCount="infinite"
                      duration={1000}
                    >
                      <Ionicons name="refresh" size={16} color={COLORS.primary} />
                    </Animatable.View>
                    <Text style={styles.resendButtonText}>Envoi...</Text>
                  </View>
                ) : countdown > 0 ? (
                  <View style={styles.countdownContainer}>
                    <Ionicons name="time" size={16} color={COLORS.textLight} />
                    <Text style={styles.countdownText}>Renvoyer dans {countdown}s</Text>
                  </View>
                ) : (
                  <View style={styles.resendContent}>
                    <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
                    <Ionicons name="refresh" size={16} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Bouton retour connexion */}
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backToLoginButton}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.textLight} />
              <Text style={styles.backToLoginText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Aide et support */}
        <View style={styles.helpContainer}>
          <BlurView intensity={10} style={styles.helpBlur}>
            <View style={styles.helpHeader}>
              <Ionicons name="help-circle" size={16} color={COLORS.warning} />
              <Text style={styles.helpTitle}>Besoin d'aide ?</Text>
            </View>
            
            <Text style={styles.helpText}>
              Si vous rencontrez des difficultés, contactez notre support technique à{' '}
              <Text style={styles.helpLink}>support@alertesec.fr</Text>
            </Text>
            
            <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
              <Text style={styles.helpButtonText}>Contacter le support</Text>
              <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </BlurView>
        </View>

      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    gap: 24,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitGradient: {
    paddingVertical: 18,
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
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  securityInfo: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  securityBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.successLight,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  securityList: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  confirmationContainer: {
    gap: 32,
    marginBottom: 32,
  },
  emailConfirmation: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emailBlur: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  instructionsContainer: {
    gap: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  resendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  helpContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  helpBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.warningLight,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  helpLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

