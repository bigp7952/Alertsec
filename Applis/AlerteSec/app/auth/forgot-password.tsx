import { Ionicons } from '@expo/vector-icons';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
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
    let interval: ReturnType<typeof setInterval>;
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
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.backgroundGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <Ionicons 
                name={isEmailSent ? "mail-open" : "lock-closed"} 
                size={40} 
                color="#4F46E5" 
              />
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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Adresse email *</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre.email@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Bouton d'envoi */}
              <TouchableOpacity
                onPress={handleSendResetEmail}
                disabled={isLoading || !email.trim()}
                style={[
                  styles.sendButton,
                  { opacity: (isLoading || !email.trim()) ? 0.6 : 1 }
                ]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <LoadingSpinner />
                      <Text style={styles.buttonText}>Envoi en cours...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Envoyer le lien</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
                <View style={styles.emailHeader}>
                  <Ionicons name="mail" size={24} color="#4F46E5" />
                  <Text style={styles.emailTitle}>Email envoyé à :</Text>
                </View>
                <Text style={styles.emailAddress}>{email}</Text>
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
                      <LoadingSpinner />
                      <Text style={styles.resendButtonText}>Envoi...</Text>
                    </View>
                  ) : countdown > 0 ? (
                    <View style={styles.countdownContainer}>
                      <Ionicons name="time" size={16} color="#9CA3AF" />
                      <Text style={styles.countdownText}>Renvoyer dans {countdown}s</Text>
                    </View>
                  ) : (
                    <View style={styles.resendContent}>
                      <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
                      <Ionicons name="refresh" size={16} color="#4F46E5" />
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
                <Ionicons name="arrow-back" size={16} color="#9CA3AF" />
                <Text style={styles.backToLoginText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

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
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
  confirmationContainer: {
    gap: 32,
    marginBottom: 32,
  },
  emailConfirmation: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#FFFFFF',
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
});