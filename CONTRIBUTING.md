# 🤝 Guide de Contribution - AlertSec

Merci de votre intérêt pour contribuer au projet AlertSec ! Ce document fournit les directives pour contribuer au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Structure du Projet](#structure-du-projet)

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :
- Être respectueux et inclusif
- Accepter les critiques constructives
- Se concentrer sur ce qui est meilleur pour la communauté
- Montrer de l'empathie envers les autres membres

## 🚀 Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec :
   - Un titre clair et descriptif
   - Une description détaillée du problème
   - Les étapes pour reproduire
   - Le comportement attendu vs. réel
   - Des captures d'écran si applicable

### Proposer une Fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été proposée
2. Créez une issue avec :
   - Une description claire de la fonctionnalité
   - Le cas d'usage
   - Les avantages potentiels
   - Des exemples si applicable

### Soumettre du Code

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 💻 Standards de Code

### Général

- Suivez les conventions de nommage du langage
- Écrivez du code lisible et maintenable
- Ajoutez des commentaires pour le code complexe
- Gardez les fonctions courtes et focalisées

### PHP (Laravel)

- Suivez [PSR-12](https://www.php-fig.org/psr/psr-12/)
- Utilisez les conventions Laravel
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les méthodes publiques

### TypeScript/JavaScript

- Utilisez ESLint et Prettier
- Suivez les conventions React/TypeScript
- Écrivez des composants réutilisables
- Ajoutez des types TypeScript

### Git

- Utilisez des messages de commit clairs et descriptifs
- Format : `type(scope): description`
- Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples :
```
feat(auth): add OTP authentication
fix(api): resolve CORS issue
docs(readme): update installation guide
```

## 🔄 Processus de Pull Request

1. **Préparation**
   - Assurez-vous que votre code suit les standards
   - Ajoutez/mettez à jour les tests
   - Mettez à jour la documentation si nécessaire

2. **Soumission**
   - Créez une PR claire avec description
   - Référencez les issues liées
   - Ajoutez des captures d'écran pour les changements UI

3. **Révision**
   - Répondez aux commentaires
   - Effectuez les modifications demandées
   - Gardez la PR à jour avec la branche principale

## 📁 Structure du Projet

```
alertsec/
├── backend/          # API Laravel
├── frontend/         # Dashboard React
├── mobile/           # App Mobile Expo
├── docs/             # Documentation
└── scripts/          # Scripts utilitaires
```

Consultez [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) pour plus de détails.

## ✅ Checklist avant de Soumettre

- [ ] Le code suit les standards du projet
- [ ] Les tests passent localement
- [ ] La documentation est à jour
- [ ] Les commits suivent les conventions
- [ ] La PR a une description claire
- [ ] Les changements sont testés

## 🆘 Besoin d'Aide ?

- Ouvrez une issue pour poser une question
- Consultez la [documentation](docs/README.md)
- Contactez les mainteneurs

Merci de contribuer à AlertSec ! 🎉

