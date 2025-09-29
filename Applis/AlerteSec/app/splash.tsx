import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Palette de couleurs AlerteSec
const COLORS = {
  primary: {
    50: '#E6F4FE',
    100: '#CCE9FD',
    200: '#99D3FB',
    300: '#66BDF9',
    400: '#33A7F7',
    500: '#0091F5',
    600: '#0074C4',
    700: '#005793',
    800: '#003A62',
    900: '#001D31',
  },
  danger: {
    500: '#EF4444',
    600: '#DC2626',
  },
  white: '#FFFFFF',
  black: '#000000',
};

// Constantes d'animation
const ANIMATION_DURATION = {
  FAST: 300,
  MEDIUM: 600,
  SLOW: 1000,
  VERY_SLOW: 1500,
};

export default function SplashScreen() {
  // États de l'animation
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Références d'animation pour le logo
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  
  // Références d'animation pour le titre
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  
  // Références d'animation pour le sous-titre
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateX = useRef(new Animated.Value(-100)).current;
  
  // Références d'animation pour la barre de progression
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  
  // Références d'animation pour les éléments décoratifs
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  
  // Animation de pulsation continue
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Animation de brillance
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startSplashSequence();
  }, []);

  const startSplashSequence = async () => {
    // Feedback haptique de démarrage
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Séquence d'animations orchestrée
    setTimeout(() => animateStep1(), 100);
    setTimeout(() => animateStep2(), 800);
    setTimeout(() => animateStep3(), 1400);
    setTimeout(() => animateStep4(), 2000);
    setTimeout(() => animateStep5(), 2600);
    setTimeout(() => finalizeAndNavigate(), 3500);
  };

  // Étape 1: Apparition du logo avec effet de scale et rotation
  const animateStep1 = () => {
    setCurrentStep(1);
    
    Animated.parallel([
      Animated.spring(logoOpacity, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: ANIMATION_DURATION.SLOW,
          useNativeDriver: true,
        }),
    ]).start();

    // Démarrer l'animation de pulsation
    startPulseAnimation();
  };

  // Étape 2: Apparition du titre avec effet élastique
  const animateStep2 = () => {
    setCurrentStep(2);
    setLoadingProgress(25);
    
    Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(titleTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Étape 3: Apparition du sous-titre avec slide
  const animateStep3 = () => {
    setCurrentStep(3);
    setLoadingProgress(50);
    
    Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION.MEDIUM,
          useNativeDriver: true,
        }),
      Animated.spring(subtitleTranslateX, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Étape 4: Apparition de la barre de progression
  const animateStep4 = () => {
    setCurrentStep(4);
    setLoadingProgress(75);
    
    Animated.parallel([
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION.FAST,
        useNativeDriver: true,
      }),
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: ANIMATION_DURATION.VERY_SLOW,
          useNativeDriver: false,
        }),
    ]).start();

    // Démarrer les particules décoratives
    startParticleAnimations();
  };

  // Étape 5: Finalisation et effet de brillance
  const animateStep5 = () => {
    setCurrentStep(5);
    setLoadingProgress(100);
    setIsReady(true);
    
    // Animation de brillance sur le titre
    Animated.loop(
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: ANIMATION_DURATION.VERY_SLOW,
          useNativeDriver: true,
        })
    ).start();
  };

  // Animation de pulsation continue pour le logo
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: ANIMATION_DURATION.SLOW,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: ANIMATION_DURATION.SLOW,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Animations des particules décoratives
  const startParticleAnimations = () => {
    // Particule 1 - mouvement orbital
    Animated.loop(
      Animated.timing(particle1, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Particule 2 - mouvement vertical
    Animated.loop(
      Animated.sequence([
        Animated.timing(particle2, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particle2, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particule 3 - mouvement diagonal
    Animated.loop(
      Animated.timing(particle3, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Finalisation et navigation
  const finalizeAndNavigate = async () => {
    // Feedback haptique de succès
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Attendre un peu puis naviguer
    setTimeout(() => {
      router.push('/onboarding');
    }, 500);
  };

  // Calculs pour les animations de particules
  const particle1Transform = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const particle2TranslateY = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const particle3TranslateX = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  const particle3TranslateY = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  // Animation de brillance
  const shimmerTranslateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // Animation de rotation du logo
  const logoRotationDegrees = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Animation de la barre de progression
  const progressWidthInterpolated = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient de fond principal */}
      <LinearGradient
        colors={[COLORS.primary[500], COLORS.primary[400], COLORS.primary[300]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        
        {/* Particules décoratives animées */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            {
              transform: [
                {
                  rotate: particle1Transform,
                },
                {
                  translateX: 20,
                },
                {
                  translateY: 20,
                },
              ],
            },
          ]}
        >
          <BlurView intensity={20} style={styles.particleBlur}>
            <View style={[styles.particleInner, { backgroundColor: COLORS.white }]} />
          </BlurView>
        </Animated.View>

        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            {
              transform: [
                {
                  translateY: particle2TranslateY,
                },
              ],
            },
          ]}
        >
          <View style={[styles.particleInner, { backgroundColor: COLORS.primary[200] }]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            {
              transform: [
                {
                  translateX: particle3TranslateX,
                },
                {
                  translateY: particle3TranslateY,
                },
              ],
            },
          ]}
        >
          <View style={[styles.particleInner, { backgroundColor: COLORS.white }]} />
        </Animated.View>

        {/* Contenu principal centré */}
        <View style={styles.contentContainer}>
          
          {/* Container du logo avec animations */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnimation) },
                  { rotate: logoRotationDegrees },
                ],
              },
            ]}
          >
            {/* Cercle de fond du logo avec effet de glow */}
                  <BlurView intensity={30} style={styles.logoBlur}>
                    <LinearGradient
                      colors={[COLORS.white, COLORS.primary[50]]}
                      style={styles.logoBackground}
                    >
                      {/* Logo AlerteSec */}
                      <Image
                        source={require('@/assets/images/alertsec-logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                
                {/* Effet de brillance sur le logo */}
                <Animated.View
                  style={[
                    styles.logoShimmer,
                    {
                      transform: [{ translateX: shimmerTranslateX }],
                    },
                  ]}
                />
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Titre principal avec effet de brillance */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [
                  { scale: titleScale },
                  { translateY: titleTranslateY },
                ],
              },
            ]}
          >
            <View style={styles.titleWrapper}>
              <Text style={styles.titleText}>AlerteSec</Text>
              
              {/* Effet de brillance sur le titre */}
              <Animated.View
                style={[
                  styles.titleShimmer,
                  {
                    transform: [{ translateX: shimmerTranslateX }],
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Sous-titre avec animation slide */}
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: subtitleOpacity,
                transform: [{ translateX: subtitleTranslateX }],
              },
            ]}
          >
            <Text style={styles.subtitleText}>
              Sécurité citoyenne en temps réel
            </Text>
          </Animated.View>

          {/* Indicateurs de progression avec animations */}
          <Animated.View
            style={[
              styles.progressContainer,
              {
                opacity: progressOpacity,
              },
            ]}
          >
            {/* Barre de progression principale */}
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressWidthInterpolated,
                  },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.white, COLORS.primary[100], COLORS.white]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>

            {/* Dots de chargement animés */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <LoadingDot key={index} delay={index * 200} />
              ))}
            </View>

            {/* Texte de chargement */}
            <Text style={styles.loadingText}>
              {currentStep === 1 && 'Initialisation...'}
              {currentStep === 2 && 'Chargement des ressources...'}
              {currentStep === 3 && 'Configuration sécurisée...'}
              {currentStep === 4 && 'Vérification des permissions...'}
              {currentStep === 5 && 'Prêt !'}
            </Text>

            {/* Pourcentage de progression */}
            <Text style={styles.progressText}>
              {loadingProgress}%
            </Text>
          </Animated.View>

        </View>

        {/* Éléments décoratifs en arrière-plan */}
        <View style={styles.decorativeElements}>
          {/* Grand cercle décoratif */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={3000}
            style={[styles.decorativeCircle, styles.decorativeCircle1]}
          />
          
          {/* Cercle moyen */}
          <Animatable.View
            animation="fadeInUp"
            delay={1000}
            duration={2000}
            style={[styles.decorativeCircle, styles.decorativeCircle2]}
          />
          
          {/* Petit cercle */}
          <Animatable.View
            animation="bounceIn"
            delay={1500}
            duration={1500}
            style={[styles.decorativeCircle, styles.decorativeCircle3]}
          />
        </View>

        {/* Badge de version en bas */}
        <Animatable.View
          animation="fadeInUp"
          delay={2000}
          style={styles.versionBadge}
        >
          <BlurView intensity={20} style={styles.versionBlur}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </BlurView>
        </Animatable.View>

      </LinearGradient>
    </View>
  );
}

