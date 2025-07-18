// server.js - Sistema de monitoramento industrial para fins educacionais
const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios");
const { spawn } = require("child_process");

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

// =========================
// Configurações gerais
// =========================
const app = express();
app.use(express.json());
app.use(cors());

// Carrega configurações de variáveis de ambiente
const CONFIG_PATH = process.env.CONFIG_PATH || './config.json';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'monitoramento_db';
const MONGO_COLLECTION = process.env.MONGO_COLLECTION || 'eventos';
const RECOMMENDATION_COLLECTION = process.env.RECOMMENDATION_COLLECTION || 'recomendacoes';
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Valida se a chave da API está definida
if (!OPENAI_API_KEY) {
  console.error("⚠️ Aviso: OPENAI_API_KEY não está definida no arquivo .env");
  console.error("Certifique-se de criar um arquivo .env com uma chave OpenAI válida");
}

// =========================
// Cliente MongoDB
// =========================
const mongoClient = new MongoClient(MONGO_URL);
// Funções utilitárias para pegar as coleções
const eventsCol = () =>
  mongoClient.db(MONGO_DB).collection(MONGO_COLLECTION);
const recommendationsCol = () =>
  mongoClient.db(MONGO_DB).collection(RECOMMENDATION_COLLECTION);

// =========================
// Rotas de Configuração
// =========================
app.get("/config", (req, res) => {
  fs.readFile(CONFIG_PATH, "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler config.json", err);
      return res.status(500).json({ error: "Erro ao ler o arquivo de configuração" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error("Erro ao parsear config.json", parseErr);
      res.status(500).json({ error: "Configuração inválida" });
    }
  });
});

app.post("/config", (req, res) => {
  fs.writeFile(CONFIG_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) {
      console.error("Erro ao salvar config.json", err);
      return res.status(500).json({ error: "Erro ao salvar a configuração" });
    }
    res.json({ message: "Configuração salva com sucesso!" });
  });
});

