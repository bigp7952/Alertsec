# 🔐 Guide de Connexion - Vigil Alert Hub

## 📋 **Identifiants de Test Simplifiés**

### 👨‍💼 **Admin (Accès Complet)**
- **Matricule** : `POL001`
- **Mot de passe** : `admin123`
- **Code service** : `DEMO`

### 👩‍💼 **Superviseur**
- **Matricule** : `POL002`
- **Mot de passe** : `super123`
- **Code service** : `DEMO`

### 👮‍♂️ **Agent de Terrain**
- **Matricule** : `POL003`
- **Mot de passe** : `agent123`
- **Code service** : `DEMO`

### 📞 **Opérateur**
- **Matricule** : `OPE001`
- **Mot de passe** : `ope123`
- **Code service** : `DEMO`

## 🔢 **Code 2FA**
**Pour tous les comptes** : `123456`

## 🚀 **Étapes de Connexion**

### 1. **Accéder à l'application**
- Ouvrez votre navigateur
- Allez sur : `http://localhost:5173`

### 2. **Saisir les identifiants**
- **Matricule** : Entrez le matricule (ex: `POL001`)
- **Mot de passe** : Entrez le mot de passe (ex: `admin123`)
- **Code service** : Entrez `DEMO`

### 3. **Vérification 2FA**
- Entrez le code : `123456`
- Cliquez sur "Vérifier"

### 4. **Connexion réussie**
- Vous serez redirigé vers le dashboard
- Votre session durera 8 heures

## 🐛 **Résolution des problèmes**

### **Erreur : "Mot de passe incorrect"**
1. Vérifiez que vous utilisez les bons identifiants
2. Assurez-vous qu'il n'y a pas d'espaces avant/après
3. Vérifiez que la casse est correcte (minuscules/majuscules)

### **Erreur : "Matricule non reconnu"**
- Utilisez exactement : `POL001`, `POL002`, `POL003`, ou `OPE001`

### **Erreur : "Code de service invalide"**
- Utilisez exactement : `DEMO` (en majuscules)

### **Erreur : "Code 2FA invalide"**
- Utilisez exactement : `123456`

## 📱 **Test Rapide**

**Pour tester rapidement, utilisez :**
```
Matricule : POL001
Mot de passe : admin123
Code service : DEMO
Code 2FA : 123456
```

## 🔍 **Debug**

Si vous avez encore des problèmes :
1. Ouvrez la console du navigateur (F12)
2. Regardez les logs de connexion
3. Vérifiez que les identifiants correspondent

## ✅ **Vérification**

Une fois connecté, vous devriez voir :
- Le dashboard avec les statistiques
- Votre nom et grade en haut à droite
- L'icône de notifications
- Le menu de navigation à gauche

---

**💡 Conseil** : Gardez ce guide ouvert pendant vos tests ! 