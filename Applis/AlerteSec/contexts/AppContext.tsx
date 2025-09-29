import * as Location from 'expo-location';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Types
interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface AppState {
  userLocation: UserLocation | null;
  userType: 'citizen' | 'law_enforcement' | null;
  isAuthenticated: boolean;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  isMapInitialized: boolean;
}

interface AppContextType extends AppState {
  setUserLocation: (location: UserLocation | null) => void;
  setUserType: (type: 'citizen' | 'law_enforcement' | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setMapRegion: (region: AppState['mapRegion']) => void;
  setMapInitialized: (initialized: boolean) => void;
  initializeLocation: () => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [userType, setUserType] = useState<'citizen' | 'law_enforcement' | null>(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [mapRegion, setMapRegion] = useState<AppState['mapRegion']>(null);
  const [isMapInitialized, setMapInitialized] = useState(false);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        if (location && location.coords) {
          const userLoc: UserLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
          };

          setUserLocation(userLoc);
          
          // Initialiser la région de la carte si elle n'est pas définie
          if (!mapRegion) {
            setMapRegion({
              latitude: userLoc.latitude,
              longitude: userLoc.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      } else {
        // Position par défaut si pas de permission
        const defaultLocation: UserLocation = {
          latitude: 14.7167,
          longitude: -17.4677,
          accuracy: 0,
        };
        setUserLocation(defaultLocation);
        
        if (!mapRegion) {
          setMapRegion({
            latitude: defaultLocation.latitude,
            longitude: defaultLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    } catch (error) {
      console.error('Erreur initialisation localisation:', error);
      // Position par défaut en cas d'erreur
      const defaultLocation: UserLocation = {
        latitude: 14.7167,
        longitude: -17.4677,
        accuracy: 0,
      };
      setUserLocation(defaultLocation);
      
      if (!mapRegion) {
        setMapRegion({
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  const logout = () => {
    setUserType(null);
    setAuthenticated(false);
    setUserLocation(null);
    setMapRegion(null);
    setMapInitialized(false);
  };

  const value: AppContextType = {
    userLocation,
    userType,
    isAuthenticated,
    mapRegion,
    isMapInitialized,
    setUserLocation,
    setUserType,
    setAuthenticated,
    setMapRegion,
    setMapInitialized,
    initializeLocation,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