// =========================
// Rota para gerar relatório
// =========================
app.post("/gerar-relatorio", (req, res) => {
  console.log("Iniciando geração de relatório via Python...");
  // Substitua o caminho por um script genérico de análise
  exec("python ./scripts/analisar_dados.py", (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro no script Python: ${error.message}`);
      return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
    if (stderr) console.error(`STDERR Python: ${stderr}`);
    console.log(`STDOUT Python: ${stdout}`);
    res.json({ message: "Relatório gerado com sucesso!" });
  });
});

// =========================
// Rotas de Eventos (API Dashboard)
// =========================
app.get("/eventos", async (req, res) => {
  try {
    const docs = await eventsCol().find().toArray();
    res.json(docs);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Não foi possível obter eventos" });
  }
});

app.get("/eventos/aprovados", async (req, res) => {
  try {
    const docs = await eventsCol().find({ classe: "Aprovado" }).toArray();
    res.json(docs);
  } catch (err) {
    console.error("Erro ao buscar aprovados:", err);
    res.status(500).json({ error: "Não foi possível obter aprovados" });
  }
});

app.get("/eventos/reprovados", async (req, res) => {
  try {
    const docs = await eventsCol().find({ classe: "Reprovado" }).toArray();
    res.json(docs);
  } catch (err) {
    console.error("Erro ao buscar reprovados:", err);
    res.status(500).json({ error: "Não foi possível obter reprovados" });
  }
});

// =========================
// Rotas para o Sistema de Recomendação
// =========================
// Obter lista de equipamentos
app.get("/equipamentos", async (req, res) => {
  try {
    const equipmentIds = await eventsCol().distinct("equipment_id");
    res.json(equipmentIds);
  } catch (err) {
    console.error("Erro ao buscar equipamentos:", err);
    res.status(500).json({ error: "Não foi possível obter a lista de equipamentos" });
  }
});

// Obter recomendações por equipamento
app.get("/recommendations/:equipmentId", async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const recommendations = await recommendationsCol()
      .find({ equipment_id: equipmentId, status: "active" })
      .sort({ timestamp: -1 })
      .toArray();

    // Converte ObjectId para string
    recommendations.forEach(rec => {
      rec.id = rec._id.toString();
      delete rec._id;
    });

    res.json(recommendations);
  } catch (err) {
    console.error("Erro ao buscar recomendações:", err);
    res.status(500).json({ error: "Não foi possível obter recomendações" });
  }
});

// Atualizar status de uma recomendação
app.put("/recommendations/:recommendationId/status", async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { status } = req.query;

    if (!status || !["active", "implemented", "dismissed"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const result = await recommendationsCol().updateOne(
      { _id: new ObjectId(recommendationId) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Recomendação não encontrada" });
    }

    res.json({ message: `Status atualizado para ${status}` });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ error: "Não foi possível atualizar o status" });
  }
});

// Solicitar geração de recomendação
app.post("/recommendations/generate/:equipmentId", async (req, res) => {
  const { equipmentId } = req.params;
  
  // Inicia processo em background para não bloquear a resposta
  processEquipmentData(equipmentId)
    .then(() => console.log(`Processamento para equipamento ${equipmentId} concluído`))
    .catch(err => console.error(`Erro no processamento para equipamento ${equipmentId}:`, err));
  
  res.json({ message: `Geração de recomendações iniciada para equipamento ${equipmentId}` });
});

// Analisar todos os equipamentos
app.post("/analyze/all", async (req, res) => {
  try {
    const equipmentIds = await eventsCol().distinct("equipment_id");
    
    // Inicia processamento para cada equipamento em background
    equipmentIds.forEach(equipmentId => {
      processEquipmentData(equipmentId)
        .then(() => console.log(`Processamento para equipamento ${equipmentId} concluído`))
        .catch(err => console.error(`Erro no processamento para equipamento ${equipmentId}:`, err));
    });
    
    res.json({ message: `Análise iniciada para ${equipmentIds.length} equipamentos` });
  } catch (err) {
    console.error("Erro ao iniciar análise:", err);
    res.status(500).json({ error: "Não foi possível iniciar a análise" });
  }
});

// =========================
// Funções para análise e recomendação
// =========================
// Função para processar dados de um equipamento
async function processEquipmentData(equipmentId) {
  try {
    // Detecta padrões nos dados
    const patterns = await detectPatterns(equipmentId);
    
    if (patterns && patterns.length > 0) {
      // Gera recomendações baseadas nos padrões
      const recommendation = await generateRecommendations(equipmentId, patterns);
      console.log(`Nova recomendação gerada para equipamento ${equipmentId}:`, recommendation);
      return recommendation;
    }
    
    return null;
  } catch (err) {
    console.error(`Erro ao processar dados do equipamento ${equipmentId}:`, err);
    throw err;
  }
}

// Função para detectar padrões nos dados
async function detectPatterns(equipmentId, timeWindowHours = 24) {
  try {
    // Define o período de análise
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeWindowHours);
    
    // Busca eventos para o equipamento específico
    const query = { data_hora: { $gte: cutoffTime } };
    if (equipmentId) {
      query.equipment_id = equipmentId;
    }
    
    let events = await eventsCol().find(query).toArray();
    
    // Se não houver eventos suficientes, retorna vazio
    if (!events || events.length < 5) {
      return [];
    }
    
    // Converte ObjectId para string
    events = events.map(event => ({
      ...event,
      _id: event._id.toString()
    }));
    
    // Análise de padrões usando Python
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['-c', `
import json
import sys
import pandas as pd
from datetime import datetime

# Recebe os dados via stdin
try:
    data = json.loads(sys.stdin.read())
except:
    print(json.dumps([]))
    sys.exit(0)

# Converte para DataFrame
df = pd.DataFrame(data)

# Verifica se o DataFrame tem os campos necessários
if 'classe' not in df.columns or len(df) == 0:
    print(json.dumps([]))
    sys.exit(0)

# Converte data_hora para datetime
if 'data_hora' in df.columns:
    df['data_hora'] = pd.to_datetime(df['data_hora'])

# Lista para armazenar padrões detectados
detected_patterns = []

# 1. Verificar taxa de rejeição elevada
total_items = len(df)
rejected_items = len(df[df['classe'] == 'Reprovado'])
rejection_rate = rejected_items / total_items if total_items > 0 else 0

if total_items >= 20 and rejection_rate > 0.15:  # 15% de taxa de rejeição
    detected_patterns.append({
        "pattern_type": "alta_taxa_rejeicao",
        "description": f"Taxa de rejeição elevada de {rejection_rate:.1%}",
        "confidence": min(rejection_rate * 2, 0.95),
        "supporting_data": {
            "rejection_rate": rejection_rate,
            "total_items": total_items,
            "rejected_items": rejected_items
        }
    })

# 2. Verificar sequência de rejeições consecutivas
if len(df) >= 5:
    df = df.sort_values('data_hora')
    df['prev_class'] = df['classe'].shift(1)
    consecutive_rejects = df[
        (df['classe'] == 'Reprovado') & 
        (df['prev_class'] == 'Reprovado')
    ]
    
    if len(consecutive_rejects) >= 3:
        detected_patterns.append({
            "pattern_type": "sequencia_rejeicoes",
            "description": f"Sequência de {len(consecutive_rejects)} rejeições consecutivas",
            "confidence": min(0.5 + (len(consecutive_rejects) * 0.1), 0.95),
            "supporting_data": {
                "consecutive_count": len(consecutive_rejects),
                "timestamps": consecutive_rejects['data_hora'].astype(str).tolist()
            }
        })

# 3. Verificar padrões temporais
if len(df) >= 30 and 'data_hora' in df.columns:
    df['hour'] = df['data_hora'].dt.hour
    hourly_counts = df.groupby('hour').size()
    hourly_rejects = df[df['classe'] == 'Reprovado'].groupby('hour').size()
    
    hourly_reject_rate = {}
    for hour in hourly_counts.index:
        if hour in hourly_rejects.index:
            hourly_reject_rate[hour] = hourly_rejects[hour] / hourly_counts[hour]
        else:
            hourly_reject_rate[hour] = 0
    
    avg_reject_rate = rejection_rate
    for hour, rate in hourly_reject_rate.items():
        if rate > (avg_reject_rate * 1.5) and rate > 0.2:
            detected_patterns.append({
                "pattern_type": "padrao_temporal",
                "description": f"Taxa de rejeição elevada ({rate:.1%}) no horário {hour}h",
                "confidence": min((rate / avg_reject_rate) * 0.5, 0.9) if avg_reject_rate > 0 else 0.5,
                "supporting_data": {
                    "hour": int(hour),
                    "rejection_rate": float(rate),
                    "avg_rejection_rate": float(avg_reject_rate)
                }
            })

print(json.dumps(detected_patterns))
      `]);
      
      let resultData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Processo Python encerrou com código ${code}`);
          console.error(errorData);
          reject(new Error(`Processo Python falhou: ${errorData}`));
          return;
        }
        
        try {
          const patterns = JSON.parse(resultData);
          resolve(patterns);
        } catch (err) {
          reject(new Error(`Erro ao parsear resultados do Python: ${err.message}`));
        }
      });
      
      // Envia os dados para o processo Python
      pythonProcess.stdin.write(JSON.stringify(events));
      pythonProcess.stdin.end();
    });
  } catch (err) {
    console.error(`Erro ao detectar padrões para equipamento ${equipmentId}:`, err);
    throw err;
  }
}

