import Constants from 'expo-constants';

/**
 * Vérifie si l'application fonctionne dans Expo Go
 * Expo Go a des limitations pour certaines fonctionnalités
 */
export const isExpoGo = () => {
  return __DEV__ && Constants.appOwnership === 'expo';
};

/**
 * Vérifie si les notifications push sont disponibles
 * Dans Expo Go, les notifications push ne fonctionnent pas
 */
export const arePushNotificationsAvailable = () => {
  return !isExpoGo();
};

/**
 * Vérifie si l'accès à la bibliothèque média est disponible
 * Dans Expo Go, l'accès complet à la bibliothèque média est limité
 */
export const isMediaLibraryAccessAvailable = () => {
  return !isExpoGo();
};

/**
 * Affiche un message d'avertissement pour les fonctionnalités non disponibles dans Expo Go
 */
export const showExpoGoWarning = (feature: string) => {
  if (isExpoGo()) {
    console.warn(
      `⚠️ ${feature} n'est pas entièrement supporté dans Expo Go. ` +
      `Pour tester cette fonctionnalité, créez un development build. ` +
      `Plus d'infos: https://docs.expo.dev/develop/development-builds/create-a-build`
    );
  }
};




