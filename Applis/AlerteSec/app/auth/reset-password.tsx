import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;

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

    // Vérifier la validité du token
    if (!token) {
      setIsTokenValid(false);
    } else {
      // Simulation de vérification du token
      setTimeout(() => {
        // Pour la démo, on considère le token comme valide
        setIsTokenValid(true);
      }, 1000);
    }
  }, [token]);

  // Évaluer la force du mot de passe
  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength('weak');
      return;
    }

    let score = 0;
    
    // Longueur
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    
    // Caractères spéciaux
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) {
      setPasswordStrength('weak');
    } else if (score <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }

    // Animation de la barre de force
    Animated.timing(strengthAnim, {
      toValue: score / 6,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [newPassword]);

  // Validation du formulaire
  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    if (passwordStrength === 'weak') {
      Alert.alert(
        'Mot de passe faible',
        'Votre mot de passe est trop faible. Utilisez au moins 8 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.',
        [
          { text: 'Modifier', style: 'cancel' },
          { text: 'Continuer quand même', onPress: () => handleResetPassword() }
        ]
      );
      return false;
    }

    return true;
  };

  // Réinitialisation du mot de passe
  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Simulation reset
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        'Mot de passe réinitialisé',
        'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        [
          { 
            text: 'Se connecter', 
            onPress: () => router.replace('/role-selection')
          }
        ]
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  };

  // Renvoyer vers la page de récupération si token invalide
  if (!isTokenValid) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.invalidTokenContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
          </View>
          
          <Text style={styles.errorTitle}>Lien invalide ou expiré</Text>
          <Text style={styles.errorDescription}>
            Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien de récupération.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.replace('/auth/forgot-password')}
            style={styles.errorButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.errorButtonGradient}
            >
              <Text style={styles.errorButtonText}>Demander un nouveau lien</Text>
              <Ionicons name="refresh" size={18} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
              colors={[COLORS.success, '#059669']}
              style={styles.iconGradient}
            >
              <Ionicons name="lock-open" size={32} color={COLORS.white} />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>
            Choisissez un mot de passe sécurisé pour votre compte
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          
          {/* Nouveau mot de passe */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nouveau mot de passe</Text>
            <View style={[
              styles.inputContainer,
              { 
                borderColor: focusedField === 'newPassword' ? COLORS.primary : COLORS.border,
                borderWidth: focusedField === 'newPassword' ? 2 : 1,
              }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                secureTextEntry={!showNewPassword}
                autoComplete="new-password"
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textLight} 
                />
              </TouchableOpacity>
            </View>

            {/* Indicateur de force du mot de passe */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <Animated.View
                    style={[
                      styles.strengthFill,
                      {
                        width: strengthAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: passwordStrength === 'weak' ? COLORS.danger :
                                       passwordStrength === 'medium' ? COLORS.warning : COLORS.success,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.strengthText,
                  {
                    color: passwordStrength === 'weak' ? COLORS.danger :
                           passwordStrength === 'medium' ? COLORS.warning : COLORS.success,
                  },
                ]}>
                  {passwordStrength === 'weak' ? 'Faible' :
                   passwordStrength === 'medium' ? 'Moyen' : 'Fort'}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation mot de passe */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
            <View style={[
              styles.inputContainer,
              { 
                borderColor: focusedField === 'confirmPassword' ? COLORS.primary : COLORS.border,
                borderWidth: focusedField === 'confirmPassword' ? 2 : 1,
              }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textLight} 
                />
              </TouchableOpacity>
            </View>

            {/* Validation visuelle */}
            {confirmPassword.length > 0 && (
              <View style={styles.validationContainer}>
                {newPassword === confirmPassword ? (
                  <Animatable.View animation="bounceIn" style={styles.validationSuccess}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.validationText}>Les mots de passe correspondent</Text>
                  </Animatable.View>
                ) : (
                  <View style={styles.validationError}>
                    <Ionicons name="close-circle" size={16} color={COLORS.danger} />
                    <Text style={[styles.validationText, { color: COLORS.danger }]}>
                      Les mots de passe ne correspondent pas
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </View>

        {/* Conseils de sécurité */}
        <View style={styles.securityTips}>
          <BlurView intensity={15} style={styles.tipsBlur}>
            <View style={styles.tipsHeader}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <Text style={styles.tipsTitle}>Conseils pour un mot de passe sécurisé</Text>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
                <Text style={styles.tipText}>Au moins 8 caractères</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
                <Text style={styles.tipText}>Mélange de majuscules et minuscules</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
                <Text style={styles.tipText}>Au moins un chiffre</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
                <Text style={styles.tipText}>Caractères spéciaux (!@#$%)</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Bouton de validation */}
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={isLoading || !newPassword || !confirmPassword}
          style={[
            styles.submitButton, 
            { opacity: (isLoading || !newPassword || !confirmPassword) ? 0.6 : 1 }
          ]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.success, '#059669']}
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
                <Text style={styles.submitText}>Modification en cours...</Text>
              </View>
            ) : (
              <View style={styles.submitContent}>
                <Text style={styles.submitText}>Modifier le mot de passe</Text>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Avertissement de sécurité */}
        <View style={styles.warningContainer}>
          <BlurView intensity={10} style={styles.warningBlur}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={16} color={COLORS.warning} />
              <Text style={styles.warningTitle}>Important</Text>
            </View>
            
            <Text style={styles.warningText}>
              Après modification, vous devrez utiliser ce nouveau mot de passe pour toutes vos connexions futures. 
              Assurez-vous de le mémoriser ou de l'enregistrer dans un gestionnaire de mots de passe sécurisé.
            </Text>
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
        shadowColor: COLORS.success,
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
  passwordToggle: {
    padding: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  validationContainer: {
    marginTop: 4,
  },
  validationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },
  securityTips: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tipsBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.successLight,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.success,
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
  warningContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  warningBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.warningLight,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    lineHeight: 18,
  },
  // Styles pour token invalide
  invalidTokenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  errorButton: {
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
  errorButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

