# 📡 Documentação da API - Sistema de Monitoramento Industrial

## 📋 Visão Geral

Esta documentação descreve todos os endpoints da API REST do sistema de monitoramento industrial. A API segue os padrões REST e retorna dados em formato JSON.

### Base URL
```
Local: http://localhost:5000
Produção: https://seu-dominio.com/api
```

### Autenticação
Atualmente, a API não implementa autenticação. Para produção, recomenda-se implementar JWT ou OAuth2.

### Headers Padrão
```http
Content-Type: application/json
Accept: application/json
```

### Códigos de Status HTTP
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🔍 Endpoints de Eventos

### GET /eventos
Retorna todos os eventos do sistema com opções de filtro e paginação.

#### Parâmetros de Query
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `equipment_id` | string | Não | Filtrar por ID do equipamento |
| `start_date` | string | Não | Data inicial (ISO 8601) |
| `end_date` | string | Não | Data final (ISO 8601) |
| `classe` | string | Não | Filtrar por classe: "Aprovado" ou "Reprovado" |
| `limit` | integer | Não | Limite de registros (padrão: 100, máx: 1000) |
| `offset` | integer | Não | Offset para paginação (padrão: 0) |
| `sort` | string | Não | Campo para ordenação (padrão: "data_hora") |
| `order` | string | Não | Direção da ordenação: "asc" ou "desc" (padrão: "desc") |

#### Exemplo de Requisição
```http
GET /eventos?equipment_id=EQ001&start_date=2024-01-01&limit=50
```

#### Exemplo de Resposta
```json
{
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "equipment_id": "EQ001",
      "data_hora": "2024-01-15T14:30:00.000Z",
      "classe": "Aprovado",
      "total": 150,
      "temperatura": 75.5,
      "pressao": 2.3,
      "velocidade": 1200,
      "created_at": "2024-01-15T14:30:00.000Z",
      "updated_at": "2024-01-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1250,
    "count": 50,
    "offset": 0,
    "limit": 50,
    "has_more": true
  }
}
```

### GET /eventos/aprovados
Retorna apenas eventos com classe "Aprovado".

#### Parâmetros
Aceita os mesmos parâmetros de query do endpoint `/eventos`.

#### Exemplo de Resposta
```json
{
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "equipment_id": "EQ001",
      "data_hora": "2024-01-15T14:30:00.000Z",
      "classe": "Aprovado",
      "total": 150,
      "temperatura": 75.5,
      "pressao": 2.3,
      "velocidade": 1200
    }
  ],
  "meta": {
    "total": 1100,
    "rejection_rate": 0.12
  }
}
```

### GET /eventos/reprovados
Retorna apenas eventos com classe "Reprovado".

#### Parâmetros
Aceita os mesmos parâmetros de query do endpoint `/eventos`.

### POST /eventos
Cria um novo evento no sistema.

#### Corpo da Requisição
```json
{
  "equipment_id": "EQ001",
  "classe": "Aprovado",
  "total": 150,
  "temperatura": 75.5,
  "pressao": 2.3,
  "velocidade": 1200,
  "data_hora": "2024-01-15T14:30:00.000Z"
}
```

#### Validações
- `equipment_id`: obrigatório, string não vazia
- `classe`: obrigatório, deve ser "Aprovado" ou "Reprovado"
- `total`: obrigatório, número positivo
- `data_hora`: opcional, padrão é a data/hora atual

