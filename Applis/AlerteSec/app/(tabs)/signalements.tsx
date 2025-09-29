import { PrimaryButton } from '@/components/ui/buttons';
import { SignalementCard } from '@/components/ui/cards';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Données de démonstration
const DEMO_SIGNALEMENTS = [
  {
    id: '1',
    type: 'agression',
    description: 'Individu agressif dans le métro ligne 1, station Châtelet',
    gravite: 'critique' as const,
    location: 'Métro Châtelet - Les Halles',
    timestamp: 'Il y a 15 min',
    status: 'en_cours' as const
  },
  {
    id: '2',
    type: 'vol',
    description: 'Tentative de vol de sac à main devant la boulangerie',
    gravite: 'moyen' as const,
    location: 'Rue de Rivoli, 75001',
    timestamp: 'Il y a 2h',
    status: 'resolu' as const
  },
  {
    id: '3',
    type: 'accident',
    description: 'Collision entre deux véhicules, embouteillages',
    gravite: 'mineur' as const,
    location: 'Boulevard Saint-Germain',
    timestamp: 'Il y a 1 jour',
    status: 'resolu' as const
  }
];

export default function SignalementsScreen() {
  const [signalements] = useState(DEMO_SIGNALEMENTS);
  const [filter, setFilter] = useState<'tous' | 'en_cours' | 'resolu'>('tous');

  const filteredSignalements = signalements.filter(signalement => {
    if (filter === 'tous') return true;
    return signalement.status === filter;
  });

  const getFilterCount = (filterType: 'tous' | 'en_cours' | 'resolu') => {
    if (filterType === 'tous') return signalements.length;
    return signalements.filter(s => s.status === filterType).length;
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-neutral-200">
        <Text className="text-2xl font-bold text-neutral-800 mb-2">
          Mes signalements
        </Text>
        <Text className="text-sm text-neutral-600">
          Suivez l'état de vos alertes
        </Text>
      </View>

      {/* Filtres */}
      <View className="bg-white px-4 py-3 border-b border-neutral-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            
            <TouchableOpacity
              onPress={() => setFilter('tous')}
              className={`px-4 py-2 rounded-full border ${
                filter === 'tous' 
                  ? 'bg-primary-500 border-primary-500' 
                  : 'bg-white border-neutral-300'
              }`}
            >
              <Text className={`font-medium ${
                filter === 'tous' ? 'text-white' : 'text-neutral-600'
              }`}>
                Tous ({getFilterCount('tous')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('en_cours')}
              className={`px-4 py-2 rounded-full border ${
                filter === 'en_cours' 
                  ? 'bg-warning-500 border-warning-500' 
                  : 'bg-white border-neutral-300'
              }`}
            >
              <Text className={`font-medium ${
                filter === 'en_cours' ? 'text-white' : 'text-neutral-600'
              }`}>
                En cours ({getFilterCount('en_cours')})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('resolu')}
              className={`px-4 py-2 rounded-full border ${
                filter === 'resolu' 
                  ? 'bg-success-500 border-success-500' 
                  : 'bg-white border-neutral-300'
              }`}
            >
              <Text className={`font-medium ${
                filter === 'resolu' ? 'text-white' : 'text-neutral-600'
              }`}>
                Résolus ({getFilterCount('resolu')})
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>

      {/* Liste des signalements */}
      <ScrollView className="flex-1 px-4 pt-4">
        {filteredSignalements.length > 0 ? (
          filteredSignalements.map((signalement) => (
            <SignalementCard
              key={signalement.id}
              {...signalement}
              onPress={() => {
                // Navigation vers détail du signalement
                console.log('Voir détail:', signalement.id);
              }}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-lg font-semibold text-neutral-800 mb-2">
              Aucun signalement
            </Text>
            <Text className="text-sm text-neutral-600 text-center px-8 mb-8">
              {filter === 'tous' 
                ? 'Vous n\'avez encore fait aucun signalement'
                : `Aucun signalement ${filter === 'en_cours' ? 'en cours' : 'résolu'}`
              }
            </Text>
            
            {filter === 'tous' && (
               <PrimaryButton
                 title="Faire un signalement"
                 onPress={() => {
                   router.push('/signalement/nouveau');
                 }}
                 icon="🚨"
               />
            )}
          </View>
        )}
      </ScrollView>

      {/* Statistiques rapides */}
      {signalements.length > 0 && (
        <View className="bg-white border-t border-neutral-200 p-4">
          <View className="flex-row justify-around">
            
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-500">
                {signalements.length}
              </Text>
              <Text className="text-xs text-neutral-600">
                Total
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-warning-500">
                {getFilterCount('en_cours')}
              </Text>
              <Text className="text-xs text-neutral-600">
                En cours
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-success-500">
                {getFilterCount('resolu')}
              </Text>
              <Text className="text-xs text-neutral-600">
                Résolus
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-2xl font-bold text-neutral-800">
                {Math.round((getFilterCount('resolu') / signalements.length) * 100)}%
              </Text>
              <Text className="text-xs text-neutral-600">
                Taux résolution
              </Text>
            </View>

          </View>
        </View>
      )}

    </View>
  );
}
