# Backend - Sistema de Monitoramento Industrial

## 📋 Visão Geral

O backend do sistema é uma API REST desenvolvida em Node.js com Express.js, responsável por gerenciar dados de equipamentos industriais, processar análises de padrões e integrar com serviços de inteligência artificial para geração de recomendações.

## 🏗️ Arquitetura do Backend

```
Backend Architecture
├── server.js                 # Servidor principal
├── routes/
│   ├── eventos.js            # Rotas para eventos
│   ├── equipamentos.js       # Rotas para equipamentos
│   ├── recomendacoes.js      # Rotas para recomendações
│   └── config.js             # Rotas para configuração
├── services/
│   ├── patternAnalysis.js    # Análise de padrões
│   ├── aiRecommendations.js  # Integração com IA
│   └── dataProcessing.js     # Processamento de dados
├── models/
│   ├── Event.js              # Modelo de eventos
│   ├── Equipment.js          # Modelo de equipamentos
│   └── Recommendation.js     # Modelo de recomendações
└── utils/
    ├── database.js           # Utilitários do banco
    ├── validation.js         # Validações
    └── logger.js             # Sistema de logs
```

## 🔧 Dependências Principais

### Produção
```json
{
  "express": "^4.21.2",      // Framework web
  "mongodb": "^5.9.2",       // Driver MongoDB
  "axios": "^1.9.0",         // Cliente HTTP
  "cors": "^2.8.5",          // Cross-Origin Resource Sharing
  "dotenv": "^16.5.0",       // Variáveis de ambiente
  "body-parser": "^1.20.3"   // Parser de requisições
}
```

### Desenvolvimento
```json
{
  "nodemon": "^3.0.1",       // Auto-restart em desenvolvimento
  "jest": "^29.0.0",         // Framework de testes
  "supertest": "^6.3.0"      // Testes de API
}
```

## 🗄️ Estrutura do Banco de Dados

### Coleção: `eventos`
```javascript
{
  _id: ObjectId,
  equipment_id: String,      // ID do equipamento
  data_hora: Date,          // Timestamp do evento
  classe: String,           // "Aprovado" ou "Reprovado"
  total: Number,            // Quantidade processada
  temperatura: Number,      // Temperatura do equipamento
  pressao: Number,          // Pressão do sistema
  velocidade: Number,       // Velocidade de operação
  created_at: Date,         // Data de criação
  updated_at: Date          // Data de atualização
}
```

### Coleção: `recomendacoes`
```javascript
{
  _id: ObjectId,
  equipment_id: String,         // ID do equipamento
  timestamp: Date,             // Momento da geração
  recommendation_text: String, // Texto da recomendação
  priority: Number,            // Prioridade (1-5)
  patterns: Array,             // Padrões detectados
  status: String,              // "active", "implemented", "dismissed"
  confidence: Number,          // Nível de confiança (0-1)
  created_by: String,          // "system" ou user_id
  metadata: Object             // Dados adicionais
}
```

## 🚀 Instalação e Configuração

### 1. Instalação das Dependências
```bash
cd backend/server
npm install
```

### 2. Configuração do Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

### 3. Variáveis de Ambiente Obrigatórias
```env
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URL=mongodb://localhost:27017
MONGO_DB=monitoramento_db
MONGO_COLLECTION=eventos
RECOMMENDATION_COLLECTION=recomendacoes

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurações
CONFIG_PATH=./config.json

# Python
PYTHON_PATH=/usr/bin/python3
ANALYSIS_SCRIPT_PATH=./scripts/analisar_dados.py
```

### 4. Inicialização do Banco
```bash
# Iniciar MongoDB
mongod

# Criar índices (opcional)
mongo monitoramento_db --eval "
  db.eventos.createIndex({equipment_id: 1, data_hora: -1});
  db.recomendacoes.createIndex({equipment_id: 1, timestamp: -1});
"
```

## 🛠️ Executando o Servidor

### Desenvolvimento
```bash
npm run dev
# ou
npm start
```

### Produção
```bash
npm run start:prod
```

### Com Docker
```bash
docker build -t monitoring-backend .
docker run -p 5000:5000 monitoring-backend
```

## 📡 Endpoints da API

### 🔍 Eventos

#### `GET /eventos`
Retorna todos os eventos do sistema.

