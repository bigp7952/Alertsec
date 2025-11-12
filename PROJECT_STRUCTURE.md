# 📁 Structure du Projet AlertSec

## 🎯 Organisation Professionnelle

```
alertsec/
├── .github/                    # Configuration GitHub (CI/CD, templates)
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
├── docs/                       # Documentation complète du projet
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   ├── development/
│   └── user-guides/
├── backend/                    # API Laravel
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/                   # Dashboard React
│   ├── src/
│   ├── public/
│   └── dist/
├── mobile/                     # Application Mobile Expo
│   ├── app/
│   ├── components/
│   └── services/
├── scripts/                    # Scripts utilitaires
│   ├── setup.sh
│   └── deploy.sh
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .editorconfig
└── README.md
```

## 📂 Détails des Dossiers

### `.github/`
- Workflows CI/CD
- Templates d'issues et PR
- Configuration des contributions

### `docs/`
- **architecture/**: Diagrammes, schémas d'architecture
- **api/**: Documentation API (OpenAPI/Swagger)
- **deployment/**: Guides de déploiement
- **development/**: Guides de développement
- **user-guides/**: Guides utilisateur

### `backend/`
Structure Laravel standard avec organisation par domaine métier

### `frontend/`
Structure React/Vite avec organisation par fonctionnalité

### `mobile/`
Structure Expo/React Native avec organisation par écrans

### `scripts/`
Scripts de setup, déploiement, maintenance

