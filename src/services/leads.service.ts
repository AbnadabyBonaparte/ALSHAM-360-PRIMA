// src/services/leads.service.ts
import { 
  getLeads, 
  updateLeadScore, 
  getTopLeadsByScore,
  subscribeLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadInteractions,
  bulkImportLeads
} from '../lib/supabase';

/**
 * 🧠 LEADS SERVICE - CAMADA DE INTELIGÊNCIA
 * Processa dados do Supabase com IA e cache inteligente
 */
class LeadsService {
  private cache = new Map();
  private subscribers = new Set();
  private aiCache = new Map();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 BUSCA INTELIGENTE COM CACHE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getLeadsIntelligent(filters = {}) {
    const cacheKey = JSON.stringify(filters);
    
    // Cache hit
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1min TTL
        return cached.data;
      }
    }

    // Buscar do Supabase
    const result = await getLeads(filters);
    
    if (!result?.success || !result?.data?.data) {
      return { success: false, data: [], enriched: [] };
    }

    const leads = result.data.data;

    // 🤖 ENRIQUECER COM IA
    const enriched = await this.enrichWithAI(leads);

    // Cache
    this.cache.set(cacheKey, {
      data: { success: true, data: leads, enriched },
      timestamp: Date.now()
    });

    return { success: true, data: leads, enriched };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 ENRIQUECIMENTO COM IA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async enrichWithAI(leads) {
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const aiData = await this.getAIData(lead);
        return {
          ...lead,
          ...aiData
        };
      })
    );
    return enrichedLeads;
  }

  async getAIData(lead) {
    const cacheKey = `ai_${lead.id}`;
    
    if (this.aiCache.has(cacheKey)) {
      return this.aiCache.get(cacheKey);
    }

    // Executar IA em paralelo
    const [
      conversionProb,
      nextAction,
      sentiment,
      similarLeads,
      riskScore
    ] = await Promise.all([
      this.predictConversion(lead),
      this.suggestNextAction(lead),
      this.analyzeSentiment(lead),
      this.findSimilarLeads(lead),
      this.calculateRisk(lead)
    ]);

    const aiData = {
      ai_conversion_probability: conversionProb,
      ai_next_best_action: nextAction,
      ai_sentiment: sentiment,
      ai_similar_leads: similarLeads,
      ai_risk_score: riskScore,
      ai_health_score: this.calculateHealthScore(lead, conversionProb, riskScore),
      ai_priority: this.calculatePriority(conversionProb, riskScore),
      ai_insights: this.generateInsights(lead, conversionProb, nextAction, sentiment)
    };

    this.aiCache.set(cacheKey, aiData);
    setTimeout(() => this.aiCache.delete(cacheKey), 300000); // 5min cache

    return aiData;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎲 PREVISÃO DE CONVERSÃO (ML)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async predictConversion(lead) {
    try {
      // Fatores de conversão
      let score = 50; // Base

      // 1. Engagement recente (+30%)
      const daysSinceLastContact = this.getDaysSince(lead.last_contact);
      if (daysSinceLastContact < 3) score += 30;
      else if (daysSinceLastContact < 7) score += 15;
      else if (daysSinceLastContact > 30) score -= 20;

      // 2. Score atual (+20%)
      if (lead.score_ia > 80) score += 20;
      else if (lead.score_ia > 60) score += 10;

      // 3. Interações (+15%)
      if (lead.interactions_count > 10) score += 15;
      else if (lead.interactions_count > 5) score += 8;

      // 4. Lead source qualidade (+10%)
      const qualitySources = ['referral', 'partner', 'organic'];
      if (qualitySources.includes(lead.lead_source?.toLowerCase())) {
        score += 10;
      }

      // 5. Comportamento do setor (+10%)
      // Buscar taxa de conversão histórica do setor
      const sectorRate = await this.getSectorConversionRate(lead.company);
      score += sectorRate * 0.1;

      // 6. Fit com ICP (+15%)
      const icpFit = this.calculateICPFit(lead);
      score += icpFit * 0.15;

      return Math.min(Math.max(score, 0), 100);
    } catch (err) {
      console.error('Prediction error:', err);
      return 50;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💡 PRÓXIMA MELHOR AÇÃO (SMART)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async suggestNextAction(lead) {
    const daysSince = this.getDaysSince(lead.last_contact);
    const conversionProb = await this.predictConversion(lead);
    
    // Lead quente + sem contato recente = URGENTE
    if (conversionProb > 70 && daysSince > 3) {
      return {
        action: 'call',
        priority: 'urgent',
        reason: 'Lead quente sem follow-up há ' + daysSince + ' dias',
        script: 'Ligar imediatamente para não perder oportunidade',
        icon: '📞',
        color: 'red'
      };
    }

    // Lead morno + engajado = EMAIL
    if (conversionProb > 50 && lead.interactions_count > 5) {
      return {
        action: 'email',
        priority: 'high',
        reason: 'Lead engajado, amadurecer relacionamento',
        script: 'Enviar email com case study relevante',
        icon: '📧',
        color: 'orange'
      };
    }

    // Lead frio + tempo sem contato = REENGAJAR
    if (conversionProb < 30 && daysSince > 30) {
      return {
        action: 'reengage',
        priority: 'medium',
        reason: 'Lead inativo, tentar reengajamento',
        script: 'Campanha de reativação com novo valor',
        icon: '🔄',
        color: 'yellow'
      };
    }

    // Lead novo = QUALIFICAR
    if (!lead.last_contact) {
      return {
        action: 'qualify',
        priority: 'high',
        reason: 'Lead novo, fazer qualificação inicial',
        script: 'Enviar pesquisa de qualificação',
        icon: '✅',
        color: 'blue'
      };
    }

    // Default = NUTRIR
    return {
      action: 'nurture',
      priority: 'low',
      reason: 'Lead em processo, continuar nutrição',
      script: 'Adicionar a sequência de nurturing',
      icon: '🌱',
      color: 'green'
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 😊 ANÁLISE DE SENTIMENTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async analyzeSentiment(lead) {
    // Palavras-chave de sentimento (simplificado)
    const positiveKeywords = ['interessado', 'gostei', 'perfeito', 'ótimo', 'excelente'];
    const negativeKeywords = ['caro', 'complicado', 'difícil', 'problema', 'não'];
    
    const notes = lead.notes?.toLowerCase() || '';
    
    let sentiment = 0;
    positiveKeywords.forEach(word => {
      if (notes.includes(word)) sentiment += 20;
    });
    negativeKeywords.forEach(word => {
      if (notes.includes(word)) sentiment -= 20;
    });

    // Normalizar entre -100 e 100
    sentiment = Math.min(Math.max(sentiment, -100), 100);

    return {
      score: sentiment,
      label: sentiment > 30 ? '😊 Positivo' : sentiment < -30 ? '😟 Negativo' : '😐 Neutro',
      color: sentiment > 30 ? 'green' : sentiment < -30 ? 'red' : 'gray'
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 LEADS SIMILARES (COLLABORATIVE FILTERING)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async findSimilarLeads(lead) {
    try {
      const allLeads = await this.getLeadsIntelligent({});
      if (!allLeads.data) return [];

      // Calcular similaridade
      const similarities = allLeads.data
        .filter(l => l.id !== lead.id)
        .map(l => ({
          lead: l,
          similarity: this.calculateSimilarity(lead, l)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      return similarities;
    } catch {
      return [];
    }
  }

  calculateSimilarity(lead1, lead2) {
    let score = 0;
    
    // Mesmo setor
    if (lead1.company === lead2.company) score += 30;
    
    // Score similar
    const scoreDiff = Math.abs((lead1.score_ia || 0) - (lead2.score_ia || 0));
    score += Math.max(0, 20 - scoreDiff / 5);
    
    // Mesma origem
    if (lead1.lead_source === lead2.lead_source) score += 15;
    
    // Status similar
    if (lead1.status === lead2.status) score += 15;

    return score;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚠️ CÁLCULO DE RISCO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async calculateRisk(lead) {
    let risk = 0;

    // 1. Inatividade
    const daysSince = this.getDaysSince(lead.last_contact);
    if (daysSince > 60) risk += 40;
    else if (daysSince > 30) risk += 20;

    // 2. Baixo engagement
    if ((lead.interactions_count || 0) < 2) risk += 30;

    // 3. Score baixo
    if ((lead.score_ia || 0) < 40) risk += 20;

    // 4. Sem próximas ações agendadas
    if (!lead.next_action_date) risk += 10;

    return Math.min(risk, 100);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💚 SCORE DE SAÚDE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  calculateHealthScore(lead, conversionProb, riskScore) {
    const health = conversionProb - riskScore;
    return Math.min(Math.max(health, 0), 100);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 PRIORIDADE AUTOMÁTICA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  calculatePriority(conversionProb, riskScore) {
    if (conversionProb > 70) return 'P0 - Urgente';
    if (conversionProb > 50 && riskScore < 30) return 'P1 - Alta';
    if (riskScore > 60) return 'P2 - Risco Alto';
    return 'P3 - Normal';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💡 GERAR INSIGHTS AUTOMÁTICOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  generateInsights(lead, conversionProb, nextAction, sentiment) {
    const insights = [];

    if (conversionProb > 80) {
      insights.push({
        type: 'opportunity',
        icon: '🎯',
        title: 'Oportunidade Quente!',
        message: `Lead tem ${conversionProb}% de chance de conversão. Priorize!`,
        action: 'Agendar call ASAP'
      });
    }

    if (sentiment.score < -30) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Sentimento Negativo',
        message: 'Lead demonstra insatisfação. Atenção necessária.',
        action: 'Revisar interações'
      });
    }

    const daysSince = this.getDaysSince(lead.last_contact);
    if (daysSince > 14 && conversionProb > 50) {
      insights.push({
        type: 'action',
        icon: '⏰',
        title: 'Follow-up Atrasado',
        message: `Sem contato há ${daysSince} dias com lead qualificado.`,
        action: nextAction.action
      });
    }

    return insights;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 TAXA DE CONVERSÃO POR SETOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getSectorConversionRate(company) {
    // Mock - em produção, buscar do Supabase
    const sectorRates = {
      'tecnologia': 45,
      'saas': 50,
      'ecommerce': 35,
      'serviços': 40,
      'default': 30
    };

    const sector = this.identifySector(company);
    return sectorRates[sector] || sectorRates.default;
  }

  identifySector(company) {
    if (!company) return 'default';
    const lower = company.toLowerCase();
    if (lower.includes('tech') || lower.includes('software')) return 'tecnologia';
    if (lower.includes('saas') || lower.includes('cloud')) return 'saas';
    if (lower.includes('loja') || lower.includes('shop')) return 'ecommerce';
    return 'default';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 FIT COM ICP (Ideal Customer Profile)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  calculateICPFit(lead) {
    let fit = 0;

    // Empresa com mais de 50 funcionários
    if (lead.company_size > 50) fit += 25;
    else if (lead.company_size > 10) fit += 15;

    // Budget adequado
    if (lead.estimated_budget > 10000) fit += 25;
    else if (lead.estimated_budget > 5000) fit += 15;

    // Setor alvo
    const targetSectors = ['tecnologia', 'saas', 'ecommerce'];
    const sector = this.identifySector(lead.company);
    if (targetSectors.includes(sector)) fit += 25;

    // Decision maker
    if (lead.position?.includes('CEO') || lead.position?.includes('Director')) {
      fit += 25;
    }

    return fit;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 UTILITÁRIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  getDaysSince(date) {
    if (!date) return 999;
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔄 REAL-TIME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  subscribe(callback) {
    return subscribeLeads((payload) => {
      // Limpar cache
      this.cache.clear();
      this.aiCache.clear();
      callback(payload);
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 ANALYTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getAnalytics(leads) {
    const total = leads.length;
    const qualified = leads.filter(l => (l.score_ia || 0) > 60).length;
    const hot = leads.filter(l => (l.ai_conversion_probability || 0) > 70).length;
    const cold = leads.filter(l => (l.ai_conversion_probability || 0) < 30).length;
    const atRisk = leads.filter(l => (l.ai_risk_score || 0) > 60).length;

    // Distribuição por fonte
    const bySource = leads.reduce((acc, lead) => {
      const source = lead.lead_source || 'Desconhecida';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Distribuição por status
    const byStatus = leads.reduce((acc, lead) => {
      const status = lead.status || 'novo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Score médio
    const avgScore = leads.reduce((sum, l) => sum + (l.score_ia || 0), 0) / total || 0;
    
    // Conversão estimada
    const avgConversion = leads.reduce((sum, l) => sum + (l.ai_conversion_probability || 0), 0) / total || 0;

    return {
      total,
      qualified,
      hot,
      cold,
      atRisk,
      avgScore: Math.round(avgScore),
      avgConversion: Math.round(avgConversion),
      bySource,
      byStatus,
      conversionRate: (qualified / total * 100) || 0,
      healthScore: Math.round((avgScore + avgConversion - (atRisk / total * 100)) / 2)
    };
  }
}

export const leadsService = new LeadsService();
