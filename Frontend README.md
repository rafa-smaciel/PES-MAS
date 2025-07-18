# Frontend - Sistema de Monitoramento Industrial

## 📋 Visão Geral

O frontend é uma aplicação React.js moderna que oferece uma interface interativa para monitoramento industrial em tempo real. Desenvolvido com foco em usabilidade, responsividade e visualização eficiente de dados complexos.

## 🎯 Características Principais

- **Dashboard Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Tempo Real**: Atualizações automáticas dos dados
- **Visualizações Interativas**: Gráficos dinâmicos com Chart.js
- **Sistema de Recomendações**: Interface para gerenciar sugestões de IA
- **Design Moderno**: Interface dark-theme com elementos visuais atraentes

## 🏗️ Arquitetura do Frontend

```
Frontend Architecture
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Componente principal
│   │   ├── Recommendations.jsx     # Sistema de recomendações
│   │   ├── Charts/
│   │   │   ├── PieChart.jsx       # Gráfico de pizza
│   │   │   ├── LineChart.jsx      # Gráfico de linha
│   │   │   └── BarChart.jsx       # Gráfico de barras
│   │   ├── Metrics/
│   │   │   ├── OEEGauge.jsx       # Medidor OEE
│   │   │   ├── KPICard.jsx        # Cards de métricas
│   │   │   └── MetricItem.jsx     # Item de métrica
│   │   └── Common/
│   │       ├── Header.jsx         # Cabeçalho
│   │       ├── Footer.jsx         # Rodapé
│   │       └── LoadingSpinner.jsx # Indicador de carregamento
│   ├── services/
│   │   ├── ApiService.js          # Comunicação com API
│   │   ├── ConfigService.js       # Gerenciamento de configurações
│   │   └── ChartService.js        # Utilitários para gráficos
│   ├── styles/
│   │   ├── Dashboard.css          # Estilos principais
│   │   ├── Recommendations.css    # Estilos das recomendações
│   │   └── globals.css            # Estilos globais
│   ├── hooks/
│   │   ├── useApi.js              # Hook para API
│   │   ├── useRealTime.js         # Hook para atualizações
│   │   └── useCharts.js           # Hook para gráficos
│   └── utils/
│       ├── formatters.js          # Formatadores de dados
│       ├── validators.js          # Validadores
│       └── constants.js           # Constantes
```

## 🛠️ Tecnologias e Dependências

### Principais
```json
{
  "react": "^18.2.0",           // Framework principal
  "react-dom": "^18.2.0",      // DOM renderer
  "chart.js": "^4.4.0",        // Biblioteca de gráficos
  "axios": "^1.6.0",           // Cliente HTTP
  "date-fns": "^2.30.0",       // Manipulação de datas
  "classnames": "^2.3.2"       // Utilitário para classes CSS
}
```

### Desenvolvimento
```json
{
  "vite": "^5.0.0",            // Build tool moderna
  "eslint": "^8.55.0",         // Linter de código
  "prettier": "^3.1.0",        // Formatador de código
  "@testing-library/react": "^13.4.0"  // Testes
}
```

## 🚀 Instalação e Configuração

### 1. Instalação
```bash
cd frontend
npm install
```

### 2. Configuração do Ambiente
```bash
# Criar arquivo de configuração
cp .env.example .env.local

# Editar configurações
nano .env.local
```

### 3. Variáveis de Ambiente
```env
# API Backend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000

# Configurações da aplicação
REACT_APP_REFRESH_INTERVAL=30000
REACT_APP_CHART_ANIMATION=true
REACT_APP_DEBUG_MODE=false

# Análise e métricas
REACT_APP_GOOGLE_ANALYTICS=
REACT_APP_SENTRY_DSN=
```

## 🎨 Componentes Principais

### Dashboard.jsx
Componente principal que orquestra toda a interface do dashboard.

**Funcionalidades:**
- Exibição de métricas OEE em tempo real
- Integração com múltiplos gráficos
- Sistema de auto-refresh configurável
- Seleção de equipamentos e datas

