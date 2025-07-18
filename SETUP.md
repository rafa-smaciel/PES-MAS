# 🚀 Guia de Instalação - Sistema de Monitoramento Industrial

Este guia fornece instruções detalhadas para configurar e executar o sistema completo em diferentes ambientes.

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** 16.x ou superior
- **Python** 3.8 ou superior
- **MongoDB** 4.4 ou superior
- **Git** para controle de versão
- **Conta OpenAI** (opcional, para recomendações IA)

### Verificação de Requisitos
```bash
# Verificar versões instaladas
node --version     # v16.x.x ou superior
npm --version      # 8.x.x ou superior
python --version   # 3.8.x ou superior
mongo --version    # 4.4.x ou superior
git --version      # qualquer versão recente
```

## 🔧 Instalação Completa

### 1. Clonagem do Repositório
```bash
# Clonar o projeto
git clone https://github.com/usuario/sistema-monitoramento-industrial.git
cd sistema-monitoramento-industrial

# Verificar estrutura do projeto
ls -la
```

### 2. Configuração do MongoDB

#### Opção A: Instalação Local

**Ubuntu/Debian:**
```bash
# Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community@5.0

# Iniciar serviço
brew services start mongodb/brew/mongodb-community
```

**Windows:**
1. Baixar installer do [site oficial](https://www.mongodb.com/try/download/community)
2. Executar o installer como administrador
3. Escolher "Complete" installation
4. Configurar como Windows Service

#### Opção B: Docker
```bash
# Executar MongoDB em container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:5.0

# Verificar se está funcionando
docker ps | grep mongodb
```

#### Opção C: MongoDB Atlas (Nuvem)
1. Criar conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Criar cluster gratuito
3. Configurar usuário e IP whitelist
4. Obter string de conexão

### 3. Configuração do Python

#### Instalar Dependências Python
```bash
# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install pandas numpy datetime

# Verificar instalação
python -c "import pandas; print(pandas.__version__)"
```

### 4. Configuração do Backend

```bash
# Navegar para pasta do backend
cd backend/server

# Instalar dependências
npm install

# Criar arquivo de configuração
cp .env.example .env

# Editar configurações (usar seu editor preferido)
nano .env
```

#### Configuração do .env
```env
# === CONFIGURAÇÕES DO SERVIDOR ===
PORT=5000
NODE_ENV=development

# === BANCO DE DADOS ===
# Para MongoDB local:
MONGO_URL=mongodb://localhost:27017
# Para MongoDB Atlas:
# MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/

MONGO_DB=monitoramento_db
MONGO_COLLECTION=eventos
RECOMMENDATION_COLLECTION=recomendacoes

# === OPENAI (OPCIONAL) ===
# Obter em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# === ARQUIVOS E SCRIPTS ===
CONFIG_PATH=./config.json
PYTHON_PATH=python
# Windows: PYTHON_PATH=python.exe
# macOS/Linux com virtualenv: PYTHON_PATH=./venv/bin/python
```

#### Verificar Configuração do Backend
```bash
# Testar conexão com MongoDB
npm run test:db

# Iniciar servidor em modo desenvolvimento
npm run dev

# Verificar se API está funcionando
curl http://localhost:5000/equipamentos
```

### 5. Configuração do Frontend

```bash
# Navegar para pasta do frontend
cd ../../frontend

# Instalar dependências
npm install

# Criar arquivo de configuração
cp .env.example .env.local

# Editar configurações
nano .env.local
```

#### Configuração do .env.local
```env
# === API BACKEND ===
REACT_APP_API_URL=http://localhost:5000

# === CONFIGURAÇÕES DA APLICAÇÃO ===
REACT_APP_REFRESH_INTERVAL=30000
REACT_APP_CHART_ANIMATION=true
REACT_APP_DEBUG_MODE=true

# === ANÁLISE E MÉTRICAS (OPCIONAL) ===
REACT_APP_GOOGLE_ANALYTICS=
REACT_APP_SENTRY_DSN=
```

## 🚀 Execução do Sistema

### Método 1: Execução Manual

#### Terminal 1 - Backend
```bash
cd backend/server
npm run dev
# Servidor rodando em http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
# Aplicação rodando em http://localhost:3000
```

### Método 2: Usando Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar containers
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Método 3: Script de Inicialização

```bash
# Criar script start.sh
#!/bin/bash
echo "🚀 Iniciando Sistema de Monitoramento..."

# Verificar se MongoDB está rodando
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB não está rodando. Iniciando..."
    sudo systemctl start mongod
fi

# Verificar se as dependências estão instaladas
if [ ! -d "backend/server/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend/server && npm install && cd ../..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd backend/server
npm run dev &
BACKEND_PID=$!
cd ../..

# Aguardar backend inicializar
sleep 5

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Sistema iniciado com sucesso!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Para parar o sistema, execute: ./stop.sh"

# Salvar PIDs para script de parada
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Aguardar interrupção
wait
```

#### Script de Parada (stop.sh)
```bash
#!/bin/bash
echo "🛑 Parando Sistema de Monitoramento..."

# Parar processos
if [ -f .backend.pid ]; then
    kill $(cat .backend.pid) 2>/dev/null
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    kill $(cat .frontend.pid) 2>/dev/null
    rm .frontend.pid
fi

echo "✅ Sistema parado com sucesso!"
```

#### Tornar Scripts Executáveis
```bash
chmod +x start.sh stop.sh

# Executar
./start.sh
```

## 🧪 Verificação da Instalação

### 1. Teste de Conectividade

#### Backend
```bash
# Testar endpoints principais
curl -s http://localhost:5000/equipamentos | jq
curl -s http://localhost:5000/eventos | jq
curl -s http://localhost:5000/config | jq

# Verificar saúde da API
curl -s http://localhost:5000/health
```

#### Frontend
```bash
# Verificar se está servindo
curl -s http://localhost:3000 | grep "Sistema de Monitoramento"

# Verificar build de produção
cd frontend
npm run build
npm run preview
```

### 2. Teste de Funcionalidades

#### Inserir Dados de Teste
```javascript
// script/seed-data.js
const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'monitoramento_db';

const sampleEvents = [
  {
    equipment_id: 'EQ001',
    data_hora: new Date(),
    classe: 'Aprovado',
    total: 150,
    temperatura: 75.5,
    pressao: 2.3,
    velocidade: 1200
  },
  {
    equipment_id: 'EQ001',
    data_hora: new Date(Date.now() - 3600000),
    classe: 'Reprovado',
    total: 25,
    temperatura: 82.1,
    pressao: 2.8,
    velocidade: 1350
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Inserir eventos de exemplo
    await db.collection('eventos').insertMany(sampleEvents);
    console.log('✅ Dados de exemplo inseridos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
```

```bash
# Executar script de seed
node scripts/seed-data.js
```

### 3. Teste de Recomendações IA

```bash
# Gerar recomendação para equipamento
curl -X POST http://localhost:5000/recommendations/generate/EQ001

# Verificar recomendações geradas
curl http://localhost:5000/recommendations/EQ001 | jq
```

## 🐳 Configuração com Docker

### Docker Compose Completo

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: monitoring_db
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db
    networks:
      - monitoring_network

  backend:
    build: 
      context: ./backend/server
      dockerfile: Dockerfile
    container_name: monitoring_backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URL=mongodb://admin:password123@mongodb:27017/monitoramento_db?authSource=admin
      - PORT=5000
    depends_on:
      - mongodb
    networks:
      - monitoring_network
    volumes:
      - ./backend/server/config.json:/app/config.json

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: monitoring_frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - monitoring_network

volumes:
  mongodb_data:

networks:
  monitoring_network:
    driver: bridge
```

### Dockerfiles

#### Backend Dockerfile
```dockerfile
# backend/server/Dockerfile
FROM node:16-alpine

# Instalar Python para análise de dados
RUN apk add --no-cache python3 py3-pip
RUN pip3 install pandas numpy

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
# Estágio de build
FROM node:16-alpine as build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar build para nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração custom do nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Configuração do Nginx
```nginx
# frontend/nginx.conf
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Configuração para SPA
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy para API
        location /api/ {
            proxy_pass http://backend:5000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Configurações de cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Executar com Docker
```bash
# Build e start
docker-compose up --build -d

# Verificar status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar sistema
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## 🔧 Solução de Problemas

### Problemas Comuns

#### 1. MongoDB Não Conecta
```bash
# Verificar se está rodando
sudo systemctl status mongod

# Verificar logs
sudo journalctl -u mongod

# Reiniciar serviço
sudo systemctl restart mongod

# Testar conexão
mongo --eval "db.runCommand('ping')"
```

#### 2. Backend Não Inicia
```bash
# Verificar variáveis de ambiente
cat backend/server/.env

# Verificar dependências
cd backend/server
npm ls

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar porta
lsof -i :5000
```

#### 3. Frontend Não Carrega
```bash
# Verificar build
cd frontend
npm run build

# Verificar dependências
npm ls

# Limpar cache
npm start -- --reset-cache

# Verificar proxy
curl -v http://localhost:3000/api/equipamentos
```

#### 4. Python Scripts Falham
```bash
# Verificar Python
python --version
python -c "import pandas; print('OK')"

# Verificar ambiente virtual
which python
pip list | grep pandas

# Reinstalar dependências
pip install --force-reinstall pandas numpy
```

#### 5. OpenAI API Não Funciona
```bash
# Testar chave API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Verificar cota
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/usage
```

### Logs e Debugging

#### Logs do Sistema
```bash
# Backend logs
cd backend/server
npm run dev | tee logs/backend.log

# Frontend logs
cd frontend
npm start 2>&1 | tee logs/frontend.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System logs
journalctl -f -u mongod
```

#### Debug Mode
```bash
# Backend debug
cd backend/server
DEBUG=* npm run dev

# Frontend debug
cd frontend
REACT_APP_DEBUG_MODE=true npm start
```

## 📊 Monitoramento e Métricas

### Health Checks
```bash
# Script de monitoramento
#!/bin/bash
# monitor.sh

check_service() {
    if curl -s $1 > /dev/null; then
        echo "✅ $2 está online"
    else
        echo "❌ $2 está offline"
        return 1
    fi
}

echo "🔍 Verificando serviços..."
check_service "http://localhost:5000/health" "Backend"
check_service "http://localhost:3000" "Frontend"
check_service "http://localhost:27017" "MongoDB"

# Verificar uso de recursos
echo ""
echo "📈 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Backup e Restore

#### Backup MongoDB
```bash
# Backup completo
mongodump --host localhost:27017 --db monitoramento_db --out ./backup/$(date +%Y%m%d)

# Backup específico
mongodump --host localhost:27017 --db monitoramento_db --collection eventos --out ./backup/eventos_$(date +%Y%m%d)

# Automatizar backup diário
echo "0 2 * * * mongodump --host localhost:27017 --db monitoramento_db --out /backup/\$(date +\%Y\%m\%d)" | crontab -
```

#### Restore MongoDB
```bash
# Restore completo
mongorestore --host localhost:27017 --db monitoramento_db ./backup/20241215/monitoramento_db/

# Restore de coleção específica
mongorestore --host localhost:27017 --db monitoramento_db --collection eventos ./backup/eventos_20241215/monitoramento_db/eventos.bson
```

## 🔐 Configuração de Produção

### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/monitoring
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # SSL Certificates
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### PM2 para Produção
```bash
# Instalar PM2
npm install -g pm2

# Configurar aplicação
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'monitoring-backend',
    script: './backend/server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};

# Iniciar em produção
pm2 start ecosystem.config.js --env production

# Configurar auto-start
pm2 startup
pm2 save
```

### Variáveis de Ambiente de Produção
```env
# .env.production
NODE_ENV=production
PORT=5000

# MongoDB com autenticação
MONGO_URL=mongodb://user:password@localhost:27017/monitoramento_db?authSource=admin

# OpenAI com rate limiting
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MAX_REQUESTS_PER_MINUTE=100

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/monitoring/app.log

# Security
JWT_SECRET=sua_chave_jwt_super_secreta
SESSION_SECRET=sua_chave_sessao_super_secreta

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com
```

## 📚 Próximos Passos

### Melhorias Recomendadas
1. **Implementar autenticação JWT**
2. **Adicionar testes automatizados**
3. **Configurar CI/CD pipeline**
4. **Implementar cache Redis**
5. **Adicionar notificações push**
6. **Criar dashboard de administração**
7. **Implementar backup automatizado**

### Recursos Adicionais
- [Documentação MongoDB](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/)

---

**🎓 Para Estudantes**: Este setup demonstra uma arquitetura full-stack completa. Experimente modificar configurações, adicionar funcionalidades e entender como cada parte se integra!

**Última Atualização**: Dezembro 2024  
**Versão**: 1.0.0