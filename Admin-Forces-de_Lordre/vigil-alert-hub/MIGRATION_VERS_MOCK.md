# Migration vers les données mockées

## 📋 Résumé des changements

Cette migration a transformé l'application **Vigil Alert Hub** d'un système utilisant Supabase vers un système utilisant des données mockées (simulées) pour la démonstration.

## 🔄 Changements effectués

### 1. Authentification
- ✅ Remplacement de l'authentification Supabase par des identifiants par défaut
- ✅ Tous les comptes utilisent maintenant le mot de passe : `demo123`
- ✅ Code de service unifié : `DEMO`
- ✅ Code 2FA : `123456`

### 2. Services de données
- ✅ Création de `src/lib/mock-data.ts` avec des données simulées
- ✅ Création de `src/lib/mock-services.ts` avec les services mockés
- ✅ Remplacement de `src/lib/supabase.ts` pour utiliser les services mockés
- ✅ Mise à jour de `src/lib/auth-service.ts` pour l'authentification mockée

### 3. Nettoyage des fichiers
- ✅ Suppression de tous les fichiers SQL Supabase
- ✅ Suppression de la documentation Supabase
- ✅ Suppression du serveur backend (`server/index.js`)
- ✅ Suppression des dépendances inutiles

### 4. Configuration
- ✅ Mise à jour du `package.json`
- ✅ Suppression des scripts backend
- ✅ Suppression des dépendances Supabase, Express, Socket.IO
- ✅ Mise à jour du README.md

## 🔐 Comptes de connexion

| Matricule | Mot de passe | Code Service | Rôle | Description |
|-----------|-------------|--------------|------|-------------|
| POL001 | demo123 | DEMO | admin | Commissaire DIOP - Accès complet |
| POL002 | demo123 | DEMO | superviseur | Inspecteur FALL - Supervision |
| POL003 | demo123 | DEMO | agent | Agent SARR - Agent de terrain |
| OPE001 | demo123 | DEMO | operateur | Opérateur BA - Central d'opérations |

**Code 2FA** : `123456` (pour tous les comptes)

## 📊 Données disponibles

### Signalements mockés
- 5 signalements avec différents niveaux de priorité
- Géolocalisation dans la région de Dakar
- Statuts variés (non traité, en cours, traité)
- Agents assignés

### Agents mockés
- 4 agents avec positions GPS
- Statuts : disponible, en mission
- Secteurs d'intervention définis

### Notifications mockées
- 4 notifications de démonstration
- Types variés : info, warning, error, success
- Statuts lus/non lus

### Utilisateurs mockés
- 4 utilisateurs correspondant aux comptes de connexion
- Rôles et permissions définis
- Informations complètes (grade, unité, secteur)

## 🚀 Démarrage de l'application

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build de production
npm run build

# Aperçu de la build
npm run preview
```

## ✨ Fonctionnalités simulées

### Temps réel simulé
- Les services mockés incluent des fonctions de simulation temps réel
- Génération automatique de nouvelles notifications
- Mise à jour des positions d'agents
- Changements d'état des signalements

### Persistance simulée
- Les données sont maintenues en mémoire pendant la session
- Les modifications sont conservées jusqu'au rechargement de la page
- Simulation de délais d'API pour un comportement réaliste

## 🔧 Développement

### Structure des services mockés

```
src/lib/
├── mock-data.ts        # Données de base (utilisateurs, signalements, etc.)
├── mock-services.ts    # Services simulant les appels API
├── auth-service.ts     # Service d'authentification mocké
└── supabase.ts        # Exports des services mockés
```

### Avantages de cette approche

1. **Simplicité** : Aucune configuration de base de données requise
2. **Démonstration** : Données cohérentes et prévisibles
3. **Développement** : Tests et développement facilités
4. **Déploiement** : Application entièrement autonome

## 📝 Notes importantes

- ⚠️ Les données sont réinitialisées à chaque rechargement de page
- ⚠️ Cette version est destinée à la démonstration uniquement
- ⚠️ Pour un usage en production, une vraie base de données est nécessaire
- ✅ Toutes les fonctionnalités de l'interface restent opérationnelles
- ✅ L'expérience utilisateur est préservée

## 🔄 Migration vers production

Pour migrer vers un système de production :

1. Remplacer les services mockés par de vrais appels API
2. Implémenter une base de données (PostgreSQL, MongoDB, etc.)
3. Mettre en place un système d'authentification sécurisé
4. Ajouter la validation côté serveur
5. Implémenter les notifications temps réel (WebSocket, SSE)

## 🎯 Résultat

L'application **Vigil Alert Hub** fonctionne maintenant entièrement avec des données mockées, offrant une expérience de démonstration complète sans dépendances externes.

