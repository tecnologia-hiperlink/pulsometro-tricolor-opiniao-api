#!/bin/bash
# Script para iniciar a API e Worker no servidor

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ir para o diretório da API
cd /var/www/html/pulsometrotricolor/pulsometro-tricolor-opiniao-api

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup

echo "API e Worker iniciados com PM2"
echo "Use 'pm2 list' para ver status"
echo "Use 'pm2 logs' para ver logs"
