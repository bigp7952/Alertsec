# 📖 Guide d'Authentification et Utilisation - AlerteSec Mobile

## 🔐 Authentification

### Système d'Authentification

L'application utilise Laravel Sanctum pour l'authentification sécurisée avec gestion des sessions persistantes.

### Comptes de Test

#### Force de l'ordre
- **Matricule**: `DEMO`
- **Nom**: `DEMO`
- **Mot de passe**: `demo123`

#### Citoyen
- **Email**: `citoyen1@alertsec.com`
- **Mot de passe**: `password`

### Comment Tester

#### 1. Démarrer le backend
```bash
cd BackendAlertsec
php artisan serve
```

#### 2. Démarrer l'application mobile
```bash
cd Applis/AlerteSec
npm start
```

#### 3. Accéder à la page de test
- Naviguer vers `/auth-test` dans l'application
- Tester la connexion avec les comptes de démonstration

### Comptes de Démonstration

Le backend fournit des comptes de démonstration via l'endpoint `/api/users/demo-accounts` :

- **ADM001** - Administrateur
- **SUP001** - Superviseur 1
- **SUP002** - Superviseur 2
- **SUP003** - Superviseur 3

### API Endpoints Disponibles

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/logout-all` - Déconnexion globale
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil
- `POST /api/auth/change-password` - Changement de mot de passe

#### Comptes de démonstration
- `GET /api/users/demo-accounts` - Liste des comptes de test

### Gestion des Sessions

#### Stockage local
- **Token** : Stocké de manière sécurisée
- **Utilisateur** : Données du profil utilisateur
- **Expiration** : Session de 7 jours par défaut
- **Rafraîchissement** : Automatique en cas d'expiration

#### Persistance
- ✅ Session maintenue entre les redémarrages de l'app
- ✅ Reconnexion automatique si session valide
- ✅ Déconnexion automatique si session expirée

### Flux d'Authentification

1. **Initialisation** : L'app vérifie s'il y a une session valide
2. **Connexion** : Si pas de session, affichage du formulaire de connexion
3. **Authentification** : Validation des identifiants côté serveur
4. **Stockage** : Sauvegarde du token et des données utilisateur
5. **Navigation** : Accès aux fonctionnalités selon le rôle

### Rôles et Permissions

- **admin** : Accès complet à toutes les fonctionnalités
- **superviseur** : Gestion des agents et signalements
- **agent** : Traitement des signalements assignés
- **citoyen** : Création de signalements

### Gestion des Erreurs

- **Session expirée** : Déconnexion automatique
- **Token invalide** : Rafraîchissement automatique
- **Erreur réseau** : Messages d'erreur appropriés
- **Données manquantes** : Validation côté client et serveur

### Exemple d'Utilisation

```typescript
import { useApi } from '../contexts/ApiContext';

const { login, logout, user, isAuthenticated } = useApi();

// Connexion
await login({
  matricule: 'ADM001',
  password: 'password123',
  device_name: 'Mon Appareil'
});

// Vérification de l'état
if (isAuthenticated && user) {
  console.log(`Connecté en tant que ${user.nom} ${user.prenom}`);
}

// Déconnexion
await logout();
```

### Sécurité

- **HTTPS** : Obligatoire en production
- **Tokens** : Expiration automatique
- **Stockage** : Chiffrement des données sensibles
- **Validation** : Côté client et serveur
- **Sessions** : Nettoyage automatique

---

## 🐛 Dépannage

### Problèmes Courants

#### 1. Session non persistante
- Vérifier AsyncStorage
- Vérifier la configuration du backend

#### 2. Token expiré
- Vérifier la date d'expiration
- Vérifier le rafraîchissement automatique

#### 3. Erreur 401
- Vérifier la validité du token
- Vérifier l'authentification côté serveur

#### 4. Connexion échouée
- Vérifier les identifiants
- Vérifier la connexion au backend

### Logs Utiles

- Console du navigateur pour les erreurs frontend
- Logs Laravel pour les erreurs backend
- AsyncStorage pour vérifier le stockage local

---

## 📱 Utilisation de l'Application

### Premier Lancement
1. **SplashScreen animé** (3 secondes)
2. **Onboarding interactif** (3 écrans swipables)
3. **Sélection du rôle** : Citoyen ou Force de l'ordre
4. **Authentification** selon le profil choisi

### Flow Citoyen - Alerte Rapide
1. Ouvrir l'app → **Bouton SOS visible** (coin bas-droit)
2. **Appui court** : Modal avec options (Immédiat / Détaillé)
3. **Appui long** : Alerte automatique envoyée
4. **Géolocalisation** automatique + confirmation visuelle
5. **Total < 10 secondes** ⚡

### Flow Force de l'Ordre
1. Connexion avec matricule et mot de passe
2. Accès à l'interface de gestion
3. Traitement des signalements assignés
4. Suivi des interventions en temps réel

---

## 🔄 Prochaines Étapes

1. **Tests complets** de l'authentification
2. **Intégration** avec les autres fonctionnalités
3. **Optimisation** des performances
4. **Tests de sécurité** approfondis
5. **Documentation** utilisateur finale

---

**AlerteSec Mobile** - Guide d'authentification et utilisation

