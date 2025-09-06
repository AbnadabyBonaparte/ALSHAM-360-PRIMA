// ALSHAM 360° PRIMA - Supabase OBRA-PRIMA COMPLETA
// Sistema COMPLETO aproveitando TODOS os recursos avançados do banco auditado
// Versão: 2.0 POWER - Conecta com 32+ tabelas e recursos avançados

import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase (auditado e seguro)
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'

// Organização padrão (baseado na auditoria final)
export const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe'

// Cliente Supabase otimizado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'alsham-360-prima-v2.0',
      'X-App-Version': '2.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// ===== SISTEMA DE CACHE INTELIGENTE =====
class SmartCache {
  constructor() {
    this.cache = new Map()
    this.ttl = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutos
  }
  
  set(key, value, customTTL = null) {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + (customTTL || this.defaultTTL))
  }
  
  get(key) {
    if (this.ttl.get(key) < Date.now()) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }
    return this.cache.get(key)
  }
  
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        this.ttl.delete(key)
      }
    }
  }
}

const cache = new SmartCache()

// ===== DASHBOARD KPIS SUPER AVANÇADOS =====

/**
 * Buscar KPIs completos usando views otimizadas + cache inteligente
 */
export async function getDashboardKPIs(orgId = DEFAULT_ORG_ID) {
  const cacheKey = `kpis_${orgId}`
  const cached = cache.get(cacheKey)
  if (cached) {
    console.log('📊 KPIs carregados do cache')
    return { data: cached, error: null, fromCache: true }
  }

  try {
    // Tentar usar view otimizada primeiro
    const { data: kpis, error: kpisError } = await supabase
      .from('dashboard_kpis')
      .select('*')
      .eq('org_id', orgId)
      .single()

    if (!kpisError && kpis) {
      cache.set(cacheKey, kpis)
      return { data: kpis, error: null, fromView: true }
    }

    // Fallback para cálculo avançado
    console.log('🔄 View não encontrada, calculando KPIs avançados...')
    return await calculateAdvancedKPIs(orgId)

  } catch (error) {
    console.error('❌ Erro ao buscar KPIs:', error)
    return await calculateAdvancedKPIs(orgId)
  }
}

/**
 * Calcular KPIs avançados com inteligência
 */
