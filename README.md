# Sistema de Monitoramento Industrial

## 📋 Visão Geral

Este projeto é um sistema completo de monitoramento industrial desenvolvido para fins educacionais na disciplina de Engenharia de Software. O sistema demonstra a implementação de uma arquitetura full-stack moderna, integrando análise de dados em tempo real, visualizações interativas e recomendações baseadas em inteligência artificial.

### 🎯 Objetivos Educacionais

- **Arquitetura de Software**: Demonstrar padrões de arquitetura full-stack
- **Integração de Tecnologias**: Mostrar como diferentes tecnologias trabalham juntas
- **Análise de Dados**: Implementar pipeline de análise de dados industriais
- **Interface de Usuário**: Criar dashboards responsivos e interativos
- **Inteligência Artificial**: Integrar IA para geração de insights automatizados

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React.js)    │◄──►│  (Express.js)   │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST APIs     │    │ • Eventos       │
│ • Visualizações │    │ • Análise de    │    │ • Recomendações │
│ • Recomendações │    │   Padrões       │    │ • Configurações │
└─────────────────┘    │ • IA Integration│    └─────────────────┘
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Python        │
                       │   (Análise)     │
                       │                 │
                       │ • Pandas        │
                       │ • Detecção de   │
                       │   Padrões       │
                       └─────────────────┘
```

## 🚀 Tecnologias Utilizadas

### Frontend
- **React.js 18+**: Framework para interface de usuário
- **Chart.js**: Biblioteca para gráficos interativos
- **CSS3**: Estilização responsiva e moderna
- **JavaScript ES6+**: Linguagem de programação principal

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web para APIs
- **MongoDB**: Banco de dados NoSQL
- **Python**: Análise de dados e detecção de padrões
- **OpenAI API**: Inteligência artificial para recomendações

### Ferramentas e Bibliotecas
- **Pandas**: Manipulação e análise de dados
- **Axios**: Cliente HTTP para requisições
- **CORS**: Middleware para Cross-Origin Resource Sharing
- **dotenv**: Gerenciamento de variáveis de ambiente

## 📊 Funcionalidades Principais

### 1. Dashboard em Tempo Real
- **Métricas OEE**: Overall Equipment Effectiveness
  - Qualidade: Itens aprovados / Total produzido
  - Performance: Taxa real / Taxa teórica
  - Disponibilidade: Tempo operação / Tempo planejado
  - Utilização: Tempo produtivo / Tempo disponível

### 2. Visualizações Interativas
- **Gráfico de Pizza**: Distribuição aprovados/reprovados
- **Gráfico de Linha**: Tendência temporal (7 dias)
- **Gráfico de Barras**: Distribuição por hora do dia
- **Tabelas**: Eventos recentes em tempo real

### 3. Sistema de Recomendações IA
- **Detecção de Padrões**: Análise automatizada de anomalias
- **Recomendações Inteligentes**: Sugestões baseadas em IA
- **Gestão de Status**: Implementado/Ativo/Descartado
- **Priorização**: Sistema de prioridades (1-5)

### 4. Análise de Dados Avançada
- **Processamento em Python**: Análise estatística robusta
- **Detecção de Anomalias**: Identificação automática de problemas
- **Análise Temporal**: Padrões baseados em tempo
- **Métricas Calculadas**: KPIs industriais automatizados

## 🗂️ Estrutura do Projeto

```
sistema-monitoramento-industrial/
├── backend/
│   ├── server/
│   │   ├── server.js              # Servidor principal Express
│   │   ├── package.json           # Dependências do backend
│   │   └── .env.example           # Exemplo de variáveis de ambiente
│   └── scripts/
│       └── analisar_dados.py      # Scripts de análise Python
├── frontend/
│   ├── src/
│   │   ├── Dashboard.jsx          # Componente principal do dashboard
│   │   ├── Dashboard.css          # Estilos do dashboard
│   │   ├── Recommendations.jsx    # Sistema de recomendações
│   │   └── services/
│   │       └── ConfigService.js   # Serviços de configuração
│   ├── public/
│   │   └── index.html            # HTML principal
│   └── package.json              # Dependências do frontend
├── docs/
│   ├── SETUP.md                  # Guia de instalação
│   ├── API.md                    # Documentação da API
│   └── ARCHITECTURE.md           # Documentação da arquitetura
└── README.md                     # Este arquivo
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- Python 3.8+
- MongoDB 4.4+
- Conta OpenAI (para recomendações IA)

### 1. Clonagem do Repositório
```bash
git clone https://github.com/usuario/sistema-monitoramento-industrial.git
cd sistema-monitoramento-industrial
```

