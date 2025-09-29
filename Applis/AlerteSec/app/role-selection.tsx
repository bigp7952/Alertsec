import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Palette de couleurs épurée
const COLORS = {
  primary: '#0091F5',
  primaryLight: '#E6F4FE',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
};

// Configuration simplifiée des rôles
const ROLES = [
  {
    id: 'citoyen',
    title: 'Je suis citoyen',
    subtitle: 'Signaler et être alerté',
    description: 'Accédez aux fonctionnalités de signalement, consultez la carte des alertes et restez informé de la situation sécuritaire.',
    icon: 'person-circle',
    color: COLORS.primary,
    lightColor: COLORS.primaryLight,
    features: [
      'Alerte SOS rapide',
      'Carte interactive',
      'Notifications personnalisées',
      'Historique des signalements'
    ]
  },
  {
    id: 'force',
    title: 'Force de l\'ordre',
    subtitle: 'Gérer et intervenir',
    description: 'Interface professionnelle pour gérer les signalements, coordonner les interventions et assurer le suivi opérationnel.',
    icon: 'shield',
    color: COLORS.danger,
    lightColor: COLORS.dangerLight,
    features: [
      'Gestion des alertes',
      'Dispatch des équipes',
      'Suivi temps réel',
      'Rapports détaillés'
    ]
  }
];

export default function RoleSelectionScreen() {
  const { setUserType } = useApp();
  
  // États
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const card1Scale = useRef(new Animated.Value(0.95)).current;
  const card2Scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animation d'entrée
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
      Animated.spring(card1Scale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(card2Scale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRolePress = useCallback(async (roleId: string) => {
    setSelectedRole(roleId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Définir le type d'utilisateur dans le contexte
    if (roleId === 'citoyen') {
      setUserType('citizen');
    } else if (roleId === 'force') {
      setUserType('law_enforcement');
    }
    
    // Animation de sélection
    const selectedScale = roleId === 'citoyen' ? card1Scale : card2Scale;
    const otherScale = roleId === 'citoyen' ? card2Scale : card1Scale;
    
    Animated.parallel([
      Animated.spring(selectedScale, {
        toValue: 1.02,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(otherScale, {
        toValue: 0.98,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation après délai
    setTimeout(() => {
      if (roleId === 'citoyen') {
        router.push('/auth/login-citoyen');
      } else {
        router.push('/auth/login-force');
      }
    }, 800);
  }, [setUserType]);

  const handleCardHover = useCallback((roleId: string, isPressed: boolean) => {
    if (selectedRole) return;
    
    setHoveredRole(isPressed ? roleId : null);
    const cardScale = roleId === 'citoyen' ? card1Scale : card2Scale;
    
    Animated.spring(cardScale, {
      toValue: isPressed ? 1.01 : 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [selectedRole]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header minimaliste */}
      <Animatable.View
        animation="slideInDown"
        duration={600}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={async () => {
            console.log('Bouton retour pressé');
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
      </Animatable.View>

      {/* Contenu principal */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
        
        {/* Titre principal épuré */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>Choisissez votre profil</Text>
          <Text style={styles.subtitle}>
            Sélectionnez le type de compte qui correspond à votre utilisation
          </Text>
        </Animatable.View>

        {/* Cartes de rôles épurées */}
        <View style={styles.cardsContainer}>
          {ROLES.map((role, index) => (
            <Animatable.View
              key={role.id}
              animation="fadeInUp"
              delay={400 + index * 200}
              style={styles.cardWrapper}
            >
              <TouchableOpacity
                onPress={() => handleRolePress(role.id)}
                onPressIn={() => handleCardHover(role.id, true)}
                onPressOut={() => handleCardHover(role.id, false)}
                activeOpacity={1}
                style={styles.cardTouchable}
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [{ scale: index === 0 ? card1Scale : card2Scale }],
                      borderColor: selectedRole === role.id ? role.color : COLORS.neutral[200],
                      borderWidth: selectedRole === role.id ? 2 : 1,
                    },
                  ]}
                >
                  {/* Indicateur de sélection */}
                  {selectedRole === role.id && (
                    <Animatable.View
                      animation="zoomIn"
                      duration={300}
                      style={[styles.selectionIndicator, { backgroundColor: role.color }]}
                    >
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    </Animatable.View>
                  )}

                  {/* Contenu de la carte */}
                  <View style={styles.cardContent}>
                    
                    {/* Icon et titre */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: role.lightColor }]}>
                        <Ionicons 
                          name={role.icon as any} 
                          size={28} 
                          color={role.color} 
                        />
                      </View>
                      
                      <View style={styles.headerText}>
                        <Text style={styles.cardTitle}>{role.title}</Text>
                        <Text style={[styles.cardSubtitle, { color: role.color }]}>
                          {role.subtitle}
                        </Text>
                      </View>

                      {/* Indicateur d'action */}
                      <Animatable.View
                        animation={hoveredRole === role.id ? 'pulse' : undefined}
                        iterationCount="infinite"
                        duration={1000}
                        style={[styles.actionIndicator, { backgroundColor: role.lightColor }]}
                      >
                        <Ionicons 
                          name="arrow-forward" 
                          size={16} 
                          color={role.color} 
                        />
                      </Animatable.View>
                    </View>

                    {/* Description */}
                    <Text style={styles.cardDescription}>
                      {role.description}
                    </Text>

                    {/* Features list épurée */}
                    <View style={styles.featuresList}>
                      {role.features.map((feature, featureIndex) => (
                        <View key={featureIndex} style={styles.featureItem}>
                          <View style={[styles.featureDot, { backgroundColor: role.color }]} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Badge spécial pour force de l'ordre */}
                    {role.id === 'force' && (
                      <View style={styles.securityBadge}>
                        <Ionicons name="lock-closed" size={12} color={role.color} />
                        <Text style={[styles.securityText, { color: role.color }]}>
                          Accès sécurisé requis
                        </Text>
                      </View>
                    )}

                  </View>
                </Animated.View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Information légale épurée */}
        <Animatable.View
          animation="fadeIn"
          delay={800}
          style={styles.legalInfo}
        >
          <Text style={styles.legalText}>
            En continuant, vous acceptez nos conditions d'utilisation
          </Text>
        </Animatable.View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flex: 1,
    gap: 20,
    marginBottom: 40,
  },
  cardWrapper: {
    flex: 1,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  actionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.neutral[700],
    marginBottom: 16,
    fontWeight: '400',
  },
  featuresList: {
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutral[700],
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  legalInfo: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  legalText: {
    fontSize: 12,
    color: COLORS.neutral[500],
    textAlign: 'center',
    fontWeight: '500',
  },
});