#### Exemplo de Resposta
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "equipment_id": "EQ001",
    "classe": "Aprovado",
    "total": 150,
    "temperatura": 75.5,
    "pressao": 2.3,
    "velocidade": 1200,
    "data_hora": "2024-01-15T14:30:00.000Z",
    "created_at": "2024-01-15T14:30:00.000Z"
  }
}
```

## 🏭 Endpoints de Equipamentos

### GET /equipamentos
Lista todos os equipamentos disponíveis no sistema.

#### Exemplo de Resposta
```json
{
  "data": [
    "EQ001",
    "EQ002", 
    "EQ003",
    "LINE_A",
    "LINE_B",
    "PRESS_001",
    "ROBOT_01"
  ],
  "meta": {
    "total": 7,
    "active": 6,
    "inactive": 1
  }
}
```

### GET /equipamentos/:equipmentId/status
Retorna o status atual de um equipamento específico.

#### Parâmetros de URL
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `equipmentId` | string | ID do equipamento |

#### Exemplo de Resposta
```json
{
  "equipment_id": "EQ001",
  "status": "online",
  "last_event": "2024-01-15T14:30:00.000Z",
  "metrics": {
    "events_today": 245,
    "approval_rate": 0.88,
    "current_temperature": 75.5,
    "current_pressure": 2.3,
    "current_speed": 1200
  },
  "alerts": [
    {
      "type": "warning",
      "message": "Temperatura acima do normal",
      "timestamp": "2024-01-15T14:25:00.000Z"
    }
  ]
}
```

### GET /equipamentos/:equipmentId/metrics
Retorna métricas detalhadas de um equipamento.

#### Parâmetros de Query
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `period` | string | Período: "1h", "24h", "7d", "30d" (padrão: "24h") |
| `metrics` | string | Métricas específicas separadas por vírgula |

#### Exemplo de Resposta
```json
{
  "equipment_id": "EQ001",
  "period": "24h",
  "metrics": {
    "oee": {
      "overall": 0.72,
      "quality": 0.88,
      "performance": 0.85,
      "availability": 0.96
    },
    "production": {
      "total_items": 1250,
      "approved_items": 1100,
      "rejected_items": 150,
      "rejection_rate": 0.12
    },
    "performance": {
      "avg_temperature": 75.2,
      "avg_pressure": 2.31,
      "avg_speed": 1185,
      "uptime_percentage": 96.5
    },
    "trends": {
      "quality_trend": "stable",
      "performance_trend": "improving",
      "availability_trend": "declining"
    }
  },
  "generated_at": "2024-01-15T14:30:00.000Z"
}
```

## 🤖 Endpoints de Recomendações

### GET /recommendations/:equipmentId
Obtém recomendações para um equipamento específico.

#### Parâmetros de URL
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `equipmentId` | string | ID do equipamento |

#### Parâmetros de Query
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | string | Filtrar por status: "active", "implemented", "dismissed" |
| `priority` | integer | Filtrar por prioridade (1-5) |
| `limit` | integer | Limite de registros (padrão: 20) |

#### Exemplo de Resposta
```json
{
  "data": [
    {
      "id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "equipment_id": "EQ001",
      "timestamp": "2024-01-15T14:30:00.000Z",
      "recommendation_text": "Ajustar temperatura de operação para 72-78°C para reduzir taxa de rejeição",
      "priority": 4,
      "confidence": 0.87,
      "status": "active",
      "patterns": [
        {
          "pattern_type": "alta_taxa_rejeicao",
          "description": "Taxa de rejeição elevada de 23.5%",
          "confidence": 0.87,
          "supporting_data": {
            "rejection_rate": 0.235,
            "total_items": 1000,
            "rejected_items": 235,
            "threshold": 0.15
          }
        }
      ],
      "estimated_impact": {
        "quality_improvement": 0.18,
        "cost_savings": 15000,
        "implementation_effort": "medium"
      },
      "created_by": "system"
    }
  ],
  "meta": {
    "total": 5,
    "active": 3,
    "implemented": 1,
    "dismissed": 1
  }
}
```

### POST /recommendations/generate/:equipmentId
Gera uma nova recomendação para um equipamento.

#### Parâmetros de URL
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `equipmentId` | string | ID do equipamento |

#### Parâmetros de Query
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `time_window` | integer | Janela de tempo em horas (padrão: 24) |
| `force_analysis` | boolean | Forçar nova análise mesmo se recente existir |

#### Exemplo de Resposta
```json
{
  "success": true,
  "message": "Geração de recomendações iniciada para equipamento EQ001",
  "job_id": "analysis_64f5a1b2c3d4e5f6a7b8c9d1",
  "estimated_completion": "2024-01-15T14:35:00.000Z"
}
```

### GET /recommendations/job/:jobId
Verifica o status de um job de geração de recomendação.

#### Exemplo de Resposta
```json
{
  "job_id": "analysis_64f5a1b2c3d4e5f6a7b8c9d1",
  "status": "completed",
  "progress": 100,
  "started_at": "2024-01-15T14:30:00.000Z",
  "completed_at": "2024-01-15T14:34:30.000Z",
  "result": {
    "recommendations_generated": 2,
    "patterns_detected": 3,
    "confidence_avg": 0.82
  }
}
```

### PUT /recommendations/:recommendationId/status
Atualiza o status de uma recomendação.

#### Parâmetros de URL
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `recommendationId` | string | ID da recomendação |

#### Parâmetros de Query
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | Sim | Novo status: "active", "implemented", "dismissed" |

#### Corpo da Requisição (Opcional)
```json
{
  "notes": "Implementação concluída com sucesso",
  "implementation_date": "2024-01-15T16:00:00.000Z",
  "actual_impact": {
    "quality_improvement": 0.20,
    "cost_savings": 18000
  }
}
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "message": "Status atualizado para implemented",
  "recommendation": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "status": "implemented",
    "updated_at": "2024-01-15T16:00:00.000Z"
  }
}
```

### POST /analyze/all
Inicia análise para todos os equipamentos.

#### Corpo da Requisição (Opcional)
```json
{
  "time_window": 24,
  "priority_threshold": 3,
  "exclude_equipments": ["EQ999"]
}
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "message": "Análise iniciada para 6 equipamentos",
  "jobs": [
    {
      "equipment_id": "EQ001",
      "job_id": "analysis_64f5a1b2c3d4e5f6a7b8c9d1"
    },
    {
      "equipment_id": "EQ002", 
      "job_id": "analysis_64f5a1b2c3d4e5f6a7b8c9d2"
    }
  ],
  "estimated_completion": "2024-01-15T14:40:00.000Z"
}
```

## ⚙️ Endpoints de Configuração

### GET /config
Obtém as configurações atuais do sistema.

#### Exemplo de Resposta
```json
{
  "api": {
    "version": "1.0.0",
    "timeout": 5000,
    "rate_limit": {
      "window": 900000,
      "max_requests": 100
    }
  },
  "monitoring": {
    "refresh_interval": 30000,
    "max_events_display": 100,
    "auto_refresh_enabled": true
  },
  "analysis": {
    "default_time_window": 24,
    "pattern_confidence_threshold": 0.7,
    "ai_model": "gpt-4-turbo",
    "max_patterns_per_analysis": 10
  },
  "notifications": {
    "email_enabled": false,
    "webhook_url": null,
    "alert_thresholds": {
      "rejection_rate": 0.20,
      "temperature": 85.0,
      "pressure": 3.0
    }
  }
}
```

### POST /config
Atualiza as configurações do sistema.

#### Corpo da Requisição
```json
{
  "monitoring": {
    "refresh_interval": 60000,
    "max_events_display": 200
  },
  "analysis": {
    "default_time_window": 48,
    "pattern_confidence_threshold": 0.8
  }
}
```

#### Exemplo de Resposta
```json
{
  "success": true,
  "message": "Configuração atualizada com sucesso",
  "updated_fields": [
    "monitoring.refresh_interval",
    "monitoring.max_events_display",
    "analysis.default_time_window",
    "analysis.pattern_confidence_threshold"
  ]
}
```

### GET /config/validate
Valida as configurações atuais do sistema.

#### Exemplo de Resposta
```json
{
  "valid": true,
  "issues": [],
  "warnings": [
    {
      "field": "notifications.email_enabled",
      "message": "Notificações por email estão desabilitadas"
    }
  ],
  "recommendations": [
    {
      "field": "analysis.pattern_confidence_threshold",
      "current": 0.7,
      "recommended": 0.8,
      "reason": "Threshold mais alto reduz falsos positivos"
    }
  ]
}
```

## 📊 Endpoints de Métricas e Relatórios

### GET /metrics/dashboard
Retorna métricas consolidadas para o dashboard.

#### Parâmetros de Query
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `equipment_id` | string | Filtrar por equipamento específico |
| `period` | string | Período: "1h", "24h", "7d", "30d" |

#### Exemplo de Resposta
```json
{
  "summary": {
    "total_events": 1250,
    "approved_events": 1100,
    "rejected_events": 150,
    "rejection_rate": 0.12,
    "active_equipments": 6,
    "avg_oee": 0.74
  },
  "trends": {
    "events_per_hour": [
      {"hour": "00:00", "approved": 45, "rejected": 5},
      {"hour": "01:00", "approved": 42, "rejected": 8}
    ],
    "daily_summary": [
      {"date": "2024-01-14", "oee": 0.72, "events": 1180},
      {"date": "2024-01-15", "oee": 0.76, "events": 1250}
    ]
  },
  "equipment_status": [
    {
      "equipment_id": "EQ001",
      "status": "online",
      "oee": 0.72,
      "last_event": "2024-01-15T14:30:00.000Z"
    }
  ],
  "alerts": [
    {
      "type": "warning",
      "equipment_id": "EQ001",
      "message": "Taxa de rejeição acima do normal",
      "timestamp": "2024-01-15T14:25:00.000Z"
    }
  ]
}
```

### GET /reports/oee
Gera relatório detalhado de OEE.

#### Parâmetros de Query
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `equipment_ids` | string | IDs dos equipamentos (separados por vírgula) |
| `start_date` | string | Data inicial (ISO 8601) |
| `end_date` | string | Data final (ISO 8601) |
| `format` | string | Formato: "json", "csv", "pdf" |

#### Exemplo de Resposta (JSON)
```json
{
  "report": {
    "title": "Relatório OEE - Janeiro 2024",
    "generated_at": "2024-01-15T14:30:00.000Z",
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-15T23:59:59.000Z"
    },
    "equipment_data": [
      {
        "equipment_id": "EQ001",
        "oee": {
          "overall": 0.72,
          "quality": 0.88,
          "performance": 0.85,
          "availability": 0.96
        },
        "production": {
          "total_items": 18750,
          "approved_items": 16500,
          "rejected_items": 2250
        },
        "downtime": {
          "planned": 48,
          "unplanned": 12,
          "total": 60
        }
      }
    ],
    "summary": {
      "avg_oee": 0.74,
      "best_equipment": "EQ003",
      "worst_equipment": "EQ001",
      "improvement_opportunities": [
        {
          "equipment_id": "EQ001",
          "area": "quality",
          "potential_gain": 0.12
        }
      ]
    }
  }
}
```

### POST /reports/generate
Gera relatório customizado.

#### Corpo da Requisição
```json
{
  "type": "custom",
  "title": "Relatório Personalizado",
  "equipment_ids": ["EQ001", "EQ002"],
  "metrics": ["oee", "quality", "production"],
  "period": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-15T23:59:59.000Z"
  },
  "format": "pdf",
  "email_to": "usuario@empresa.com"
}
```

## 🔍 Endpoints de Análise

### GET /analysis/patterns/:equipmentId
Lista padrões detectados para um equipamento.

#### Exemplo de Resposta
```json
{
  "equipment_id": "EQ001",
  "analysis_period": "24h",
  "patterns": [
    {
      "pattern_type": "alta_taxa_rejeicao",
      "description": "Taxa de rejeição elevada de 23.5%",
      "confidence": 0.87,
      "severity": "high",
      "first_detected": "2024-01-15T10:00:00.000Z",
      "last_occurrence": "2024-01-15T14:00:00.000Z",
      "supporting_data": {
        "rejection_rate": 0.235,
        "total_items": 1000,
        "rejected_items": 235,
        "threshold": 0.15,
        "historical_avg": 0.12
      },
      "related_factors": [
        "temperatura_alta",
        "horario_pico"
      ]
    }
  ],
  "correlations": [
    {
      "factor1": "temperatura",
      "factor2": "taxa_rejeicao", 
      "correlation": 0.73,
      "significance": "high"
    }
  ]
}
```

### POST /analysis/correlations
Executa análise de correlações entre variáveis.

#### Corpo da Requisição
```json
{
  "equipment_ids": ["EQ001", "EQ002"],
  "variables": ["temperatura", "pressao", "velocidade", "taxa_rejeicao"],
  "time_window": 168,
  "correlation_threshold": 0.5
}
```

## 🔧 Endpoints de Sistema

### GET /health
Verifica a saúde do sistema.

#### Exemplo de Resposta
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": {
      "status": "connected",
      "response_time": 15,
      "last_check": "2024-01-15T14:30:00.000Z"
    },
    "openai": {
      "status": "available",
      "response_time": 250,
      "last_check": "2024-01-15T14:29:00.000Z"
    },
    "python": {
      "status": "available",
      "version": "3.9.0",
      "last_check": "2024-01-15T14:30:00.000Z"
    }
  },
  "resources": {
    "memory_usage": 0.45,
    "cpu_usage": 0.23,
    "disk_usage": 0.67
  }
}
```