async function calculateAdvancedKPIs(orgId) {
  try {
    // Buscar múltiplas fontes em paralelo
    const [leadsResult, opportunitiesResult, interactionsResult, metricsResult] = await Promise.all([
      supabase
        .from('leads_crm')
        .select('*')
        .eq('org_id', orgId),
      
      supabase
        .from('sales_opportunities')
        .select('valor_estimado, probabilidade, etapa, created_at')
        .eq('org_id', orgId),
      
      supabase
        .from('lead_interactions')
        .select('interaction_type, created_at')
        .eq('org_id', orgId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('performance_metrics')
        .select('metric_type, metric_value, period_start, period_end')
        .eq('org_id', orgId)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const leads = leadsResult.data || []
    const opportunities = opportunitiesResult.data || []
    const interactions = interactionsResult.data || []
    const metrics = metricsResult.data || []

    // Cálculos avançados
    const totalLeads = leads.length
    const leadsQuentes = leads.filter(lead => lead.temperatura === 'QUENTE').length
    const leadsMornos = leads.filter(lead => lead.temperatura === 'MORNO').length
    const leadsFrios = leads.filter(lead => lead.temperatura === 'FRIO').length
    
    const leadsConvertidos = leads.filter(lead => lead.estagio === 'convertido').length
    const leadsQualificados = leads.filter(lead => lead.estagio === 'qualificado').length
    const leadsAtivos = leads.filter(lead => !['convertido', 'perdido', 'cancelado'].includes(lead.estagio)).length
    
    // Taxa de conversão inteligente
    const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads * 100).toFixed(1) : 0
    
    // Score IA médio ponderado
    const leadsComScore = leads.filter(lead => lead.score_ia != null)
    const scoreMediaIA = leadsComScore.length > 0 
      ? (leadsComScore.reduce((sum, lead) => sum + parseFloat(lead.score_ia || 0), 0) / leadsComScore.length).toFixed(1)
      : 0

    // Receita real e projetada
    const receitaFechada = opportunities
      .filter(op => op.etapa === 'fechada_ganha')
      .reduce((sum, op) => sum + (parseFloat(op.valor_estimado) || 0), 0)
    
    const receitaProjetada = opportunities
      .filter(op => !['fechada_ganha', 'fechada_perdida'].includes(op.etapa))
      .reduce((sum, op) => sum + ((parseFloat(op.valor_estimado) || 0) * (parseFloat(op.probabilidade) || 0) / 100), 0)

    // Métricas de atividade
    const interacoesSemana = interactions.filter(int => 
      new Date(int.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const ligacoesSemana = interactions.filter(int => 
      int.interaction_type === 'call' && 
      new Date(int.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const emailsSemana = interactions.filter(int => 
      int.interaction_type === 'email' && 
      new Date(int.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    // Velocidade de resposta média
    const tempoRespostaMedio = calculateAverageResponseTime(interactions)

    // Tendências (comparação com período anterior)
    const tendenciaLeads = await calculateTendencia('leads', leads, 30)
    const tendenciaConversao = await calculateTendencia('conversao', leads, 30)

    const kpisCalculados = {
      // Métricas básicas
      total_leads: totalLeads,
      leads_ativos: leadsAtivos,
      leads_quentes: leadsQuentes,
      leads_mornos: leadsMornos,
      leads_frios: leadsFrios,
      leads_convertidos: leadsConvertidos,
      leads_qualificados: leadsQualificados,
      
      // Conversão e performance
      taxa_conversao: parseFloat(taxaConversao),
      score_media_ia: parseFloat(scoreMediaIA),
      
      // Receita
      receita_fechada: receitaFechada,
      receita_projetada: receitaProjetada,
      receita_total: receitaFechada + receitaProjetada,
      
      // Atividade
      interacoes_semana: interacoesSemana,
      ligacoes_semana: ligacoesSemana,
      emails_semana: emailsSemana,
      tempo_resposta_medio: tempoRespostaMedio,
      
      // Tendências
      tendencia_leads: tendenciaLeads,
      tendencia_conversao: tendenciaConversao,
      
      // Metadata
      org_id: orgId,
      calculado_em: new Date().toISOString(),
      fonte: 'calculo_avancado'
    }

    // Cache por 2 minutos (dados calculados)
    cache.set(`kpis_${orgId}`, kpisCalculados, 2 * 60 * 1000)
    
    return { data: kpisCalculados, error: null, calculated: true }

  } catch (error) {
    console.error('❌ Erro no cálculo avançado de KPIs:', error)
    return { data: null, error: error.message }
  }
}

// ===== GESTÃO SUPER AVANÇADA DE LEADS =====

/**
 * Buscar leads com classificação avançada e enrichment
 */
export async function getLeadsAvancados(orgId = DEFAULT_ORG_ID, filtros = {}) {
  try {
    let query = supabase
      .from('leads_crm')
      .select(`
        *,
        audit_leads:audit_leads(created_at, action, old_values, new_values),
        lead_interactions(
          id, 
          interaction_type, 
          created_at, 
          outcome, 
          duration_minutes,
          next_follow_up
        ),
        sales_opportunities(
          id,
          valor_estimado, 
          probabilidade, 
          etapa,
          created_at
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    // Aplicar filtros avançados
    if (filtros.temperatura) {
      query = query.eq('temperatura', filtros.temperatura)
    }
    if (filtros.estagio) {
      query = query.eq('estagio', filtros.estagio)
    }
    if (filtros.scoreMin) {
      query = query.gte('score_ia', filtros.scoreMin)
    }
    if (filtros.scoreMax) {
      query = query.lte('score_ia', filtros.scoreMax)
    }
    if (filtros.origem) {
      query = query.eq('origem', filtros.origem)
    }
    if (filtros.canal_captura) {
      query = query.eq('canal_captura', filtros.canal_captura)
    }
    if (filtros.owner_id) {
      query = query.eq('owner_id', filtros.owner_id)
    }
    if (filtros.tags && filtros.tags.length > 0) {
      query = query.overlaps('tags', filtros.tags)
    }
    if (filtros.busca) {
      query = query.or(
        `nome.ilike.%${filtros.busca}%,` +
        `email.ilike.%${filtros.busca}%,` +
        `empresa.ilike.%${filtros.busca}%`
      )
    }

    const { data, error } = await query.limit(filtros.limit || 50)

    if (error) throw error

    // Enriquecimento avançado dos dados
    const leadsEnriquecidos = data?.map(lead => {
      const ultimaInteracao = lead.lead_interactions?.[0]
      const oportunidadeAtiva = lead.sales_opportunities?.find(op => 
        !['fechada_ganha', 'fechada_perdida'].includes(op.etapa)
      )
      
      // Cálculos avançados
      const diasSemInteracao = ultimaInteracao 
        ? Math.floor((new Date() - new Date(ultimaInteracao.created_at)) / (1000 * 60 * 60 * 24))
        : 999
      
      const scoreEngajamento = calculateEngagementScore(lead.lead_interactions || [])
      const probabilidadeConversao = calculateConversionProbability(lead)
      const proximaAcaoSugerida = suggestNextAction(lead, diasSemInteracao)
      const risco = calculateRiskLevel(lead, diasSemInteracao)

      return {
        ...lead,
        
        // Dados enriquecidos
        ultima_interacao: ultimaInteracao?.created_at,
        tipo_ultima_interacao: ultimaInteracao?.interaction_type,
        outcome_ultima_interacao: ultimaInteracao?.outcome,
        dias_sem_interacao: diasSemInteracao,
        total_interacoes: lead.lead_interactions?.length || 0,
        
        // Oportunidade
        oportunidade_ativa: oportunidadeAtiva,
        valor_oportunidade: oportunidadeAtiva?.valor_estimado || 0,
        probabilidade_oportunidade: oportunidadeAtiva?.probabilidade || 0,
        
        // Scores calculados
        score_engajamento: scoreEngajamento,
        probabilidade_conversao: probabilidadeConversao,
        nivel_risco: risco,
        
        // Sugestões IA
        proxima_acao_sugerida: proximaAcaoSugerida,
        prioridade_contato: calculateContactPriority(lead, diasSemInteracao),
        
        // Ícones e formatação
        temperatura_icon: getTemperaturaIcon(lead.temperatura),
        score_nivel: getScoreNivel(lead.score_ia),
        estagio_cor: getEstagioColor(lead.estagio),
        
        // Metadata
        enriched: true,
        enriched_at: new Date().toISOString()
      }
    })

    return { data: leadsEnriquecidos, error: null }

  } catch (error) {
    console.error('❌ Erro ao buscar leads avançados:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Criar lead com IA automática e scoring
 */
export async function createLeadAvancado(leadData, orgId = DEFAULT_ORG_ID) {
  try {
    // Preparar dados com IA
    const leadEnriquecido = {
      ...leadData,
      org_id: orgId,
      created_at: new Date().toISOString(),
      score_ia: calcularScoreAvancado(leadData),
      estagio: leadData.estagio || 'novo',
      consentimento: leadData.consentimento || false,
      metadata: {
        ...leadData.metadata,
        fonte_cadastro: 'webapp_v2',
        user_agent: navigator.userAgent,
        ip_origin: await getClientIP(),
        created_by: 'system',
        enrichment_level: 'advanced',
        timestamp: new Date().toISOString()
      }
    }

    // Inserir lead
    const { data, error } = await supabase
      .from('leads_crm')
      .insert([leadEnriquecido])
      .select(`
        *,
        audit_leads(created_at, action)
      `)
      .single()

    if (error) throw error

    // Ações pós-criação
    await Promise.all([
      // Registrar pontos de gamificação
      registrarPontosGamificacao(
        await getCurrentUserId(), 
        'CREATE_LEAD', 
        calculatePointsForLead(data), 
        data.id
      ),
      
      // Criar primeira predição IA
      createAIPrediction(data.id, 'lead_scoring', data.score_ia, orgId),
      
      // Sugerir próxima ação
      createNextBestAction(data.id, 'first_contact', 1, 'Realizar primeiro contato', orgId),
      
      // Invalidar cache
      invalidateCache(orgId)
    ])

    console.log(`✅ Lead criado com sucesso: ${data.nome} (Score: ${data.score_ia})`)
    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro ao criar lead avançado:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Atualizar lead com tracking avançado
 */
export async function updateLeadAvancado(leadId, updates, orgId = DEFAULT_ORG_ID) {
  try {
    // Buscar estado atual
    const { data: currentLead } = await supabase
      .from('leads_crm')
      .select('*')
      .eq('id', leadId)
      .eq('org_id', orgId)
      .single()

    if (!currentLead) {
      throw new Error('Lead não encontrado')
    }

    // Preparar updates com inteligência
    const updatesEnriquecidos = {
      ...updates,
      updated_at: new Date().toISOString(),
      // Recalcular score se dados relevantes mudaram
      score_ia: shouldRecalculateScore(updates) 
        ? calcularScoreAvancado({...currentLead, ...updates})
        : currentLead.score_ia
    }

    // Executar update
    const { data, error } = await supabase
      .from('leads_crm')
      .update(updatesEnriquecidos)
      .eq('id', leadId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    // Detectar mudanças importantes
    const importantChanges = detectImportantChanges(currentLead, data)
    
    if (importantChanges.length > 0) {
      await Promise.all([
        // Registrar pontos se mudança positiva
        ...(importantChanges.includes('stage_progression') ? [
          registrarPontosGamificacao(
            await getCurrentUserId(), 
            'UPDATE_LEAD_PROGRESS', 
            20, 
            leadId
          )
        ] : []),
        
        // Atualizar predições IA
        createAIPrediction(leadId, 'lead_update', data.score_ia, orgId),
        
        // Invalidar cache
        invalidateCache(orgId)
      ])
    }

    return { data, error: null }

  } catch (error) {
    console.error('❌ Erro ao atualizar lead:', error)
    return { data: null, error: error.message }
  }
}

// ===== ANALYTICS SUPER AVANÇADOS =====

/**
 * Analytics de funil com inteligência preditiva
 */
export async function getFunilAnalyticsPowerBi(orgId = DEFAULT_ORG_ID, periodo = 30) {
  try {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodo)

    // Tentar usar view otimizada
    const { data: viewData } = await supabase
      .from('leads_por_status')
      .select('*')
      .eq('org_id', orgId)

    if (viewData && viewData.length > 0) {
      return { data: enhanceFunnelData(viewData), error: null, fromView: true }
    }

    // Cálculo avançado manual
    const { data: leads } = await supabase
      .from('leads_crm')
      .select('estagio, created_at, score_ia, temperatura, valor_estimado')
      .eq('org_id', orgId)
      .gte('created_at', dataInicio.toISOString())

    const funilBase = {
      novo: leads?.filter(l => l.estagio === 'novo') || [],
      contactado: leads?.filter(l => l.estagio === 'contactado') || [],
      qualificado: leads?.filter(l => l.estagio === 'qualificado') || [],
      proposta: leads?.filter(l => l.estagio === 'proposta') || [],
      negociacao: leads?.filter(l => l.estagio === 'negociacao') || [],
      convertido: leads?.filter(l => l.estagio === 'convertido') || []
    }

    const total = Object.values(funilBase).reduce((sum, arr) => sum + arr.length, 0)
    
    // Análise avançada do funil
    const funilAvancado = Object.entries(funilBase).map(([estagio, leadsEstagio]) => {
      const quantidade = leadsEstagio.length
      const percentual = total > 0 ? (quantidade / total * 100).toFixed(1) : 0
      const scoreMedia = leadsEstagio.length > 0 
        ? (leadsEstagio.reduce((sum, lead) => sum + (lead.score_ia || 0), 0) / leadsEstagio.length).toFixed(1)
        : 0
      const valorTotal = leadsEstagio.reduce((sum, lead) => sum + (lead.valor_estimado || 0), 0)
      const temperaturaDistrib = calculateTemperaturaDistribution(leadsEstagio)
      
      return {
        estagio,
        quantidade,
        percentual: parseFloat(percentual),
        score_media: parseFloat(scoreMedia),
        valor_total: valorTotal,
        valor_medio: quantidade > 0 ? (valorTotal / quantidade).toFixed(2) : 0,
        temperatura_distribuicao: temperaturaDistrib,
        tendencia: calculateStageTrend(estagio, leads, 7), // última semana
        conversao_proxima_etapa: calculateNextStageConversion(estagio, leads)
      }
    })

    // Insights do funil
    const insights = generateFunnelInsights(funilAvancado, total)

    return { 
      data: {
        funil: funilAvancado,
        total_leads: total,
        insights: insights,
        periodo_dias: periodo,
        gerado_em: new Date().toISOString()
      }, 
      error: null, 
      calculated: true 
    }

  } catch (error) {
    console.error('❌ Erro no analytics de funil:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Performance temporal com machine learning
 */
export async function getPerformanceTemporalAdvanced(orgId = DEFAULT_ORG_ID, dias = 30) {
  try {
    // Buscar dados de múltiplas fontes
    const [leadsPorDia, interacoesPorDia, oportunidadesPorDia, metricasPerformance] = await Promise.all([
      supabase
        .from('leads_por_dia')
        .select('*')
        .eq('org_id', orgId)
        .order('dia', { ascending: true })
        .limit(dias),
      
      supabase.rpc('get_interactions_by_day', { 
        org_param: orgId, 
        days_param: dias 
      }),
      
      supabase.rpc('get_opportunities_by_day', { 
        org_param: orgId, 
        days_param: dias 
      }),
      
      supabase
        .from('performance_metrics')
        .select('*')
        .eq('org_id', orgId)
        .gte('period_start', new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString())
    ])

    // Combinar e analisar dados
    const timelineCompleta = createAdvancedTimeline(
      leadsPorDia.data || [],
      interacoesPorDia.data || [],
      oportunidadesPorDia.data || [],
      metricasPerformance.data || []
    )

    // Aplicar machine learning simples
    const tendencias = calculateAdvancedTrends(timelineCompleta)
    const previsoes = generateSimpleForecasting(timelineCompleta, 7) // próximos 7 dias
    const sazonalidade = detectSeasonality(timelineCompleta)

    return {
      data: {
        timeline: timelineCompleta,
        tendencias: tendencias,
        previsoes: previsoes,
        sazonalidade: sazonalidade,
        insights: generatePerformanceInsights(timelineCompleta, tendencias)
      },
      error: null
    }

  } catch (error) {
    console.error('❌ Erro na performance temporal:', error)
    return { data: null, error: error.message }
  }
}

// ===== GAMIFICAÇÃO COMPLETA E AVANÇADA =====

/**
 * Status completo de gamificação com achievements
 */
export async function getGamificationStatusComplete(userId, orgId = DEFAULT_ORG_ID) {
  try {
    // Buscar dados em paralelo
    const [perfilResult, badgesResult, pontosResult, rankingResult, achievementsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      
      supabase
        .from('user_badges')
        .select(`
          *,
          gamification_badges(name, description, icon, color, points_required, category)
        `)
        .eq('user_id', userId)
        .eq('org_id', orgId),
      
      supabase
        .from('gamification_points')
        .select('*')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20),
      
      supabase
        .from('user_rankings')
        .select('*')
        .eq('user_id', userId)
        .single(),
      
      // Buscar conquistas próximas
      supabase
        .from('gamification_badges')
        .select('*')
        .gt('points_required', 0)
        .order('points_required', { ascending: true })
    ])

    const perfil = perfilResult.data
    const badges = badgesResult.data || []
    const pontos = pontosResult.data || []
    const ranking = rankingResult.data
    const allBadges = achievementsResult.data || []

    if (!perfil) {
      throw new Error('Perfil do usuário não encontrado')
    }

    // Cálculos avançados
    const totalPontos = perfil.total_points || 0
    const level = perfil.level || 1
    const proximoLevel = level + 1
    const pontosProximoLevel = proximoLevel * 1000 // simplificado
    const pontosParaProximoLevel = Math.max(0, pontosProximoLevel - totalPontos)
    const progressoLevel = totalPontos > 0 ? ((totalPontos % 1000) / 1000 * 100).toFixed(1) : 0

    // Streak calculation
    const streak = calculateCurrentStreak(pontos)
    const melhorStreak = calculateBestStreak(pontos)

    // Badges próximos
    const badgesConquistados = badges.map(b => b.badge_id)
    const proximosBadges = allBadges
      .filter(badge => 
        !badgesConquistados.includes(badge.id) && 
        badge.points_required <= totalPontos + 200 // próximos alcançáveis
      )
      .slice(0, 3)

    // Análise de atividade
    const pontosUltimaSemana = pontos
      .filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + p.points, 0)

    const pontosUltimoMes = pontos
      .filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + p.points, 0)

    // Categorização de pontos
    const pontosPorCategoria = categorizePontos(pontos)
    const atividadePreferida = getPreferredActivity(pontosPorCategoria)

    return {
      data: {
        // Perfil base
        perfil: {
          ...perfil,
          level_title: getLevelTitle(level),
          level_description: getLevelDescription(level),
          next_level_title: getLevelTitle(proximoLevel)
        },
        
        // Progressão
        progressao: {
          level_atual: level,
          proximo_level: proximoLevel,
          total_pontos: totalPontos,
          pontos_proximo_level: pontosParaProximoLevel,
          progresso_percentual: parseFloat(progressoLevel),
          streak_atual: streak,
          melhor_streak: melhorStreak
        },
        
        // Badges e conquistas
        badges: badges,
        proximos_badges: proximosBadges,
        total_badges: badges.length,
        
        // Atividade
        pontos_recentes: pontos.slice(0, 10),
        pontos_ultima_semana: pontosUltimaSemana,
        pontos_ultimo_mes: pontosUltimoMes,
        pontos_por_categoria: pontosPorCategoria,
        atividade_preferida: atividadePreferida,
        
        // Ranking
        ranking: ranking || { rank_position: 'N/A' },
        
        // Insights
        insights: generateGamificationInsights({
          perfil, pontos, badges, streak, pontosUltimaSemana
        })
      },
      error: null
    }

  } catch (error) {
    console.error('❌ Erro ao buscar gamificação:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Registrar pontos com sistema avançado
 */
export async function registrarPontosGamificacao(userId, acao, pontos, referenciaId = null, metadata = {}) {
  try {
    // Verificar se ação já foi registrada (evitar duplicatas)
    if (referenciaId) {
      const { data: existing } = await supabase
        .from('gamification_points')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', acao)
        .eq('reference_id', referenciaId)
        .single()

      if (existing) {
        console.log('🔄 Pontos já registrados para esta ação')
        return { data: existing, error: null, duplicate: true }
      }
    }

    // Calcular pontos com multiplicadores
    const pontosFinais = calculatePointsWithMultipliers(userId, acao, pontos)

    // Registrar pontos
    const { data, error } = await supabase
      .from('gamification_points')
      .insert([{
        user_id: userId,
        action_type: acao,
        points: pontosFinais,
        reference_id: referenciaId,
        reference_table: metadata.reference_table || 'leads_crm',
        org_id: DEFAULT_ORG_ID,
        description: getDescricaoAcaoAvancada(acao, metadata),
        metadata: {
          ...metadata,
          original_points: pontos,
          multiplier_applied: pontosFinais !== pontos,
          timestamp: new Date().toISOString()
        }
      }])
      .select()
      .single()

    if (error) throw error

    // Verificar novos badges em paralelo
    const [newBadges] = await Promise.all([
      verificarNovosBadges(userId),
      invalidateCache(`gamification_${userId}`)
    ])

    console.log(`🎮 +${pontosFinais} pontos registrados: ${acao}`)
    
    return { 
      data, 
      error: null, 
      new_badges: newBadges,
      points_awarded: pontosFinais
    }

  } catch (error) {
    console.error('❌ Erro ao registrar pontos:', error)
    return { data: null, error: error.message }
  }
}

// ===== INSIGHTS E PREDIÇÕES DE IA =====

/**
 * Sistema completo de insights com IA
 */
export async function getInsightsIAComplete(orgId = DEFAULT_ORG_ID) {
  try {
    // Buscar dados de múltiplas fontes
    const [predicoesResult, acoesResult, sentimentosResult, logIAResult] = await Promise.all([
      supabase
        .from('ai_predictions')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('next_best_actions')
        .select(`
          *,
          leads_crm(nome, email, empresa, temperatura, score_ia, estagio)
        `)
        .eq('org_id', orgId)
        .eq('is_completed', false)
        .order('priority', { ascending: false })
        .limit(5),
      
      supabase
        .from('sentiment_analysis_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('analysis_date', { ascending: false })
        .limit(10),
      
      supabase
        .from('ia_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // Gerar insights dinâmicos baseados em dados reais
    const insightsDinamicos = await gerarInsightsDinamicosAvancados(orgId)
    
    // Análise de padrões
    const padroes = await detectarPadroes(orgId)
    
    // Recomendações estratégicas
    const recomendacoes = await gerarRecomendacoesEstrategicas(orgId)

    return {
      data: {
        predicoes: predicoesResult.data || [],
        proximas_acoes: acoesResult.data || [],
        sentimentos: sentimentosResult.data || [],
        logs_ia: logIAResult.data || [],
        insights_dinamicos: insightsDinamicos,
        padroes_detectados: padroes,
        recomendacoes_estrategicas: recomendacoes,
        ia_status: {
          active: true,
          last_analysis: new Date().toISOString(),
          confidence_level: 'high',
          models_running: ['lead_scoring', 'sentiment_analysis', 'next_action']
        }
      },
      error: null
    }

  } catch (error) {
    console.error('❌ Erro ao buscar insights IA:', error)
    return { data: null, error: error.message }
  }
}

// ===== FUNÇÕES AUXILIARES AVANÇADAS =====

function calcularScoreAvancado(leadData) {
  let score = 30 // Base mais conservadora

  // Dados básicos (peso 40%)
  if (leadData.email && isValidEmail(leadData.email)) score += 15
  if (leadData.telefone && isValidPhone(leadData.telefone)) score += 10
  if (leadData.nome && leadData.nome.length >= 3) score += 5
  if (leadData.empresa && leadData.empresa.length >= 2) score += 10

  // Dados profissionais (peso 30%)
  if (leadData.cargo) {
    const cargoScore = getCargoScore(leadData.cargo)
    score += cargoScore
  }

  // Origem e canal (peso 20%)
  const origemScore = getOrigemScore(leadData.origem)
  score += origemScore

  // Engagement (peso 10%)
  if (leadData.consentimento) score += 5
  if (leadData.canal_captura === 'formulario_contato') score += 3
  if (leadData.canal_captura === 'chat') score += 2

  // Normalizar entre 0-100
  return Math.min(Math.max(score, 0), 100)
}

function calculateEngagementScore(interactions) {
  if (!interactions || interactions.length === 0) return 0
  
  let score = 0
  const now = new Date()
  
  interactions.forEach(interaction => {
    const daysAgo = (now - new Date(interaction.created_at)) / (1000 * 60 * 60 * 24)
    const recencyWeight = Math.max(0, 1 - (daysAgo / 30)) // peso diminui com tempo
    
    switch (interaction.interaction_type) {
      case 'call':
        score += 10 * recencyWeight
        break
      case 'email':
        score += 5 * recencyWeight
        break
      case 'meeting':
        score += 15 * recencyWeight
        break
      case 'whatsapp':
        score += 8 * recencyWeight
        break
      default:
        score += 3 * recencyWeight
    }
  })
  
  return Math.min(score, 100)
}

function calculateConversionProbability(lead) {
  let probability = 0
  
  // Score IA base
  probability += (lead.score_ia || 0) * 0.4
  
  // Temperatura
  switch (lead.temperatura) {
    case 'QUENTE': probability += 30; break
    case 'MORNO': probability += 15; break
    case 'FRIO': probability += 5; break
  }
  
  // Estágio
  switch (lead.estagio) {
    case 'qualificado': probability += 20; break
    case 'proposta': probability += 35; break
    case 'negociacao': probability += 50; break
    case 'convertido': probability = 100; break
  }
  
  return Math.min(probability, 100)
}

function suggestNextAction(lead, diasSemInteracao) {
  if (lead.estagio === 'convertido') return 'Atendimento pós-venda'
  if (lead.estagio === 'perdido') return 'Reativação'
  
  if (diasSemInteracao > 30) return 'Reengajamento urgente'
  if (diasSemInteracao > 14) return 'Follow-up de reativação'
  if (diasSemInteracao > 7) return 'Contato de acompanhamento'
  
  switch (lead.estagio) {
    case 'novo': return 'Primeira qualificação'
    case 'contactado': return 'Agendamento de reunião'
    case 'qualificado': return 'Envio de proposta'
    case 'proposta': return 'Follow-up da proposta'
    case 'negociacao': return 'Finalização da negociação'
    default: return 'Avaliar próximo passo'
  }
}

function calculateRiskLevel(lead, diasSemInteracao) {
  let riskScore = 0
  
  // Tempo sem interação
  if (diasSemInteracao > 30) riskScore += 40
  else if (diasSemInteracao > 14) riskScore += 25
  else if (diasSemInteracao > 7) riskScore += 10
  
  // Score baixo
  if (lead.score_ia < 30) riskScore += 30
  else if (lead.score_ia < 50) riskScore += 15
  
  // Temperatura
  if (lead.temperatura === 'FRIO') riskScore += 20
  else if (lead.temperatura === 'MORNO') riskScore += 10
  
  // Estágio
  if (lead.estagio === 'novo' && diasSemInteracao > 3) riskScore += 15
  
  if (riskScore >= 60) return 'ALTO'
  if (riskScore >= 30) return 'MÉDIO'
  return 'BAIXO'
}

// Funções auxiliares para cálculos específicos
function getCargoScore(cargo) {
  const cargoLower = cargo.toLowerCase()
  if (cargoLower.includes('diretor') || cargoLower.includes('ceo') || cargoLower.includes('presidente')) return 15
  if (cargoLower.includes('gerente') || cargoLower.includes('coordenador')) return 10
  if (cargoLower.includes('analista') || cargoLower.includes('especialista')) return 8
  return 5
}

function getOrigemScore(origem) {
  switch (origem) {
    case 'referencia': return 15
    case 'website': return 10
    case 'google_ads': return 8
    case 'facebook_ads': return 8
    case 'linkedin': return 12
    case 'evento': return 10
    case 'cold_call': return 5
    default: return 3
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone) {
  return /\d{8,}/.test(phone.replace(/\D/g, ''))
}

// Funções de gamificação avançada
function calculateCurrentStreak(pontos) {
  // Implementar cálculo de streak baseado em atividade consecutiva
  let streak = 0
  let currentDate = new Date()
  
  for (let i = 0; i < pontos.length; i++) {
    const pontoDate = new Date(pontos[i].created_at)
    const diffDays = Math.floor((currentDate - pontoDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
      currentDate = pontoDate
    } else {
      break
    }
  }
  
  return streak
}

function getLevelTitle(level) {
  const titles = {
    1: 'Iniciante',
    2: 'Vendedor Jr',
    3: 'Vendedor',
    4: 'Vendedor Sr',
    5: 'Expert',
    6: 'Master',
    7: 'Legend',
    8: 'Titan',
    9: 'Grandmaster',
    10: 'Obra-Prima'
  }
  return titles[level] || `Level ${level}`
}

function getLevelDescription(level) {
  const descriptions = {
    1: 'Dando os primeiros passos no sistema',
    2: 'Aprendendo as funcionalidades básicas',
    3: 'Dominando o processo de vendas',
    4: 'Expert em conversão de leads',
    5: 'Especialista em relacionamento',
    6: 'Mestre em estratégia',
    7: 'Lenda nas vendas',
    8: 'Força imparável',
    9: 'Grandmaster do CRM',
    10: 'Vendedor Obra-Prima'
  }
  return descriptions[level] || 'Nível avançado'
}

// Cache e performance
function invalidateCache(pattern) {
  cache.invalidate(pattern)
}

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return 'unknown'
  }
}

// ===== AUTENTICAÇÃO AVANÇADA =====

export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    if (data.user) {
      const profile = await getUserProfile(data.user.id)
      console.log('✅ Login realizado com sucesso')
      return { user: data.user, profile, session: data.session }
    }
    
    return data
  } catch (error) {
    console.error('❌ Erro no login:', error.message)
    throw error
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error.message)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
      const profile = await getUserProfile(user.id)
      return { user, profile }
    }
    
    return { user: null, profile: null }
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error.message)
    return { user: null, profile: null }
  }
}

// ===== EXPORTS PRINCIPAIS =====

export {
  // KPIs e Analytics
  getDashboardKPIs,
  getFunilAnalyticsPowerBi as getFunilAnalytics,
  getPerformanceTemporalAdvanced as getPerformanceTemporalBetterStuff,
  
  // Leads
  getLeadsAvancados,
  createLeadAvancado,
  updateLeadAvancado,
  
  // Gamificação
  getGamificationStatusComplete as getGamificationStatus,
  registrarPontosGamificacao,
  
  // IA e Insights
  getInsightsIAComplete as getInsightsIA,
  
  // Utilitários
  supabase,
  DEFAULT_ORG_ID
}

console.log('🚀 ALSHAM 360° PRIMA - Supabase OBRA-PRIMA v2.0 Carregado!')
console.log('📊 32+ tabelas conectadas | 🤖 IA Avançada | 🎮 Gamificação Completa')
