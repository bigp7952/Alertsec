import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Types pour les cartes
export interface SignalementCardProps {
  id: string;
  type: string;
  description: string;
  gravite: 'critique' | 'moyen' | 'mineur';
  location: string;
  timestamp: string;
  status: 'en_attente' | 'en_cours' | 'resolu';
  onPress?: () => void;
  showActions?: boolean;
}

export interface ZoneCardProps {
  nom: string;
  niveau: 'rouge' | 'orange' | 'vert';
  nbSignalements: number;
  dernierSignalement: string;
  onPress?: () => void;
}

// Carte pour afficher un signalement
export function SignalementCard({
  id,
  type,
  description,
  gravite,
  location,
  timestamp,
  status,
  onPress,
  showActions = false
}: SignalementCardProps) {
  
  const getGraviteColor = () => {
    switch (gravite) {
      case 'critique':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'moyen':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'mineur':
        return 'bg-success-100 text-success-700 border-success-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'en_attente':
        return 'bg-neutral-100 text-neutral-600';
      case 'en_cours':
        return 'bg-primary-100 text-primary-600';
      case 'resolu':
        return 'bg-success-100 text-success-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours':
        return 'En cours';
      case 'resolu':
        return 'Résolu';
      default:
        return 'Inconnu';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-3"
    >
      {/* Header avec type et gravité */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-lg mr-2">
            {type === 'agression' ? '👊' : 
             type === 'vol' ? '💰' : 
             type === 'accident' ? '🚗' : 
             type === 'incendie' ? '🔥' : '⚠️'}
          </Text>
          <Text className="text-base font-semibold text-neutral-800 capitalize">
            {type}
          </Text>
        </View>
        
        <View className={`px-3 py-1 rounded-full border ${getGraviteColor()}`}>
          <Text className="text-xs font-medium capitalize">
            {gravite}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-sm text-neutral-600 mb-3 leading-5">
        {description}
      </Text>

      {/* Localisation et timestamp */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-neutral-500 text-xs mr-1">📍</Text>
          <Text className="text-xs text-neutral-500 flex-1" numberOfLines={1}>
            {location}
          </Text>
        </View>
        
        <Text className="text-xs text-neutral-400 ml-2">
          {timestamp}
        </Text>
      </View>

      {/* Status et actions */}
      <View className="flex-row items-center justify-between">
        <View className={`px-2 py-1 rounded-lg ${getStatusColor()}`}>
          <Text className="text-xs font-medium">
            {getStatusText()}
          </Text>
        </View>

        {showActions && (
          <View className="flex-row space-x-2">
            <TouchableOpacity className="bg-primary-100 px-3 py-1 rounded-lg">
              <Text className="text-primary-600 text-xs font-medium">
                Prendre en charge
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ID de référence */}
      <Text className="text-xs text-neutral-400 mt-2">
        Réf: #{id.slice(-6).toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

// Carte pour afficher une zone dangereuse
export function ZoneCard({
  nom,
  niveau,
  nbSignalements,
  dernierSignalement,
  onPress
}: ZoneCardProps) {
  
  const getNiveauConfig = () => {
    switch (niveau) {
      case 'rouge':
        return {
          gradient: ['#FEE2E2', '#FECACA'],
          borderColor: 'border-danger-200',
          textColor: 'text-danger-700',
          icon: '🔴',
          label: 'Zone critique'
        };
      case 'orange':
        return {
          gradient: ['#FEF3C7', '#FDE68A'],
          borderColor: 'border-warning-200',
          textColor: 'text-warning-700',
          icon: '🟡',
          label: 'Zone surveillée'
        };
      case 'vert':
        return {
          gradient: ['#D1FAE5', '#A7F3D0'],
          borderColor: 'border-success-200',
          textColor: 'text-success-700',
          icon: '🟢',
          label: 'Zone sûre'
        };
      default:
        return {
          gradient: ['#F3F4F6', '#E5E7EB'],
          borderColor: 'border-neutral-200',
          textColor: 'text-neutral-700',
          icon: '⚪',
          label: 'Zone inconnue'
        };
    }
  };

  const config = getNiveauConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-2xl shadow-sm border ${config.borderColor} mb-3 overflow-hidden`}
    >
      <LinearGradient colors={config.gradient} className="p-4">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">{config.icon}</Text>
            <Text className="text-base font-semibold text-neutral-800">
              {nom}
            </Text>
          </View>
          
          <View className={`px-2 py-1 rounded-lg bg-white/50`}>
            <Text className={`text-xs font-medium ${config.textColor}`}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Statistiques */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-sm text-neutral-600">
              {nbSignalements} signalement{nbSignalements > 1 ? 's' : ''}
            </Text>
          </View>
          
          <Text className="text-xs text-neutral-500">
            Dernier: {dernierSignalement}
          </Text>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
}

// Chip pour les tags de gravité
export function GraviteChip({ 
  gravite 
}: { 
  gravite: 'critique' | 'moyen' | 'mineur' 
}) {
  const getConfig = () => {
    switch (gravite) {
      case 'critique':
        return {
          bg: 'bg-danger-100',
          text: 'text-danger-700',
          border: 'border-danger-200'
        };
      case 'moyen':
        return {
          bg: 'bg-warning-100',
          text: 'text-warning-700',
          border: 'border-warning-200'
        };
      case 'mineur':
        return {
          bg: 'bg-success-100',
          text: 'text-success-700',
          border: 'border-success-200'
        };
      default:
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-700',
          border: 'border-neutral-200'
        };
    }
  };

  const config = getConfig();

  return (
    <View className={`px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
      <Text className={`text-xs font-medium ${config.text} capitalize`}>
        {gravite}
      </Text>
    </View>
  );
}

// Badge de notification
export function NotificationBadge({ 
  count, 
  className = '' 
}: { 
  count: number; 
  className?: string 
}) {
  if (count === 0) return null;

  return (
    <View className={`bg-danger-500 rounded-full min-w-5 h-5 items-center justify-center ${className}`}>
      <Text className="text-white text-xs font-bold">
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
}
