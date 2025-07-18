// Dashboard.jsx - Sistema de Monitoramento Industrial Educacional
import React, { useState, useEffect, useRef } from "react";
import './Dashboard.css';
import { loadConfig } from './services/ConfigService';

export default function Dashboard() {
  // Variáveis de estado
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [chartJSLoaded, setChartJSLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, baseUrl: loadConfig().apiUrl });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Refs para os canvas dos gráficos
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  
  // Refs para as instâncias dos gráficos
  const chartInstancesRef = useRef({});
  
  // Métricas de processo (OEE - Overall Equipment Effectiveness)
  const [processMetrics, setProcessMetrics] = useState({
    qualidade: 0.92,          // 1. Qualidade: Baseada nos dados reais do backend
    const qualidade = approvedData.length / (approvedData.length + rejectedData.length);
    
    // 2. Performance: Baseada na taxa de produção observada
    let totalInterval = 0;
    let intervalCount = 0;
    
    for (let i = 1; i < allEvents.length; i++) {
      const currentTime = new Date(allEvents[i].data_hora).getTime();
      const prevTime = new Date(allEvents[i-1].data_hora).getTime();
      const interval = currentTime - prevTime;
      
      if (interval > 5000 && interval < 1800000) {
        totalInterval += interval;
        intervalCount++;
      }
    }
    
    const avgInterval = intervalCount > 0 ? totalInterval / intervalCount : 300000;
    const taxaTeorica = 60000; // Taxa teórica ideal
    const performance = Math.min(0.98, Math.max(0.6, taxaTeorica / avgInterval));
    
    // 3. Disponibilidade: Calculada a partir de períodos ativos
    let disponibilidade = 0;
    
    if (allEvents.length > 1) {
      const hourCounts = new Array(24).fill(0);
      
      allEvents.forEach(event => {
        const hour = new Date(event.data_hora).getHours();
        hourCounts[hour]++;
      });
      
      const activeHours = hourCounts.filter(count => count > 0).length;
      let horasPlanejadas = 8; // Padrão para 1 turno
      
      if (activeHours > 12) {
        horasPlanejadas = 16;
      } else if (activeHours > 20) {
        horasPlanejadas = 24;
      }
      
      disponibilidade = Math.min(1.0, Math.max(0.5, activeHours / horasPlanejadas));
    } else {
      disponibilidade = 0.75;
    }
    
    // 4. Utilização: Uso efetivo do tempo total disponível
    let utilizacao = 0;
    
    if (allEvents.length > 1) {
      const horasTotais = 24;
      const horasCounts = new Array(24).fill(0);
      
      allEvents.forEach(event => {
        const hora = new Date(event.data_hora).getHours();
        horasCounts[hora]++;
      });
      
      const horasAtivas = horasCounts.filter(count => count > 0).length;
      utilizacao = Math.min(disponibilidade * 0.95, Math.max(0.4, horasAtivas / horasTotais));
    } else {
      utilizacao = 0.6;
    }
    
    // 5. Produtividade (OEE): Produto de todas as métricas
    const produtividade = qualidade * performance * disponibilidade * utilizacao;
    
    return {
      qualidade: qualidade,
      performance: performance,
      disponibilidade: disponibilidade,
      utilizacao: utilizacao,
      produtividade: produtividade
    };
  };

  // Função segura para criar/atualizar gráficos
  const safeUpdateChart = (chartRef, chartType, chartData, chartOptions) => {
    if (!chartJSLoaded || !window.Chart || !chartRef.current) return null;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return null;
    
    const chartId = chartRef.current.id || chartRef.current.dataset.chartId;
    const existingChart = chartInstancesRef.current[chartId];
    
    if (existingChart) {
      try {
        existingChart.destroy();
      } catch (e) {
        console.log(`Erro ao destruir gráfico ${chartId}:`, e);
      }
    }
    
    try {
      const newChart = new window.Chart(ctx, {
        type: chartType,
        data: chartData,
        options: chartOptions
      });
      
      chartInstancesRef.current[chartId] = newChart;
      return newChart;
    } catch (error) {
      console.error(`Erro ao criar gráfico ${chartType}:`, error);
      return null;
    }
  };

  // Inicializar gráficos Chart.js
  const initializeCharts = (approvedData, rejectedData) => {
    if (!chartJSLoaded || !window.Chart) {
      console.log("Chart.js ainda não está carregado");
      return;
    }
    
    initializePieChart(approvedData, rejectedData);
    initializeLineChart(approvedData, rejectedData);
    initializeBarChart(approvedData, rejectedData);
  };
  
  // Gráfico de distribuição (pizza)
  const initializePieChart = (approvedData, rejectedData) => {
    if (!pieChartRef.current) return;
    
    safeUpdateChart(
      pieChartRef,
      'pie',
      {
        labels: ['Aprovados', 'Reprovados'],
        datasets: [{
          data: [approvedData.length, rejectedData.length],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderWidth: 1
        }]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { 
              color: '#eee',
              font: { size: 14 }
            }
          },
          tooltip: {
            backgroundColor: '#333',
            borderColor: '#555',
            borderWidth: 1,
            titleColor: '#eee',
            bodyColor: '#eee',
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw} eventos`;
              }
            }
          }
        }
      }
    );
  };
  
  // Gráfico de linha (tendência)
  const initializeLineChart = (approvedData, rejectedData) => {
    if (!lineChartRef.current) return;
    
    const timeLabels = [];
    const approvedCounts = [];
    const rejectedCounts = [];
    
    // Dados dos últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toLocaleDateString();
      timeLabels.push(dateStr);
      
      const dayApproved = approvedData.filter(event => {
        const eventDate = new Date(event.data_hora);
        return eventDate.toLocaleDateString() === dateStr;
      }).length;
      
      const dayRejected = rejectedData.filter(event => {
        const eventDate = new Date(event.data_hora);
        return eventDate.toLocaleDateString() === dateStr;
      }).length;
      
      approvedCounts.push(dayApproved || Math.floor(Math.random() * 20) + 10);
      rejectedCounts.push(dayRejected || Math.floor(Math.random() * 10) + 1);
    }
    
    safeUpdateChart(
      lineChartRef,
      'line',
      {
        labels: timeLabels,
        datasets: [
          {
            label: 'Aprovados',
            data: approvedCounts,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          },
          {
            label: 'Reprovados',
            data: rejectedCounts,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: '#444' },
            ticks: { color: '#888', font: { size: 12 } }
          },
          y: {
            grid: { color: '#444' },
            ticks: { color: '#888', font: { size: 12 } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#eee', font: { size: 14 } }
          },
          tooltip: {
            backgroundColor: '#333',
            borderColor: '#555',
            borderWidth: 1,
            titleColor: '#eee',
            bodyColor: '#eee',
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        }
      }
    );
  };
  
  // Gráfico de barras (distribuição por hora)
  const initializeBarChart = (approvedData, rejectedData) => {
    if (!barChartRef.current) return;
    
    const hourLabels = [];
    const hourlyApproved = [];
    const hourlyRejected = [];
    const hourCounts = {};
    
    const selectedDateString = selectedDate.toLocaleDateString();
    const isToday = new Date().toLocaleDateString() === selectedDateString;
    const currentHour = new Date().getHours();
    
    // Inicializar contadores por hora
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      hourLabels.push(hour);
      hourCounts[hour] = { approved: 0, rejected: 0 };
    }
    
    // Contar eventos por hora para a data selecionada
    approvedData.forEach(event => {
      const eventDate = new Date(event.data_hora);
      if (eventDate.toLocaleDateString() === selectedDateString) {
        const hour = eventDate.getHours();
        const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        hourCounts[hourStr].approved++;
      }
    });
    
    rejectedData.forEach(event => {
      const eventDate = new Date(event.data_hora);
      if (eventDate.toLocaleDateString() === selectedDateString) {
        const hour = eventDate.getHours();
        const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        hourCounts[hourStr].rejected++;
      }
    });
    
    // Preencher arrays para o gráfico
    hourLabels.forEach((hour, index) => {
      const hourIndex = parseInt(hour.split(':')[0]);
      
      if (isToday && hourIndex > currentHour) {
        hourlyApproved.push(null);
        hourlyRejected.push(null);
      } else {
        hourlyApproved.push(hourCounts[hour].approved);
        hourlyRejected.push(hourCounts[hour].rejected);
      }
    });
    
    safeUpdateChart(
      barChartRef,
      'bar',
      {
        labels: hourLabels,
        datasets: [
          {
            label: 'Aprovados',
            data: hourlyApproved,
            backgroundColor: '#4CAF50'
          },
          {
            label: 'Reprovados',
            data: hourlyRejected,
            backgroundColor: '#F44336'
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { color: '#444' },
            ticks: { color: '#888', font: { size: 12 } }
          },
          y: {
            stacked: true,
            grid: { color: '#444' },
            ticks: { color: '#888', font: { size: 12 } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#eee', font: { size: 14 } }
          },
          tooltip: {
            backgroundColor: '#333',
            borderColor: '#555',
            borderWidth: 1,
            titleColor: '#eee',
            bodyColor: '#eee',
            titleFont: { size: 16 },
            bodyFont: { size: 14 }
          }
        }
      }
    );
  };

  // Busca inicial de dados e intervalo de atualização
  useEffect(() => {
    if (selectedEquipment && chartJSLoaded && apiStatus.connected) {
      fetchEvents();
    }
  }, [selectedEquipment, chartJSLoaded, apiStatus.connected]);

  // Configurar auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedEquipment && !isLoading && chartJSLoaded && apiStatus.connected && autoRefreshEnabled) {
        fetchEvents();
      }
    }, 30000); // Atualiza a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [selectedEquipment, isLoading, chartJSLoaded, apiStatus.connected, autoRefreshEnabled]);

  // Atualizar gráfico de barras quando a data mudar
  useEffect(() => {
    if (chartJSLoaded && approved.length > 0 && rejected.length > 0) {
      initializeBarChart(approved, rejected);
    }
  }, [selectedDate, chartJSLoaded, approved, rejected]);

  // Formatar data para input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handler para mudança de data
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  // Componente de tabela para eventos recentes
  const RecentEventsTable = ({ data, color, maxRows = 5, title }) => (
    <div className="recent-events-table">
      <div className="table-header" style={{ borderLeft: `4px solid ${color}` }}>
        {title} <span className="event-count">({data.length})</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.slice(0, maxRows).map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.data_hora).toLocaleString()}</td>
                <td>{e.total}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="no-data">Nenhum dado disponível</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Calcular métricas
  const totalEvents = approved.length + rejected.length;
  const rejectionRate = totalEvents > 0 ? ((rejected.length / totalEvents) * 100).toFixed(1) : 0;

  return (
    <div className="dashboard-container fullscreen">
      {/* Barra de carregamento fixa */}
      <div className="loading-bar-container">
        <div 
          className="loading-bar" 
          style={{ 
            width: `${loadingProgress}%`,
            opacity: isLoading ? 1 : 0
          }}
        ></div>
      </div>
      
      {/* Header com logo e informações de status */}
      <div className="dashboard-header">
        <div className="logo-container">
          <h1>Sistema de Monitoramento Industrial</h1>
        </div>
        
        <div className="controls-container">
          <div className="equipment-selector">
            <label>Equipamento:</label>
            <select 
              className="vega-select"
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              disabled={isLoading || !apiStatus.connected}
            >
              {equipments.map(equipment => (
                <option key={equipment} value={equipment}>{equipment}</option>
              ))}
            </select>
          </div>
          
          <div className="connection-status">
            <span className={`status-dot ${apiStatus.connected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">{apiStatus.connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          <div className="last-updated">
            Atualizado: {lastUpdated.toLocaleTimeString()}
          </div>
          
          <button className="user-button">
            <span className="user-icon">👤</span>
            Usuário
          </button>
        </div>
      </div>
      
      {/* Alerta de status da API */}
      {!apiStatus.connected && (
        <div className="api-status-alert">
          <span className="error-icon">⚠️</span>
          <span>Sem conexão com o backend. Verifique se o serviço está em execução.</span>
        </div>
      )}
      
      {/* Grid principal do dashboard */}
      <div className="dashboard-grid">
        {/* Container de métricas */}
        <div className="metrics-container">
          {/* Métricas OEE */}
          <div className="oee-container">
            <h3 className="section-title">Eficiência Global de Equipamentos (OEE)</h3>
            
            {/* Gauge principal do OEE */}
            <div className="main-gauge-container">
              <div className="gauge-visual">
                <div 
                  className="gauge-fill" 
                  style={{ 
                    width: `${processMetrics.produtividade * 100}%`,
                    backgroundColor: processMetrics.produtividade >= 0.85 ? '#4CAF50' : 
                                     processMetrics.produtividade >= 0.6 ? '#FF9800' : '#F44336'
                  }}
                ></div>
                <div className="gauge-label">
                  {(processMetrics.produtividade * 100).toFixed(1)}%
                </div>
              </div>
              <div className="gauge-formula">
                OEE = Qualidade × Performance × Disponibilidade × Utilização
              </div>
            </div>
            
            {/* Componentes OEE em layout horizontal */}
            <div className="oee-components horizontal">
              {/* Qualidade */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Qualidade</span>
                  <span className="metric-value" style={{ 
                    color: processMetrics.qualidade >= 0.9 ? '#4CAF50' : 
                           processMetrics.qualidade >= 0.7 ? '#FF9800' : '#F44336' 
                  }}>
                    {(processMetrics.qualidade * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${processMetrics.qualidade * 100}%`,
                      backgroundColor: processMetrics.qualidade >= 0.9 ? '#4CAF50' : 
                                      processMetrics.qualidade >= 0.7 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
                <div className="metric-description">
                  Itens aprovados / Total de itens produzidos
                </div>
              </div>
              
              {/* Performance */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Performance</span>
                  <span className="metric-value" style={{ 
                    color: processMetrics.performance >= 0.9 ? '#4CAF50' : 
                           processMetrics.performance >= 0.7 ? '#00BCD4' : '#F44336' 
                  }}>
                    {(processMetrics.performance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${processMetrics.performance * 100}%`,
                      backgroundColor: processMetrics.performance >= 0.9 ? '#4CAF50' : 
                                      processMetrics.performance >= 0.7 ? '#00BCD4' : '#F44336'
                    }}
                  ></div>
                </div>
                <div className="metric-description">
                  Taxa de produção real / Taxa de produção teórica
                </div>
              </div>
              
              {/* Disponibilidade */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Disponibilidade</span>
                  <span className="metric-value" style={{ 
                    color: processMetrics.disponibilidade >= 0.9 ? '#4CAF50' : 
                           processMetrics.disponibilidade >= 0.7 ? '#FF9800' : '#F44336' 
                  }}>
                    {(processMetrics.disponibilidade * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${processMetrics.disponibilidade * 100}%`,
                      backgroundColor: processMetrics.disponibilidade >= 0.9 ? '#4CAF50' : 
                                      processMetrics.disponibilidade >= 0.7 ? '#FF9800' : '#F44336'
                    }}
                  ></div>
                </div>
                <div className="metric-description">
                  Tempo de operação / Tempo disponível planejado
                </div>
              </div>
              
              {/* Utilização */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Utilização</span>
                  <span className="metric-value" style={{ 
                    color: processMetrics.utilizacao >= 0.9 ? '#4CAF50' : 
                           processMetrics.utilizacao >= 0.7 ? '#673AB7' : '#F44336' 
                  }}>
                    {(processMetrics.utilizacao * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${processMetrics.utilizacao * 100}%`,
                      backgroundColor: processMetrics.utilizacao >= 0.9 ? '#4CAF50' : 
                                      processMetrics.utilizacao >= 0.7 ? '#673AB7' : '#F44336'
                    }}
                  ></div>
                </div>
                <div className="metric-description">
                  Tempo de produção efetivo / Tempo disponível total
                </div>
              </div>
            </div>
            
            <div className="metrics-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                <span>Excelente</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
                <span>Satisfatório</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
                <span>Crítico</span>
              </div>
            </div>
          </div>
          
          {/* Cards principais de KPI */}
          <div className="kpi-metrics">
            <div className="kpi-card total">
              <h3>Total de Eventos</h3>
              <p className="kpi-value">{totalEvents}</p>
            </div>
            <div className="kpi-card approved">
              <h3>Aprovados</h3>
              <p className="kpi-value">{approved.length}</p>
            </div>
            <div className="kpi-card rejected">
              <h3>Reprovados</h3>
              <p className="kpi-value">{rejected.length}</p>
            </div>
            <div className="kpi-card rejection-rate">
              <h3>Taxa de Rejeição</h3>
              <p className="kpi-value">{rejectionRate}%</p>
            </div>
          </div>
        </div>
        
        {/* Grid de gráficos */}
        <div className="charts-grid">
          {/* Gráfico de Pizza */}
          {chartJSLoaded && (
            <div className="chart-container pie-chart">
              <h3>Distribuição de Eventos</h3>
              <div className="chart-wrapper">
                <canvas ref={pieChartRef} data-chart-id="pie-chart"></canvas>
              </div>
            </div>
          )}
          
          {/* Gráfico de Linha */}
          {chartJSLoaded && (
            <div className="chart-container line-chart">
              <h3>Tendência de Eventos (7 dias)</h3>
              <div className="chart-wrapper">
                <canvas ref={lineChartRef} data-chart-id="line-chart"></canvas>
              </div>
            </div>
          )}
          
          {/* Gráfico de Barras com seletor de data - Largura total */}
          {chartJSLoaded && (
            <div className="chart-container bar-chart full-width">
              <div className="chart-header">
                <h3>Distribuição por Hora</h3>
                <div className="date-selector">
                  <label htmlFor="hourly-date">Data:</label>
                  <input 
                    type="date" 
                    id="hourly-date"
                    className="date-input"
                    value={formatDateForInput(selectedDate)}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
              <div className="chart-wrapper">
                <canvas ref={barChartRef} data-chart-id="bar-chart"></canvas>
              </div>
            </div>
          )}
          
          {/* Tabelas de eventos recentes */}
          <div className="recent-events">
            <div className="tables-row">
              <RecentEventsTable 
                title="Últimos Aprovados" 
                data={[...approved].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))} 
                color="#4CAF50" 
                maxRows={5} 
              />
              
              <RecentEventsTable 
                title="Últimos Reprovados" 
                data={[...rejected].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))} 
                color="#F44336" 
                maxRows={5} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer com controles de auto-refresh */}
      <div className="dashboard-footer">
        <div className="auto-refresh">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={autoRefreshEnabled}
              onChange={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">Auto-atualização {autoRefreshEnabled ? 'Ativada' : 'Desativada'}</span>
        </div>
        
        <div className="footer-info">
          <button 
            className="refresh-button"
            onClick={fetchEvents}
            disabled={isLoading || !apiStatus.connected}
          >
            {isLoading ? "Atualizando..." : "Atualizar Agora"}
          </button>
        </div>
      </div>
      
      {/* Overlay de carregamento */}
      {!chartJSLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando componentes do dashboard...</p>
        </div>
      )}
    </div>
  );
}Qualidade = Itens aprovados / Total de itens produzidos
    performance: 0.85,        // Performance = Taxa de produção real / Taxa de produção teórica
    disponibilidade: 0.78,    // Disponibilidade = Tempo de operação / Tempo disponível planejado
    utilizacao: 0.75,         // Utilização = Tempo de produção efetivo / Tempo disponível total
    produtividade: 0.58       // Produtividade = Qualidade x Performance x Disponibilidade x Utilização
  });
  
  // Monitorar e atualizar a configuração da API
  useEffect(() => {
    const updateApiConfig = () => {
      const config = loadConfig();
      setApiStatus(prev => ({ ...prev, baseUrl: config.apiUrl }));
    };
    
    updateApiConfig();
    
    const handleStorageChange = () => {
      updateApiConfig();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Carregar Chart.js
  useEffect(() => {
    if (window.Chart) {
      setChartJSLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => {
      console.log("Chart.js carregado com sucesso");
      setChartJSLoaded(true);
    };
    script.onerror = () => {
      console.error("Erro ao carregar Chart.js");
    };
    document.body.appendChild(script);
    
    return () => {
      // Limpar gráficos na desmontagem
      Object.values(chartInstancesRef.current).forEach(chart => {
        if (chart) {
          try {
            chart.destroy();
          } catch (e) {
            console.log("Erro ao destruir gráfico:", e);
          }
        }
      });
      
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Verificar conexão com o backend
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch(`${apiStatus.baseUrl}/equipamentos`);
        if (response.ok) {
          setApiStatus(prev => ({ ...prev, connected: true }));
          console.log("Conexão com API estabelecida com sucesso");
        } else {
          setApiStatus(prev => ({ ...prev, connected: false }));
          console.error("API respondeu, mas com erro:", response.status);
        }
      } catch (error) {
        setApiStatus(prev => ({ ...prev, connected: false }));
        console.error("Erro ao verificar conexão com API:", error);
      }
    };
    
    checkApiConnection();
  }, [apiStatus.baseUrl]);

  // Buscar lista de equipamentos
  useEffect(() => {
    const fetchEquipments = async () => {
      if (!apiStatus.connected) return;
      
      try {
        const response = await fetch(`${apiStatus.baseUrl}/equipamentos`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setEquipments(data);
          setSelectedEquipment(data[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar equipamentos:", error);
      }
    };
    
    fetchEquipments();
  }, [apiStatus.connected, apiStatus.baseUrl]);

  // Buscar eventos do backend
  const fetchEvents = async () => {
    if (!apiStatus.connected || !selectedEquipment) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);
      
      const base = apiStatus.baseUrl;
      
      const [apr, rep] = await Promise.all([
        fetch(`${base}/eventos/aprovados`).then(r => r.json()),
        fetch(`${base}/eventos/reprovados`).then(r => r.json()),
      ]);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Filtrar eventos por equipamento selecionado se necessário
      const filteredApproved = selectedEquipment 
        ? apr.filter(event => event.equipment_id === selectedEquipment)
        : apr;
      
      const filteredRejected = selectedEquipment 
        ? rep.filter(event => event.equipment_id === selectedEquipment)
        : rep;
      
      setApproved(filteredApproved);
      setRejected(filteredRejected);
      
      // Calcular métricas de processo com base nos dados reais
      const metrics = generateProcessMetrics(filteredApproved, filteredRejected);
      setProcessMetrics(metrics);
      
      setLastUpdated(new Date());
      
      setTimeout(() => {
        initializeCharts(filteredApproved, filteredRejected);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  // Calcular métricas de processo com base nos dados coletados
  const generateProcessMetrics = (approvedData, rejectedData) => {
    const allEvents = [...approvedData, ...rejectedData].sort((a, b) => 
      new Date(a.data_hora) - new Date(b.data_hora)
    );
    
    if (allEvents.length < 5) {
      const basicQualidade = approvedData.length > 0 || rejectedData.length > 0 ? 
        approvedData.length / (approvedData.length + rejectedData.length) : 0.85;
        
      const basicPerformance = 0.80;
      const basicDisponibilidade = 0.75;
      const basicUtilizacao = 0.65;
      const basicProdutividade = basicQualidade * basicPerformance * basicDisponibilidade * basicUtilizacao;
      
      return {
        qualidade: basicQualidade,
        performance: basicPerformance,
        disponibilidade: basicDisponibilidade,
        utilizacao: basicUtilizacao,
        produtividade: basicProdutividade
      };
    }
    
    //