// Função para gerar recomendações utilizando IA
async function generateRecommendations(equipmentId, patterns) {
  try {
    if (!patterns || patterns.length === 0) {
      return null;
    }
    
    // Prepara o contexto para o modelo de IA
    const context = {
      equipment_id: equipmentId,
      patterns: patterns,
      timestamp: new Date().toISOString()
    };
    
    // Constrói o prompt para análise
    const prompt = `
    Analise os seguintes padrões detectados no equipamento ${equipmentId} e forneça recomendações:
    
    ${JSON.stringify(context, null, 2)}
    
    Com base nos padrões acima, forneça:
    1. Uma recomendação principal para melhorar a qualidade da produção
    2. Uma prioridade de 1 a 5 (onde 5 é crítica)
    3. Justificativa baseada nos dados
    
    Formato da resposta:
    {
        "recommendation": "Sua recomendação aqui",
        "priority": 3,
        "justification": "Sua justificativa aqui"
    }
    `;
    
    // Verifica se a chave API existe antes de fazer a chamada
    if (!OPENAI_API_KEY) {
      throw new Error("Chave da API OpenAI não configurada");
    }
    
    // Chamada para a API de IA
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Você é um especialista em análise de sistemas de produção industrial." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extrai e processa a resposta
    const responseText = response.data.choices[0].message.content.trim();
    
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonStr = responseText.substring(jsonStart, jsonEnd);
      
      const recData = JSON.parse(jsonStr);
      
      // Cria o objeto de recomendação
      const recommendation = {
        timestamp: new Date(),
        equipment_id: equipmentId,
        recommendation_text: recData.recommendation || "",
        priority: recData.priority || 3,
        patterns: patterns,
        status: "active"
      };
      
      // Salva no MongoDB
      const result = await recommendationsCol().insertOne(recommendation);
      recommendation.id = result.insertedId.toString();
      
      return recommendation;
    } catch (err) {
      console.error("Erro ao processar resposta da IA:", err);
      
      // Fallback se o parsing falhar
      const recommendation = {
        timestamp: new Date(),
        equipment_id: equipmentId,
        recommendation_text: responseText.substring(0, 500),
        priority: 3,
        patterns: patterns,
        status: "active"
      };
      
      const result = await recommendationsCol().insertOne(recommendation);
      recommendation.id = result.insertedId.toString();
      
      return recommendation;
    }
  } catch (err) {
    console.error(`Erro na geração de recomendação para equipamento ${equipmentId}:`, err);
    throw err;
  }
}

// =========================
// Inicialização do servidor
// =========================
async function startServer() {
  try {
    await mongoClient.connect();
    console.log(`✅ MongoDB conectado em: ${MONGO_URL}`);
    
    // Garante que a coleção de recomendações exista
    await mongoClient.db(MONGO_DB).createCollection(RECOMMENDATION_COLLECTION, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["equipment_id", "timestamp", "recommendation_text", "patterns", "status"],
          properties: {
            equipment_id: { bsonType: "string" },
            timestamp: { bsonType: "date" },
            recommendation_text: { bsonType: "string" },
            priority: { bsonType: "int" },
            patterns: { bsonType: "array" },
            status: { bsonType: "string" }
          }
        }
      }
    }).catch(() => console.log("Coleção de recomendações já existe"));
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err);
    process.exit(1);
  }
}

startServer();