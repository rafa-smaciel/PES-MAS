// Recommendations.jsx - Sistema de Recomendações Inteligentes para fins educacionais
import React, { useState, useEffect } from "react";
import { loadConfig } from "./services/ConfigService";
import './Dashboard.css';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ connected: false, baseUrl: loadConfig().apiUrl });
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Carregar configuração da API
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

  // Carregar lista de equipamentos
  useEffect(() => {
    if (!apiStatus.connected) return;
    
    const fetchEquipments = async () => {
      try {
        const response = await fetch(`${apiStatus.baseUrl}/equipamentos`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setEquipments(data);
          if (!selectedEquipment) {
            setSelectedEquipment(data[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
      }
    };
    
    fetchEquipments();
  }, [apiStatus.connected, apiStatus.baseUrl]);

  // Carregar recomendações para o equipamento selecionado
  useEffect(() => {
    if (!apiStatus.connected || !selectedEquipment) return;
    
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiStatus.baseUrl}/recommendations/${selectedEquipment}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        } else {
          console.error("Erro ao buscar recomendações:", response.status);
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Erro ao buscar recomendações:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [selectedEquipment, apiStatus.connected, apiStatus.baseUrl]);

  // Gerar novas recomendações
  const generateRecommendations = async () => {
    if (!apiStatus.connected || !selectedEquipment || generatingRecommendation) return;
    
    setGeneratingRecommendation(true);
    setActionFeedback({
      type: 'info',
      message: 'Gerando recomendações através da análise de IA. Isso pode levar alguns instantes...'
    });
    
    try {
      const response = await fetch(`${apiStatus.baseUrl}/recommendations/generate/${selectedEquipment}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setActionFeedback({
          type: 'success',
          message: 'Análise iniciada com sucesso! As recomendações aparecerão em breve.'
        });
        
        // Aguardar processamento backend
        setTimeout(() => {
          fetchLatestRecommendations();
        }, 5000);
      } else {
        setActionFeedback({
          type: 'error',
          message: 'Erro ao solicitar análise. Tente novamente.'
        });
      }
    } catch (error) {
      console.error("Erro ao gerar recomendações:", error);
      setActionFeedback({
        type: 'error',
        message: 'Falha na comunicação com o servidor.'
      });
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  // Buscar recomendações mais recentes
  const fetchLatestRecommendations = async () => {
    if (!apiStatus.connected || !selectedEquipment) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiStatus.baseUrl}/recommendations/${selectedEquipment}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        
        if (data.length > 0) {
          setActionFeedback({
            type: 'success',
            message: 'Recomendações atualizadas!'
          });
        } else {
          setActionFeedback({
            type: 'info',
            message: 'Não foram encontrados padrões significativos para gerar recomendações.'
          });
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar recomendações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status de uma recomendação
  const updateRecommendationStatus = async (recommendationId, newStatus) => {
    if (!apiStatus.connected) return;
    
    try {
      const response = await fetch(
        `${apiStatus.baseUrl}/recommendations/${recommendationId}/status?status=${newStatus}`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        setRecommendations(prevRecs => prevRecs.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: newStatus } 
            : rec
        ));
        
        setActionFeedback({
          type: 'success',
          message: `Status atualizado para "${newStatus}"`
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: 'Erro ao atualizar status'
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setActionFeedback({
        type: 'error',
        message: 'Falha na comunicação com o servidor'
      });
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  // Cor baseada na prioridade
  const getPriorityColor = (priority) => {
    if (priority === 5) return "#F44336"; // Crítica
    if (priority === 4) return "#FF5722"; // Alta
    if (priority === 3) return "#FF9800"; // Média
    if (priority === 2) return "#FFC107"; // Baixa
    return "#8BC34A"; // Muito baixa
  };

  // Texto da prioridade
  const getPriorityText = (priority) => {
    if (priority === 5) return "Crítica";
    if (priority === 4) return "Alta";
    if (priority === 3) return "Média";
    if (priority === 2) return "Baixa";
    return "Muito baixa";
  };

  // Renderizar padrão detectado
  const renderPattern = (pattern) => {
    let description = pattern.description || "Padrão detectado";
    let details = "";
    
    if (pattern.pattern_type === "alta_taxa_rejeicao" && pattern.supporting_data) {
      const { rejection_rate, total_items, rejected_items } = pattern.supporting_data;
      details = `Taxa: ${(rejection_rate * 100).toFixed(1)}% (${rejected_items} de ${total_items} itens)`;
    } else if (pattern.pattern_type === "sequencia_rejeicoes" && pattern.supporting_data) {
      details = `${pattern.supporting_data.consecutive_count} rejeições consecutivas`;
    } else if (pattern.pattern_type === "padrao_temporal" && pattern.supporting_data) {
      details = `Hora ${pattern.supporting_data.hour}h: ${(pattern.supporting_data.rejection_rate * 100).toFixed(1)}% (média: ${(pattern.supporting_data.avg_rejection_rate * 100).toFixed(1)}%)`;
    }
    
    return (
      <div className="pattern-item" key={pattern.description}>
        <div className="pattern-type">{pattern.pattern_type.replace(/_/g, " ")}</div>
        <div className="pattern-description">{description}</div>
        {details && <div className="pattern-details">{details}</div>}
        <div className="pattern-confidence">
          Confiança: {(pattern.confidence * 100).toFixed(0)}%
        </div>
      </div>
    );
  };

  return (
    <div className="recommendations-container">
      <h2 className="section-title">Sistema de Recomendações Inteligentes</h2>
      
      {!apiStatus.connected && (
        <div className="api-status-alert">
          <span className="error-icon">⚠️</span>
          <span>Sem conexão com o backend. Verifique se o serviço está em execução.</span>
        </div>
      )}
      
      <div className="recommendations-header">
        <div className="equipment-selector">
          <label>Equipamento:</label>
          <select 
            className="vega-select"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            disabled={isLoading || !apiStatus.connected || equipments.length === 0}
          >
            {equipments.map(equipment => (
              <option key={equipment} value={equipment}>{equipment}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="generate-button"
          onClick={generateRecommendations}
          disabled={!apiStatus.connected || !selectedEquipment || generatingRecommendation}
        >
          {generatingRecommendation ? "Processando..." : "Gerar Nova Análise"}
        </button>
      </div>
      
      {actionFeedback && (
        <div className={`action-feedback ${actionFeedback.type}`}>
          {actionFeedback.type === 'error' && <span className="feedback-icon">❌</span>}
          {actionFeedback.type === 'success' && <span className="feedback-icon">✅</span>}
          {actionFeedback.type === 'info' && <span className="feedback-icon">ℹ️</span>}
          <span>{actionFeedback.message}</span>
          <button 
            className="close-button"
            onClick={() => setActionFeedback(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-message">
          <div className="loading-spinner recommendation-spinner"></div>
          <p>Carregando recomendações...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-list ai-recommendations">
          {recommendations.map(rec => (
            <div 
              key={rec.id} 
              className={`recommendation-card ${rec.status}`}
              style={{ borderLeft: `4px solid ${getPriorityColor(rec.priority)}` }}
            >
              <div className="recommendation-header">
                <div className="recommendation-meta">
                  <span className="recommendation-date">{formatDate(rec.timestamp)}</span>
                  <span 
                    className="recommendation-priority"
                    style={{ color: getPriorityColor(rec.priority) }}
                  >
                    Prioridade: {getPriorityText(rec.priority)}
                  </span>
                </div>
                
                <div className="recommendation-status">
                  Status: {rec.status}
                </div>
              </div>
              
              <div className="recommendation-content">
                <h3 className="recommendation-title">Recomendação:</h3>
                <p className="recommendation-text">{rec.recommendation_text}</p>
                
                {rec.patterns && rec.patterns.length > 0 && (
                  <div className="detected-patterns">
                    <h4>Padrões Detectados:</h4>
                    <div className="patterns-list">
                      {rec.patterns.map(renderPattern)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="recommendation-actions">
                {rec.status === "active" && (
                  <>
                    <button 
                      className="action-button implemented"
                      onClick={() => updateRecommendationStatus(rec.id, "implemented")}
                    >
                      ✓ Marcar como Implementada
                    </button>
                    <button 
                      className="action-button dismissed"
                      onClick={() => updateRecommendationStatus(rec.id, "dismissed")}
                    >
                      ✗ Descartar
                    </button>
                  </>
                )}
                {rec.status === "implemented" && (
                  <button 
                    className="action-button revert"
                    onClick={() => updateRecommendationStatus(rec.id, "active")}
                  >
                    ↩ Voltar para Ativa
                  </button>
                )}
                {rec.status === "dismissed" && (
                  <button 
                    className="action-button revert"
                    onClick={() => updateRecommendationStatus(rec.id, "active")}
                  >
                    ↩ Voltar para Ativa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations">
          <p>Não há recomendações disponíveis para este equipamento.</p>
          <p>Clique em "Gerar Nova Análise" para criar recomendações baseadas nos padrões detectados.</p>
        </div>
      )}
      
      <div className="recommendations-help">
        <h3>Como funciona o sistema de recomendações</h3>
        <ol className="help-list">
          <li>O sistema analisa os dados históricos do equipamento selecionado.</li>
          <li>Algoritmos de análise de padrões identificam possíveis problemas ou anomalias.</li>
          <li>Uma IA avançada gera recomendações específicas com base nos padrões identificados.</li>
          <li>Você pode implementar ou descartar as recomendações conforme necessário.</li>
          <li>As recomendações implementadas podem ser monitoradas para verificar sua eficácia.</li>
        </ol>
      </div>
    </div>
  );
}