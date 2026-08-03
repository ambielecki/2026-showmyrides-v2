FROM php:8.5.7-fpm

RUN apt-get update && \
    apt-get upgrade -y

RUN apt-get install -y --force-yes \
      git \
      gnupg \
      libgd-dev \
      libwebp-dev \
      libxml2-dev \
      libzip-dev \
      nano \
      unzip \
      vim \
      zip \
      zlib1g-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp &&  \
      docker-php-ext-install gd

# Install latest node and npm (node 16)
RUN  apt-get update -yq \
    && curl -sL https://deb.nodesource.com/setup_26.x | bash \
    && apt-get install nodejs -yq

# Install composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer && \
    printf "\nPATH=\"~/.composer/vendor/bin:\$PATH\"\n" | tee -a ~/.bashrc

RUN composer global require laravel/installer

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    soap \
    zip

COPY ./ssh-keys /root/.ssh
COPY ./uploads.ini /usr/local/etc/php/conf.d/uploads.ini
RUN chmod 600 /root/.ssh/id_rsa
