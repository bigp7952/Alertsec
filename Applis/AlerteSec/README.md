# AlerteSec 🚨

**Sécurité citoyenne en temps réel**

AlerteSec est une application mobile permettant aux citoyens de signaler des dangers en temps réel et aux forces de l'ordre de réagir rapidement. Une interface unique avec des fonctionnalités adaptées selon le rôle (citoyen vs force de l'ordre).

## ✨ Fonctionnalités principales

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

## 🛠 Technologies utilisées

- **Expo Router** - Navigation file-based
- **React Native** - Framework mobile cross-platform  
- **NativeWind (Tailwind CSS)** - Styling moderne et responsive
- **React Native Maps** - Cartographie interactive
- **Expo Location** - Géolocalisation précise
- **React Native Reanimated** - Animations fluides
- **TypeScript** - Typage statique pour plus de robustesse

## 🚀 Installation et lancement

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Lancer l'application**
   ```bash
   npx expo start
   ```

3. **Options de lancement**
   - 📱 **Expo Go** : Scanner le QR code
   - 🤖 **Android** : `npx expo start --android`
   - 🍎 **iOS** : `npx expo start --ios`
   - 🌐 **Web** : `npx expo start --web`

## 📱 Guide d'utilisation

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

### Comptes de démonstration

**Force de l'ordre :**
- Matricule: `DEMO`
- Nom: `DEMO`  
- Mot de passe: `demo123`

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

## 📂 Structure du projet

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

components/ui/
├── buttons.tsx             # Composants boutons
└── cards.tsx              # Composants cartes
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

## 📊 Algorithme zones de danger

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

## 🤝 Contribution

L'application est conçue pour être facilement extensible :

1. **Backend** : Intégration API REST/GraphQL
2. **WebSockets** : Notifications temps réel
3. **Push notifications** : Alertes critiques
4. **Base de données** : PostgreSQL/MongoDB recommandé
5. **Analytics** : Suivi des métriques de sécurité

## 📄 Licence

Ce projet est développé dans le cadre d'une démonstration technique.
Pour un déploiement en production, veuillez consulter les réglementations locales concernant les applications de sécurité publique.

---

**AlerteSec** - *Ensemble, plus forts pour la sécurité de tous* 🤝