**Props e Estado:**
```javascript
const Dashboard = () => {
  // Estados principais
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [processMetrics, setProcessMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Configurações
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [apiStatus, setApiStatus] = useState({ connected: false });
  
  // ... implementação
};
```

### Recommendations.jsx
Interface para o sistema de recomendações inteligentes.

**Características:**
- Listagem de recomendações por equipamento
- Gestão de status (ativo, implementado, descartado)
- Visualização de padrões detectados
- Geração de novas análises

**Estrutura da Recomendação:**
```javascript
const RecommendationCard = ({ recommendation }) => {
  const {
    id,
    equipment_id,
    timestamp,
    recommendation_text,
    priority,
    patterns,
    status
  } = recommendation;
  
  return (
    <div className={`recommendation-card ${status}`}>
      <RecommendationHeader {...headerProps} />
      <RecommendationContent text={recommendation_text} patterns={patterns} />
      <RecommendationActions onStatusChange={handleStatusChange} />
    </div>
  );
};
```

## 📊 Sistema de Gráficos

### Chart.js Integration
Integração robusta com Chart.js para visualizações dinâmicas.

#### Gráfico de Pizza (Distribuição)
```javascript
const initializePieChart = (approvedData, rejectedData) => {
  const chartConfig = {
    type: 'pie',
    data: {
      labels: ['Aprovados', 'Reprovados'],
      datasets: [{
        data: [approvedData.length, rejectedData.length],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { 
            color: '#eee',
            font: { size: 14 },
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#555',
          borderWidth: 1
        }
      }
    }
  };
  
  return new Chart(canvas, chartConfig);
};
```

#### Gráfico de Linha (Tendência)
```javascript
const initializeLineChart = (timeSeriesData) => {
  const chartConfig = {
    type: 'line',
    data: {
      labels: timeSeriesData.labels,
      datasets: [
        {
          label: 'Aprovados',
          data: timeSeriesData.approved,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Reprovados',
          data: timeSeriesData.rejected,
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#aaa' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#aaa' },
          beginAtZero: true
        }
      }
    }
  };
  
  return new Chart(canvas, chartConfig);
};
```

### Chart Management Hook
```javascript
const useCharts = () => {
  const chartInstancesRef = useRef({});
  
  const createChart = useCallback((ref, type, data, options) => {
    if (!ref.current) return null;
    
    // Destruir gráfico existente
    const chartId = ref.current.dataset.chartId;
    if (chartInstancesRef.current[chartId]) {
      chartInstancesRef.current[chartId].destroy();
    }
    
    // Criar novo gráfico
    const chart = new Chart(ref.current, { type, data, options });
    chartInstancesRef.current[chartId] = chart;
    
    return chart;
  }, []);
  
  const destroyAllCharts = useCallback(() => {
    Object.values(chartInstancesRef.current).forEach(chart => {
      chart?.destroy();
    });
    chartInstancesRef.current = {};
  }, []);
  
  return { createChart, destroyAllCharts };
};
```

## 🔄 Gerenciamento de Estado

### Custom Hooks

#### useApi Hook
```javascript
const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.get(endpoint, options);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};
```

#### useRealTime Hook
```javascript
const useRealTime = (interval = 30000, enabled = true) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef();
  
  const refresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);
  
  useEffect(() => {
    if (!enabled) return;
    
    intervalRef.current = setInterval(refresh, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, refresh]);
  
  return { lastUpdate, refresh };
};
```

## 📱 Responsividade e Design

### Sistema de Grid CSS
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