**Parâmetros de Query:**
- `equipment_id` (opcional): Filtrar por equipamento
- `start_date` (opcional): Data inicial (ISO 8601)
- `end_date` (opcional): Data final (ISO 8601)
- `limit` (opcional): Limite de registros (padrão: 100)
- `offset` (opcional): Offset para paginação

**Exemplo de Resposta:**
```json
[
  {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "equipment_id": "EQ001",
    "data_hora": "2024-01-15T14:30:00Z",
    "classe": "Aprovado",
    "total": 150,
    "temperatura": 75.5,
    "pressao": 2.3,
    "velocidade": 1200
  }
]
```

#### `GET /eventos/aprovados`
Retorna apenas eventos aprovados.

#### `GET /eventos/reprovados`
Retorna apenas eventos reprovados.

### 🏭 Equipamentos

#### `GET /equipamentos`
Lista todos os equipamentos disponíveis.

**Exemplo de Resposta:**
```json
["EQ001", "EQ002", "EQ003", "LINE_A", "LINE_B"]
```

### 🤖 Recomendações

#### `GET /recommendations/:equipmentId`
Obtém recomendações para um equipamento específico.

**Parâmetros:**
- `equipmentId`: ID do equipamento
- `status` (query, opcional): Filtrar por status ("active", "implemented", "dismissed")

**Exemplo de Resposta:**
```json
[
  {
    "id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "equipment_id": "EQ001",
    "timestamp": "2024-01-15T14:30:00Z",
    "recommendation_text": "Ajustar temperatura de operação para 72-78°C para reduzir taxa de rejeição",
    "priority": 4,
    "patterns": [
      {
        "pattern_type": "alta_taxa_rejeicao",
        "description": "Taxa de rejeição elevada de 23.5%",
        "confidence": 0.87,
        "supporting_data": {
          "rejection_rate": 0.235,
          "total_items": 1000,
          "rejected_items": 235
        }
      }
    ],
    "status": "active"
  }
]
```

#### `POST /recommendations/generate/:equipmentId`
Gera nova recomendação para um equipamento.

**Processo:**
1. Coleta dados recentes do equipamento
2. Executa análise de padrões via Python
3. Gera recomendação via OpenAI
4. Salva no banco de dados

#### `PUT /recommendations/:recommendationId/status`
Atualiza o status de uma recomendação.

**Parâmetros de Query:**
- `status`: Novo status ("active", "implemented", "dismissed")

### ⚙️ Configuração

#### `GET /config`
Obtém configurações do sistema.

#### `POST /config`
Salva configurações do sistema.

**Exemplo de Body:**
```json
{
  "refresh_interval": 30000,
  "max_events_display": 100,
  "api_timeout": 5000,
  "analysis_window_hours": 24
}
```

## 🧮 Análise de Padrões

### Processo de Detecção
1. **Coleta de Dados**: Últimas 24 horas por padrão
2. **Pré-processamento**: Limpeza e validação
3. **Análise Estatística**: Cálculos via Python/Pandas
4. **Detecção de Padrões**: Algoritmos específicos
5. **Classificação**: Confiança e tipo de padrão

### Tipos de Padrões Detectados

#### 1. Alta Taxa de Rejeição
```javascript
{
  pattern_type: "alta_taxa_rejeicao",
  description: "Taxa de rejeição elevada de 23.5%",
  confidence: 0.87,
  supporting_data: {
    rejection_rate: 0.235,
    total_items: 1000,
    rejected_items: 235
  }
}
```

#### 2. Sequência de Rejeições
```javascript
{
  pattern_type: "sequencia_rejeicoes",
  description: "Sequência de 5 rejeições consecutivas",
  confidence: 0.92,
  supporting_data: {
    consecutive_count: 5,
    timestamps: ["2024-01-15T14:30:00Z", "..."]
  }
}
```

#### 3. Padrão Temporal
```javascript
{
  pattern_type: "padrao_temporal",
  description: "Taxa de rejeição elevada (35.2%) no horário 14h",
  confidence: 0.73,
  supporting_data: {
    hour: 14,
    rejection_rate: 0.352,
    avg_rejection_rate: 0.15
  }
}
```

## 🤖 Integração com IA