// Composant pour les dots de chargement avec animation individuelle
function LoadingDot({ delay = 0 }: { delay?: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    setTimeout(() => {
      animation.start();
    }, delay);

    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.loadingDot,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
  },
  gradientBackground: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBlur: {
    borderRadius: 60,
    overflow: 'hidden',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoShimmer: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
    backgroundColor: COLORS.white,
    opacity: 0.3,
    transform: [{ skewX: '-20deg' }],
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  titleWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
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
  titleShimmer: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
    backgroundColor: COLORS.white,
    opacity: 0.4,
    transform: [{ skewX: '-20deg' }],
  },
  subtitleContainer: {
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBarBackground: {
    width: width * 0.6,
    height: 4,
    backgroundColor: COLORS.white,
    borderRadius: 2,
    opacity: 0.3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.7,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: COLORS.white,
  },
  decorativeCircle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
    opacity: 0.1,
  },
  decorativeCircle2: {
    width: 120,
    height: 120,
    bottom: 100,
    left: -60,
    opacity: 0.08,
  },
  decorativeCircle3: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: 20,
    opacity: 0.06,
  },
  particle: {
    position: 'absolute',
    zIndex: 5,
  },
  particle1: {
    top: height * 0.2,
    right: width * 0.2,
  },
  particle2: {
    bottom: height * 0.3,
    left: width * 0.1,
  },
  particle3: {
    top: height * 0.4,
    right: width * 0.1,
  },
  particleBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  particleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 14,
    opacity: 0.6,
  },
  versionBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
  },
  versionBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
  },
});