### GET /version
Retorna informações de versão.

#### Exemplo de Resposta
```json
{
  "api_version": "1.0.0",
  "build": "2024.01.15.001",
  "node_version": "16.20.0",
  "dependencies": {
    "express": "4.21.2",
    "mongodb": "5.9.2",
    "axios": "1.9.0"
  },
  "build_date": "2024-01-15T10:00:00.000Z",
  "git_commit": "a1b2c3d4e5f6"
}
```

## 🚨 Códigos de Erro

### Estrutura de Erro Padrão
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "field": "equipment_id",
        "message": "Campo obrigatório"
      }
    ],
    "timestamp": "2024-01-15T14:30:00.000Z",
    "request_id": "req_64f5a1b2c3d4e5f6"
  }
}
```

### Códigos de Erro Comuns

| Código | Status HTTP | Descrição |
|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Dados de entrada inválidos |
| `EQUIPMENT_NOT_FOUND` | 404 | Equipamento não encontrado |
| `RECOMMENDATION_NOT_FOUND` | 404 | Recomendação não encontrada |
| `DATABASE_ERROR` | 500 | Erro na base de dados |
| `AI_SERVICE_ERROR` | 500 | Erro no serviço de IA |
| `ANALYSIS_ERROR` | 500 | Erro na análise de dados |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requisições excedido |

## 📚 Exemplos de Uso

### Buscar Dados do Dashboard
```javascript
// Fetch dashboard data
const response = await fetch('/metrics/dashboard?period=24h');
const dashboardData = await response.json();