### Configuração OpenAI
```javascript
const generateRecommendations = async (equipmentId, patterns) => {
  const prompt = `
    Analise os seguintes padrões detectados no equipamento ${equipmentId}:
    ${JSON.stringify(patterns, null, 2)}
    
    Forneça:
    1. Recomendação específica
    2. Prioridade (1-5)
    3. Justificativa técnica
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "Você é um especialista em otimização industrial." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });
  
  return parseAIResponse(response.choices[0].message.content);
};
```

### Exemplo de Resposta da IA
```json
{
  "recommendation": "Implementar controle adaptativo de temperatura baseado na análise temporal. Reduzir temperatura para 72°C durante o período das 14h-16h.",
  "priority": 4,
  "justification": "O padrão temporal indica correlação entre temperatura elevada e rejeições no período vespertino. A implementação de controle adaptativo pode reduzir a taxa de rejeição em aproximadamente 18%."
}
```

## 🔒 Segurança e Validação

### Middleware de Validação
```javascript
const validateEventData = (req, res, next) => {
  const { equipment_id, classe, total } = req.body;
  
  if (!equipment_id || typeof equipment_id !== 'string') {
    return res.status(400).json({ error: 'equipment_id é obrigatório' });
  }
  
  if (!['Aprovado', 'Reprovado'].includes(classe)) {
    return res.status(400).json({ error: 'classe deve ser Aprovado ou Reprovado' });
  }
  
  if (!total || total < 0) {
    return res.status(400).json({ error: 'total deve ser um número positivo' });
  }
  
  next();
};
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições, tente novamente em 15 minutos'
});
```

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── unit/
│   ├── services/
│   │   ├── patternAnalysis.test.js
│   │   └── aiRecommendations.test.js
│   └── utils/
│       └── validation.test.js
├── integration/
│   ├── events.test.js
│   ├── recommendations.test.js
│   └── database.test.js
└── e2e/
    └── api.test.js
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes específicos
npm run test:unit
npm run test:integration
npm run test:e2e

# Testes com coverage
npm run test:coverage
```

### Exemplo de Teste
```javascript
describe('Pattern Analysis Service', () => {
  test('should detect high rejection rate pattern', async () => {
    const mockEvents = [
      { classe: 'Aprovado', total: 70 },
      { classe: 'Reprovado', total: 30 }
    ];
    
    const patterns = await detectPatterns('EQ001', mockEvents);
    
    expect(patterns).toHaveLength(1);
    expect(patterns[0].pattern_type).toBe('alta_taxa_rejeicao');
    expect(patterns[0].confidence).toBeGreaterThan(0.8);
  });
});
```

## 📊 Monitoramento e Logs

### Sistema de Logs
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Métricas de Performance
- Tempo de resposta das APIs
- Número de requisições por minuto
- Taxa de erro das requisições
- Uso de memória e CPU
- Conexões ativas com MongoDB

## 🚨 Tratamento de Erros

### Error Handler Global
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
  
  if (err.name === 'MongoError') {
    return res.status(500).json({ error: 'Erro no banco de dados' });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
};
```

## 🔧 Scripts Úteis

### package.json scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "seed": "node scripts/seed-database.js",
    "migrate": "node scripts/migrate-database.js"
  }
}
```

### Seed do Banco de Dados
```bash
# Popular banco com dados de exemplo
npm run seed

# Migrar estrutura do banco
npm run migrate
```

## 📈 Performance e Otimização

### Otimizações Implementadas
1. **Índices MongoDB**: Consultas otimizadas
2. **Cache em Memória**: Resultados frequentes
3. **Paginação**: Limite de registros por requisição
4. **Compressão**: Middleware de compressão gzip
5. **Connection Pooling**: Pool de conexões MongoDB

### Configurações de Produção
```javascript
// Produção
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(helmet());
  app.set('trust proxy', 1);
}
```

## 🔄 Deploy e DevOps

### Dockerfile
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
```

## 📚 Recursos Educacionais

### Conceitos Demonstrados
1. **REST API Design**: Endpoints bem estruturados
2. **Database Integration**: MongoDB com Node.js
3. **Error Handling**: Tratamento robusto de erros
4. **Authentication**: (Para implementação futura)
5. **Testing**: Testes unitários e integração
6. **Logging**: Sistema de logs estruturado
7. **Performance**: Otimizações e cache

### Exercícios Propostos
1. Implementar autenticação JWT
2. Adicionar cache Redis
3. Criar webhook para notificações
4. Implementar GraphQL além da REST API
5. Adicionar documentação Swagger/OpenAPI

---

**Última Atualização**: Dezembro 2024  
**Versão**: 1.0.0