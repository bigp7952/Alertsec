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
    View,
    StyleSheet,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

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
    try {
      // Générer un matricule citoyen simple
      const generatedMatricule = `CTZ${Date.now().toString().slice(-6)}`;

      await authService.register({
        matricule: generatedMatricule,
        nom: formData.nom,
        prenom: formData.prenom,
        grade: 'citoyen',
        unite: 'citoyen',
        secteur: 'citoyen',
        role: 'citoyen',
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        telephone: formData.telephone,
      } as any);

      setIsLoading(false);
      Alert.alert(
        'Inscription réussie', 
        'Votre compte a été créé avec succès !',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Erreur', e?.message || "Impossible de créer le compte");
    }
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
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          
          {/* Logo et titre */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={40} color="#667eea" />
            </View>
            
            <Text style={styles.title}>
              Créer un compte
            </Text>
            
            <Text style={styles.subtitle}>
              Rejoignez la communauté AlerteSec
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            
            {/* Prénom et Nom */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Prénom *
                </Text>
                <TextInput
                  value={formData.prenom}
                  onChangeText={(value) => updateFormData('prenom', value)}
                  placeholder="Jean"
                  autoCapitalize="words"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Nom *
                </Text>
                <TextInput
                  value={formData.nom}
                  onChangeText={(value) => updateFormData('nom', value)}
                  placeholder="Dupont"
                  autoCapitalize="words"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Adresse email *
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                placeholder="jean.dupont@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Téléphone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Numéro de téléphone *
              </Text>
              <TextInput
                value={formData.telephone}
                onChangeText={(value) => updateFormData('telephone', value)}
                placeholder="06 12 34 56 78"
                keyboardType="phone-pad"
                autoComplete="tel"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Mot de passe *
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
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

            {/* Confirmation mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Confirmer le mot de passe *
              </Text>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="••••••••"
                secureTextEntry={true}
                autoComplete="new-password"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

          </View>

          {/* Conditions d'utilisation */}
          <TouchableOpacity 
            onPress={() => setAcceptTerms(!acceptTerms)}
            style={styles.termsContainer}
          >
            <View style={[
              styles.checkbox,
              acceptTerms && styles.checkboxChecked
            ]}>
              {acceptTerms && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              J'accepte les{' '}
              <Text style={styles.linkText}>
                conditions d'utilisation
              </Text>
              {' '}et la{' '}
              <Text style={styles.linkText}>
                politique de confidentialité
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled
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
                    Création...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Créer mon compte
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>
              Déjà un compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>
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
      <Ionicons name="refresh" size={20} color="#FFFFFF" />
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  linkText: {
    color: '#667eea',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  registerButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  loginLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