### 2. Configuração do Backend
```bash
cd backend/server
npm install

# Criar arquivo .env baseado no exemplo
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

### 3. Configuração do Frontend
```bash
cd frontend
npm install
```

### 4. Configuração do Python
```bash
pip install pandas numpy datetime
```

### 5. Configuração do MongoDB
```bash
# Iniciar MongoDB
mongod

# Criar banco de dados (opcional - será criado automaticamente)
mongo
> use monitoramento_db
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/server/` com:

```env
# Configurações do servidor
PORT=5000

# MongoDB
MONGO_URL=mongodb://localhost:27017
MONGO_DB=monitoramento_db
MONGO_COLLECTION=eventos
RECOMMENDATION_COLLECTION=recomendacoes

# OpenAI (para recomendações IA)
OPENAI_API_KEY=sua_chave_openai_aqui

# Arquivos
CONFIG_PATH=./config.json
```

## 🚀 Executando o Sistema

### 1. Iniciar o Backend
```bash
cd backend/server
npm start
# ou para desenvolvimento:
npm run dev
```

### 2. Iniciar o Frontend
```bash
cd frontend
npm start
```

### 3. Acessar o Sistema
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Componentes Educacionais

### 1. Padrões de Arquitetura
- **MVC**: Model-View-Controller
- **REST API**: Comunicação cliente-servidor
- **Microserviços**: Separação de responsabilidades
- **Event-Driven**: Programação orientada a eventos

### 2. Conceitos de Engenharia de Software
- **Modularização**: Código organizado em módulos
- **Separação de Responsabilidades**: Backend/Frontend/Database
- **Reutilização**: Componentes e funções reutilizáveis
- **Manutenibilidade**: Código limpo e documentado

### 3. Boas Práticas
- **Error Handling**: Tratamento robusto de erros
- **Validation**: Validação de dados de entrada
- **Security**: Práticas básicas de segurança
- **Performance**: Otimizações e cache

## 🔍 Endpoints da API

### Eventos
- `GET /eventos` - Listar todos os eventos
- `GET /eventos/aprovados` - Eventos aprovados
- `GET /eventos/reprovados` - Eventos reprovados

### Equipamentos
- `GET /equipamentos` - Listar equipamentos

### Recomendações
- `GET /recommendations/:equipmentId` - Recomendações por equipamento
- `POST /recommendations/generate/:equipmentId` - Gerar nova recomendação
- `PUT /recommendations/:id/status` - Atualizar status da recomendação

### Configuração
- `GET /config` - Obter configurações
- `POST /config` - Salvar configurações

## 🧪 Cenários de Teste

### 1. Teste de Funcionalidade
- Carregar dashboard com dados simulados
- Gerar recomendações automáticas
- Filtrar dados por equipamento
- Alterar datas de visualização

### 2. Teste de Integração
- Comunicação frontend-backend
- Integração com MongoDB
- Execução de scripts Python
- Chamadas para API OpenAI

### 3. Teste de Performance
- Carregamento de grandes volumes de dados
- Responsividade da interface
- Tempo de geração de recomendações

## 📖 Material de Apoio

### Conceitos Importantes
1. **OEE (Overall Equipment Effectiveness)**: Métrica industrial padrão
2. **Real-time Dashboard**: Interfaces de tempo real
3. **Pattern Recognition**: Reconhecimento de padrões em dados
4. **AI Recommendations**: Recomendações baseadas em IA
5. **Data Pipeline**: Pipeline de processamento de dados

### Exercícios Sugeridos
1. Implementar novo tipo de gráfico
2. Adicionar filtros de data mais avançados
3. Criar novo algoritmo de detecção de padrões
4. Implementar sistema de notificações
5. Adicionar testes automatizados

## 🤝 Contribuindo

Este projeto é para fins educacionais. Sugestões de melhorias:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Suporte

Para dúvidas sobre o projeto:
- Abra uma issue no GitHub
- Consulte a documentação na pasta `docs/`
- Verifique os comentários no código

## 🎓 Objetivos de Aprendizagem

Ao final do estudo deste projeto, os alunos devem ser capazes de:

1. **Arquitetura**: Compreender arquiteturas full-stack modernas
2. **APIs**: Desenvolver e consumir APIs RESTful
3. **Banco de Dados**: Integrar aplicações com bancos NoSQL
4. **Frontend**: Criar interfaces responsivas e interativas
5. **Análise de Dados**: Implementar pipelines de análise
6. **IA**: Integrar serviços de inteligência artificial
7. **DevOps**: Configurar ambientes de desenvolvimento

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Curso**: Engenharia de Software - Mestrado