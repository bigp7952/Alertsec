# 📖 Guide Utilisateur - Vigil Alert Hub

## 🔐 Connexion à l'Application

### Identifiants de Test

| Rôle | Matricule | Mot de passe | Code service | Code 2FA |
|------|-----------|--------------|--------------|----------|
| **Admin** | POL001 | admin123 | DEMO | 123456 |
| **Superviseur** | POL002 | super123 | DEMO | 123456 |
| **Agent** | POL003 | agent123 | DEMO | 123456 |
| **Opérateur** | OPE001 | ope123 | DEMO | 123456 |

### Méthode 1 : Authentification Classique

1. **Ouvrir l'application** : `http://localhost:5173`
2. **Sélectionner** : "Identifiants"
3. **Saisir** :
   - Matricule : `POL001`
   - Mot de passe : `admin123`
   - Code service : `DEMO`
4. **Cliquer** : "Se connecter"
5. **Saisir le code 2FA** : `123456`
6. **Cliquer** : "Vérifier"

### Méthode 2 : Authentification OTP (Code SMS)

1. **Ouvrir l'application** : `http://localhost:5173`
2. **Sélectionner** : "Code SMS"
3. **Saisir le matricule** : `POL001` (comme numéro de téléphone)
4. **Cliquer** : "Envoyer le code OTP"
5. **Saisir le code** : `123456` (affiché en mode développement)
6. **Cliquer** : "Vérifier le code"

### Résultat Attendu

Après connexion réussie :
- ✅ Dashboard avec statistiques
- ✅ Nom et grade en haut à droite
- ✅ Menu de navigation à gauche
- ✅ Icône de notifications
- ✅ Pas d'erreurs dans la console

---

## 🐛 Résolution des Problèmes

### Erreur : "Mot de passe incorrect"
1. Vérifiez que vous utilisez les bons identifiants
2. Assurez-vous qu'il n'y a pas d'espaces avant/après
3. Vérifiez que la casse est correcte (minuscules/majuscules)

### Erreur : "Matricule non reconnu"
- Utilisez exactement : `POL001`, `POL002`, `POL003`, ou `OPE001`

### Erreur : "Code de service invalide"
- Utilisez exactement : `DEMO` (en majuscules)

### Erreur : "Code 2FA invalide"
- Utilisez exactement : `123456`

### Erreur : "Code OTP invalide"
- Le code expire après 5 minutes
- Cliquez sur "Renvoyer le code"
- Vérifiez le code affiché en mode développement

### Vérifications Techniques

1. **Console du navigateur** (F12)
   - Pas d'erreurs JavaScript
   - Pas d'erreurs de réseau

2. **Redémarrage du serveur**
   ```bash
   npm run dev
   ```

3. **Vider le cache**
   - Ctrl+F5 (rechargement forcé)
   - Vider le localStorage

4. **Vérifier les identifiants**
   - Copier-coller exactement
   - Pas d'espaces avant/après

---

## 🔐 Authentification OTP (Code SMS)

### Fonctionnalités OTP

#### Implémentées
- ✅ Génération de codes OTP sécurisés (6 chiffres)
- ✅ Vérification automatique
- ✅ Expiration après 5 minutes
- ✅ Compte à rebours pour renvoi
- ✅ Mode développement avec affichage du code
- ✅ Validation des numéros existants
- ✅ Interface utilisateur intuitive

#### Sécurité
- Codes à 6 chiffres
- Expiration automatique
- Utilisation unique
- Nettoyage automatique
- Validation des numéros
- Protection contre le spam

### Processus OTP

1. **Saisir le matricule** → `POL001`
2. **Recevoir le code** → `123456` (en mode dev)
3. **Vérifier le code** → Connexion réussie
4. **Accès au dashboard** → Interface complète

### Codes de Test

Utilisez ces matricules comme numéros de téléphone :
- `POL001` - Commissaire DIOP
- `POL002` - Inspecteur FALL
- `POL003` - Agent SARR
- `OPE001` - Opérateur BA

**Code OTP pour tous** : `123456`

---

## 🎯 Utilisation des Fonctionnalités

### Dashboard
- Vue d'ensemble en temps réel
- Graphiques dynamiques
- Carte interactive
- Activité récente

### Signalements
- Liste des signalements avec filtres
- Vue carte/grille
- Assignation d'agents
- Détails complets avec médias
- Communication avec citoyens

### Tracking des Agents
- Positions GPS en temps réel
- Métriques de performance
- Alertes batterie faible
- Statut de mission

### Zones de Danger
- Calcul automatique des zones
- 3 modes d'affichage (Liste, Carte, Analytics)
- Actions sur les zones (patrouilles, éclairage, caméras)
- Génération de rapports

### Notifications
- Centre de notifications
- Filtres par type et priorité
- Actions contextuelles
- Historique complet

---

## 💡 Conseils d'Utilisation

1. **Commencez par la méthode 1** (authentification classique) qui est la plus simple
2. **Gardez ce guide ouvert** pendant vos tests
3. **Vérifiez la console** (F12) en cas de problème
4. **Utilisez les identifiants exacts** ci-dessus
5. **Testez avec différents rôles** pour voir les permissions

---

## 📞 Support

Si le problème persiste :
1. Vérifiez que le serveur fonctionne (`npm run dev`)
2. Testez avec différents navigateurs
3. Vérifiez les logs de la console
4. Utilisez les identifiants exacts ci-dessus
5. Consultez la [DOCUMENTATION.md](DOCUMENTATION.md) pour plus de détails techniques

---

**💡 Conseil** : Pour une première connexion, utilisez le compte Admin (POL001 / admin123 / DEMO / 123456) qui donne accès à toutes les fonctionnalités.

