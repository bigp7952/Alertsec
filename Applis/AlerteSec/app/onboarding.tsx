import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
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

const { width, height } = Dimensions.get('window');

// Couleurs minimalistes
const COLORS = {
  primary: '#0091F5',
  primaryLight: '#E6F4FE',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#FFFFFF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
};

// Configuration des slides minimalistes
const slides = [
  {
    id: 1,
    title: "Signalez rapidement",
    subtitle: "En moins de 10 secondes",
    description: "Alertez les forces de l'ordre d'un danger en un simple clic. Votre position est automatiquement transmise.",
    icon: "flash-outline",
    color: COLORS.primary,
  },
  {
    id: 2,
    title: "Restez informé",
    subtitle: "Carte en temps réel",
    description: "Visualisez les zones de danger autour de vous grâce à notre carte interactive mise à jour en continu.",
    icon: "map-outline",
    color: COLORS.success,
  },
  {
    id: 3,
    title: "Sécurité collective",
    subtitle: "Ensemble, plus forts",
    description: "Rejoignez une communauté engagée pour la sécurité de tous. Chaque signalement compte pour protéger votre quartier.",
    icon: "people-outline",
    color: COLORS.warning,
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      
      // Animation de transition douce
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * width,
          animated: false,
        });
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Dernière slide - aller au choix du rôle
      router.push('/role-selection');
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/role-selection');
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prevIndex = currentIndex - 1;
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prevIndex);
        scrollViewRef.current?.scrollTo({
          x: prevIndex * width,
          animated: false,
        });
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header minimaliste */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={currentIndex > 0 ? handlePrevious : undefined}
          style={[
            styles.headerButton,
            { opacity: currentIndex > 0 ? 1 : 0.3 }
          ]}
          disabled={currentIndex === 0}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textLight} />
          <Text style={styles.headerButtonText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Ignorer</Text>
        </TouchableOpacity>
      </View>

      {/* Indicateurs de progression épurés */}
      <View style={styles.progressContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentIndex ? currentSlide.color : COLORS.border,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Contenu principal */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
            }
          }}
        >
          {slides.map((slide, index) => (
            <View key={slide.id} style={[styles.slide, { width }]}>
              
              {/* Illustration avec icône */}
              <View style={styles.illustrationContainer}>
                <View style={[styles.iconCircle, { backgroundColor: slide.color + '15' }]}>
                  <Ionicons 
                    name={slide.icon as any} 
                    size={80} 
                    color={slide.color} 
                  />
                </View>
              </View>

              {/* Contenu textuel épuré */}
              <View style={styles.textContent}>
                <Text style={[styles.slideTitle, { color: slide.color }]}>
                  {slide.title}
                </Text>
                
                <Text style={styles.slideSubtitle}>
                  {slide.subtitle}
                </Text>
                
                <Text style={styles.slideDescription}>
                  {slide.description}
                </Text>

                {/* Bouton Commencer pour la dernière slide */}
                {index === slides.length - 1 && (
                  <TouchableOpacity
                    onPress={() => router.push('/role-selection')}
                    style={[styles.startButton, { backgroundColor: slide.color }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.startButtonText}>Commencer</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.background} />
                  </TouchableOpacity>
                )}
              </View>

            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Bouton suivant (caché sur la dernière slide) */}
      {currentIndex < slides.length - 1 && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      )}

      {/* Footer épuré */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          En continuant, vous acceptez nos{' '}
          <Text style={[styles.footerLink, { color: currentSlide.color }]}>
            conditions d'utilisation
          </Text>
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  content: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
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
  slideSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.textLight,
  },
  footerLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});