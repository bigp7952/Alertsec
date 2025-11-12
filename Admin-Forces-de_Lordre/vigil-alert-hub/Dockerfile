FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 5173

# Commande de démarrage
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

