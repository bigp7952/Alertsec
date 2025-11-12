# 🚨 AlerteSec - Application Mobile

**Sécurité citoyenne en temps réel**

Application mobile permettant aux citoyens de signaler des dangers en temps réel et aux forces de l'ordre de réagir rapidement. Une interface unique avec des fonctionnalités adaptées selon le rôle (citoyen vs force de l'ordre).

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Lancer l'application
npx expo start
```

**Options de lancement** :
- 📱 **Expo Go** : Scanner le QR code
- 🤖 **Android** : `npx expo start --android`
- 🍎 **iOS** : `npx expo start --ios`
- 🌐 **Web** : `npx expo start --web`

## 🔐 Comptes de Test

**Force de l'ordre :**
- Matricule: `DEMO`
- Nom: `DEMO`
- Mot de passe: `demo123`

**Citoyen :**
- Email: `citoyen1@alertsec.com`
- Mot de passe: `password`

## ✨ Fonctionnalités Principales

### Pour les citoyens
- **Alerte SOS ultra-rapide** : Signalement en moins de 10 secondes
- **Carte interactive** : Visualisation des zones de danger en temps réel
- **Suivi des signalements** : Historique et statut de vos alertes
- **Interface intuitive** : Design épuré optimisé pour l'urgence

### Pour les forces de l'ordre
- **Gestion centralisée** : Interface dédiée pour traiter les signalements
- **Authentification sécurisée** : Accès par matricule et vérification
- **Dispatch intelligent** : Attribution et suivi des interventions

### Système de zones intelligentes
- **Calcul automatique** : Zones de danger basées sur les signalements récents
- **Algorithme de scoring** : Pondération par gravité et décroissance temporelle
- **Mise à jour temps réel** : Actualisation continue des niveaux de risque

## 🛠️ Technologies

- **Expo Router** - Navigation file-based
- **React Native** - Framework mobile cross-platform
- **NativeWind (Tailwind CSS)** - Styling moderne et responsive
- **React Native Maps** - Cartographie interactive
- **Expo Location** - Géolocalisation précise
- **React Native Reanimated** - Animations fluides
- **TypeScript** - Typage statique pour plus de robustesse

## 📱 Guide d'Utilisation

### Premier lancement
1. **SplashScreen animé** (3 secondes)
2. **Onboarding interactif** (3 écrans swipables)
3. **Sélection du rôle** : Citoyen ou Force de l'ordre
4. **Authentification** selon le profil choisi

### Flow citoyen - Alerte rapide
1. Ouvrir l'app → **Bouton SOS visible** (coin bas-droit)
2. **Appui court** : Modal avec options (Immédiat / Détaillé)
3. **Appui long** : Alerte automatique envoyée
4. **Géolocalisation** automatique + confirmation visuelle
5. **Total < 10 secondes** ⚡

## 📚 Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentation technique complète
- **[GUIDE.md](GUIDE.md)** - Guide d'authentification et utilisation

## 🎨 Design System

### Palette de couleurs
- **Primaire** : `#0091F5` (Bleu AlerteSec)
- **Danger** : `#EF4444` (Rouge SOS)
- **Warning** : `#F59E0B` (Orange)
- **Success** : `#10B981` (Vert)
- **Neutral** : Échelle de gris moderne

### Composants réutilisables
- `PrimaryButton` / `SOSButton` / `GhostButton`
- `SignalementCard` / `ZoneCard` / `NotificationBadge`
- Animations : fade, scale, pulse, slide (200-300ms)

## 📂 Structure du Projet

```
app/
├── splash.tsx              # Écran de chargement animé
├── onboarding.tsx          # Introduction (3 slides)
├── role-selection.tsx      # Choix citoyen/force
├── auth/                   # Authentification
│   ├── login-citoyen.tsx
│   ├── register-citoyen.tsx
│   └── login-force.tsx
├── signalement/            # Création d'alertes
│   └── nouveau.tsx
└── (tabs)/                 # Interface principale
    ├── index.tsx           # Carte + SOS
    ├── signalements.tsx    # Mes alertes
    ├── explore.tsx         # Communauté
    └── profile.tsx         # Profil utilisateur
```

## 🔧 Configuration

### NativeWind (Tailwind CSS)
- Configuration dans `tailwind.config.js`
- Classes CSS importées via `global.css`
- Support mode sombre automatique

### Géolocalisation
- Permissions automatiques au premier lancement
- Fallback sur Paris (48.8566, 2.3522) si échec
- Précision élevée pour les signalements

## 📊 Algorithme Zones de Danger

```javascript
// Calcul du score de danger pour une zone
score = Σ(poids_gravité × weight_timeDecay)

// Pondération par gravité
critique = 3, moyen = 2, mineur = 1

// Décroissance temporelle (24h par défaut)
weight_timeDecay = exp(-(now - created_at) / T)

// Classification des zones
score > S_high => Rouge (critique)
score > S_med  => Orange (surveillée)
sinon         => Vert (sûre)
```

## 🛡️ Sécurité & Confidentialité

- **Chiffrement** : Données sensibles protégées
- **Authentification** : Vérification côté serveur pour les forces
- **Logs d'accès** : Traçabilité des actions
- **Masquage** : Numéros partiellement cachés sur l'UI publique
- **RGPD** : Respect de la vie privée des utilisateurs

---

**AlerteSec** - *Ensemble, plus forts pour la sécurité de tous* 🤝