console.log(`Total de eventos: ${dashboardData.summary.total_events}`);
console.log(`Taxa de rejeição: ${(dashboardData.summary.rejection_rate * 100).toFixed(1)}%`);
```

### Gerar Recomendação
```javascript
// Generate recommendation
const response = await fetch('/recommendations/generate/EQ001', {
  method: 'POST'
});
const result = await response.json();

// Check job status
const statusResponse = await fetch(`/recommendations/job/${result.job_id}`);
const status = await statusResponse.json();

if (status.status === 'completed') {
  // Get recommendations
  const recsResponse = await fetch('/recommendations/EQ001');
  const recommendations = await recsResponse.json();
}
```

### Implementar Recomendação
```javascript
// Update recommendation status
const response = await fetch('/recommendations/64f5a1b2c3d4e5f6a7b8c9d1/status?status=implemented', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: 'Temperatura ajustada conforme recomendado',
    implementation_date: new Date().toISOString()
  })
});
```

## 🔐 Segurança e Rate Limiting

### Rate Limits
- **Endpoints gerais**: 100 requisições por 15 minutos
- **Geração de recomendações**: 10 requisições por hora
- **Relatórios**: 5 requisições por hora

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642251600
```

---

**Última Atualização**: Dezembro 2024  
**Versão da API**: 1.0.0