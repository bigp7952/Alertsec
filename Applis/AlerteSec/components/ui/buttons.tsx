import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

// Types pour les boutons
export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: string;
  className?: string;
}

export interface SOSButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  size?: 'medium' | 'large';
  className?: string;
}

// Bouton principal réutilisable
export function PrimaryButton({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  className = ''
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return disabled 
          ? 'bg-neutral-300' 
          : 'bg-primary-500';
      case 'secondary':
        return disabled 
          ? 'bg-neutral-200 border border-neutral-300' 
          : 'bg-white border border-primary-500';
      case 'danger':
        return disabled 
          ? 'bg-neutral-300' 
          : 'bg-danger-500';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-primary-500';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return 'text-white';
      case 'secondary':
        return disabled ? 'text-neutral-500' : 'text-primary-500';
      case 'ghost':
        return 'text-primary-500';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'medium':
        return 'py-3 px-6';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl
        items-center
        justify-center
        flex-row
        ${className}
      `}
    >
      {loading ? (
        <View className="flex-row items-center">
          <LoadingSpinner />
          <Text className={`${getTextStyles()} font-semibold ml-2`}>
            Chargement...
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center">
          {icon && (
            <Text className="text-lg mr-2">{icon}</Text>
          )}
          <Text className={`${getTextStyles()} font-semibold text-base`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Bouton SOS avec animations spéciales
export function SOSButton({ 
  onPress, 
  onLongPress,
  disabled = false,
  size = 'large',
  className = ''
}: SOSButtonProps) {
  
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animation de pulse continue
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animation de glow
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    if (!disabled) {
      pulse.start();
      glow.start();
    }

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [disabled]);

  const buttonSize = size === 'large' ? 'w-20 h-20' : 'w-16 h-16';

  return (
    <View className={`items-center justify-center ${className}`}>
      {/* Glow effect */}
      <Animated.View
        className="absolute"
        style={{
          opacity: glowAnim,
          transform: [{ scale: pulseAnim }],
        }}
      >
        <View className={`${buttonSize} bg-danger-500 rounded-full opacity-20`} />
      </Animated.View>

      {/* Bouton principal */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          activeOpacity={0.8}
          className={`${buttonSize} items-center justify-center overflow-hidden`}
        >
          <LinearGradient
            colors={disabled ? ['#9CA3AF', '#6B7280'] : ['#EF4444', '#DC2626', '#B91C1C']}
            className={`${buttonSize} items-center justify-center rounded-full shadow-lg`}
          >
            <Text className="text-white text-2xl font-bold">SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Label */}
      <Text className="text-xs text-neutral-600 mt-2 font-medium">
        Appui long pour alerte
      </Text>
    </View>
  );
}

// Bouton Ghost (transparent)
export function GhostButton({ 
  title, 
  onPress, 
  disabled = false,
  icon,
  className = ''
}: Omit<ButtonProps, 'variant'>) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      className={`py-2 px-4 flex-row items-center justify-center ${className}`}
    >
      {icon && (
        <Text className="text-lg mr-2">{icon}</Text>
      )}
      <Text className={`text-primary-500 font-medium ${disabled ? 'opacity-50' : ''}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Composant de loading spinner
function LoadingSpinner() {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
      <Text className="text-current text-base">⭐</Text>
    </Animated.View>
  );
}
