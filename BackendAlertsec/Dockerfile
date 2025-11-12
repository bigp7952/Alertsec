FROM php:8.2-cli

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && docker-php-ext-enable pdo_mysql mbstring exif pcntl bcmath gd zip

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Installer Node.js et npm pour Vite
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Créer le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers de configuration
COPY composer.json composer.lock ./
COPY package.json package-lock.json* ./

# Installer les dépendances PHP (sans scripts pour éviter les erreurs)
RUN composer install --no-scripts --no-autoloader

# Copier le reste des fichiers
COPY . .

# Finaliser l'installation de Composer
RUN composer dump-autoload --optimize

# Installer les dépendances Node.js
RUN npm install

# Définir les permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Exposer le port
EXPOSE 8000

# Commande par défaut (sera surchargée par docker-compose)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

