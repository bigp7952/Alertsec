# 🔄 Guide de Migration - Réorganisation du Projet

Ce guide explique comment migrer vers la nouvelle structure organisée du projet AlertSec.

## 📋 Vue d'Ensemble

La réorganisation vise à :
- ✅ Organiser la documentation dans `docs/`
- ✅ Renommer les dossiers avec des noms standards
- ✅ Nettoyer les fichiers de test/correction dispersés
- ✅ Créer une structure professionnelle et maintenable

## 🚀 Étapes de Migration

### Option 1 : Script Automatique (Recommandé)

#### Windows
```powershell
.\scripts\reorganize-project.ps1
```

#### Linux/Mac
```bash
chmod +x scripts/reorganize-project.sh
./scripts/reorganize-project.sh
```

### Option 2 : Migration Manuelle

#### 1. Organiser la Documentation

Créez la structure :
```bash
mkdir -p docs/{architecture,api,deployment,development,user-guides}
```

Déplacez les fichiers selon le mapping :

**Backend → docs/**
- `BackendAlertsec/BACKEND_COMPLET.md` → `docs/architecture/backend-complete.md`
- `BackendAlertsec/INSTALLATION.md` → `docs/deployment/backend-installation.md`
- `BackendAlertsec/INTEGRATION_COMPLETE.md` → `docs/development/backend-integration.md`
- `BackendAlertsec/TEST_*.md` → `docs/development/backend-*.md`
- `BackendAlertsec/CORRECTION_*.md` → `docs/development/backend-*.md`

**Frontend → docs/**
- `Admin-Forces-de_Lordre/vigil-alert-hub/GUIDE_*.md` → `docs/development/frontend-*.md`
- `Admin-Forces-de_Lordre/vigil-alert-hub/TEST_*.md` → `docs/development/frontend-*.md`
- `Admin-Forces-de_Lordre/vigil-alert-hub/*.md` → `docs/development/frontend-*.md`

**Mobile → docs/**
- `Applis/AlerteSec/GUIDE_*.md` → `docs/development/mobile-*.md`

**Racine → docs/**
- `DOCKER_README.md` → `docs/deployment/docker-guide.md`

#### 2. Renommer les Dossiers (Optionnel mais Recommandé)

```bash
# Backend
mv BackendAlertsec backend

# Frontend
mv "Admin-Forces-de_Lordre/vigil-alert-hub" frontend

# Mobile
mv "Applis/AlerteSec" mobile
```

⚠️ **Important** : Si vous renommez les dossiers, vous devez mettre à jour :
- `docker-compose.yml`
- Les scripts de démarrage
- Les chemins dans la documentation

#### 3. Mettre à Jour docker-compose.yml

Si vous avez renommé les dossiers, modifiez `docker-compose.yml` :

```yaml
# Avant
context: ./BackendAlertsec
context: ./Admin-Forces-de_Lordre/vigil-alert-hub

# Après
context: ./backend
context: ./frontend
```

#### 4. Mettre à Jour les Scripts

Mettez à jour `start-docker.ps1` et `start-docker.sh` avec les nouveaux chemins.

#### 5. Nettoyer les Fichiers Anciens

Après vérification, supprimez les fichiers de documentation déplacés :

```bash
# Backend
rm BackendAlertsec/*.md  # Sauf README.md

# Frontend
rm Admin-Forces-de_Lordre/vigil-alert-hub/*.md  # Sauf README.md

# Mobile
rm Applis/AlerteSec/GUIDE_*.md

# Racine
rm DOCKER_README.md
```

## ✅ Vérification Post-Migration

1. **Documentation**
   - Vérifiez que tous les fichiers sont dans `docs/`
   - Testez les liens dans la documentation

2. **Docker**
   - Testez `docker-compose up -d --build`
   - Vérifiez que tous les services démarrent

3. **Scripts**
   - Testez les scripts de démarrage
   - Vérifiez les chemins relatifs

4. **Git**
   - Vérifiez `.gitignore`
   - Committez les changements

## 🔄 Rollback

Si vous devez revenir en arrière :

1. Restaurez depuis Git : `git checkout HEAD -- .`
2. Ou restaurez manuellement les fichiers depuis `docs/`

## 📝 Notes

- Les fichiers originaux ne sont **pas supprimés automatiquement** par les scripts
- Vous pouvez les supprimer manuellement après vérification
- Les README.md dans chaque dossier sont conservés
- La structure actuelle continue de fonctionner pendant la transition

## 🆘 Problèmes Courants

### Les chemins Docker ne fonctionnent plus
→ Vérifiez que `docker-compose.yml` utilise les bons chemins

### Les liens de documentation sont cassés
→ Mettez à jour les liens dans les fichiers Markdown

### Les scripts ne trouvent pas les fichiers
→ Vérifiez les chemins relatifs dans les scripts

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez ce guide
2. Vérifiez les logs d'erreur
3. Ouvrez une issue sur GitHub

---

**Bon courage avec la migration ! 🚀**