/* Tablet */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    min-height: 250px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    min-height: 200px;
  }
  
  .controls-container {
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

### Design System

#### Cores
```css
:root {
  /* Cores principais */
  --primary-color: #2196F3;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
  --info-color: #00BCD4;
  
  /* Tons de cinza */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #888888;
  
  /* Bordas e divisores */
  --border-color: #444444;
  --divider-color: #333333;
}
```

#### Typography
```css
.typography {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.title-large {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.title-medium {
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: 600;
  line-height: 1.3;
}

.body-text {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  line-height: 1.5;
}
```

## 🔄 Performance e Otimização

### Code Splitting
```javascript
// Lazy loading de componentes
const Dashboard = lazy(() => import('./components/Dashboard'));
const Recommendations = lazy(() => import('./components/Recommendations'));
const Reports = lazy(() => import('./components/Reports'));

// Router com suspense
<Router>
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/recommendations" element={<Recommendations />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  </Suspense>
</Router>
```

### Memoização
```javascript
// Memorização de cálculos pesados
const processedMetrics = useMemo(() => {
  return calculateOEEMetrics(approved, rejected, equipment);
}, [approved, rejected, equipment]);

// Memorização de componentes
const ChartComponent = memo(({ data, options }) => {
  return <Chart data={data} options={options} />;
});

// Callbacks otimizados
const handleEquipmentChange = useCallback((equipmentId) => {
  setSelectedEquipment(equipmentId);
  fetchEquipmentData(equipmentId);
}, [fetchEquipmentData]);
```

### Debouncing
```javascript
const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🧪 Testes

### Estrutura de Testes
```
src/
├── __tests__/
│   ├── components/
│   │   ├── Dashboard.test.jsx
│   │   ├── Recommendations.test.jsx
│   │   └── Charts/
│   │       └── PieChart.test.jsx
│   ├── hooks/
│   │   ├── useApi.test.js
│   │   └── useRealTime.test.js
│   ├── services/
│   │   └── ApiService.test.js
│   └── utils/
│       └── formatters.test.js
```

### Exemplos de Testes

#### Teste de Componente
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock API calls
    jest.spyOn(ApiService, 'get').mockResolvedValue({
      data: mockData
    });
  });
  
  test('renders dashboard with correct metrics', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total de Eventos')).toBeInTheDocument();
    });
    
    expect(screen.getByText('150')).toBeInTheDocument(); // Total events
    expect(screen.getByText('92.5%')).toBeInTheDocument(); // OEE value
  });
  
  test('updates data when equipment changes', async () => {
    render(<Dashboard />);
    
    const equipmentSelect = screen.getByRole('combobox');
    fireEvent.change(equipmentSelect, { target: { value: 'EQ002' } });
    
    await waitFor(() => {
      expect(ApiService.get).toHaveBeenCalledWith('/eventos/aprovados');
    });
  });
});
```

#### Teste de Hook
```javascript
import { renderHook, act } from '@testing-library/react';
import useApi from '../hooks/useApi';

describe('useApi Hook', () => {
  test('fetches data successfully', async () => {
    const mockData = { events: [] };
    jest.spyOn(ApiService, 'get').mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useApi('/eventos'));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });
});
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage

# Testes específicos
npm test Dashboard.test.jsx
```

## 🔧 Build e Deploy

### Scripts de Build
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext js,jsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,css,md}",
    "analyze": "vite-bundle-analyzer"
  }
}
```

### Otimizações de Produção
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
```

### Docker para Produção
```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Segurança

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' http://localhost:5000;
  font-src 'self' https://fonts.gstatic.com;
">
```

### Sanitização de Dados
```javascript
import DOMPurify from 'dompurify';

const SafeHtml = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

## 📈 Métricas e Analytics

### Performance Monitoring
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  console.log(metric);
  // Enviar para serviço de analytics
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Boundary
```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Enviar erro para serviço de monitoramento
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Ops! Algo deu errado.</h2>
          <button onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 📚 Recursos Educacionais

### Conceitos Demonstrados
1. **React Hooks**: useState, useEffect, useCallback, useMemo
2. **Component Lifecycle**: Montagem, atualização, desmontagem
3. **State Management**: Estado local e compartilhado
4. **API Integration**: Fetch, axios, error handling
5. **Performance**: Lazy loading, memoização, debouncing
6. **Testing**: Unit tests, integration tests
7. **Responsive Design**: CSS Grid, Flexbox, media queries

### Exercícios Propostos
1. Implementar tema claro/escuro
2. Adicionar notificações push
3. Criar sistema de filtros avançados
4. Implementar drag-and-drop para reorganizar widgets
5. Adicionar suporte a PWA (Progressive Web App)
6. Criar dashboard customizável pelo usuário
7. Implementar realtime com WebSockets

---

**Última Atualização**: Dezembro 2024  
**Versão**: 1.0.0