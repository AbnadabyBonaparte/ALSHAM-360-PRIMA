// ALSHAM 360° PRIMA - SUPABASE LIB V4 (Com dados reais)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const TABLE = 'leads_crm'

export const DEFAULT_ORG_ID = 'default-org-id'

// ==== AUTENTICAÇÃO / PERFIL ====
export async function getCurrentUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { user: null, profile: null }
  
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_id, org_id, full_name, email')
    .eq('user_id', user.id)
    .single()
  
  if (profileError || !profile) return { user, profile: null }
  return { user, profile }
}

export async function signOut() {
  await supabase.auth.signOut()
}

// ==== FUNÇÕES DO DASHBOARD COM DADOS REAIS ====
export async function getDashboardKPIs(orgId) {
  try {
    // Busca leads por status
    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)

    if (leadsError) throw leadsError

    // Calcula KPIs reais
    const totalLeads = leads?.length || 0
    const leadsConvertidos = leads?.filter(l => l.status === 'convertido' || l.status === 'fechado')?.length || 0
    const receitaTotal = leads?.reduce((sum, l) => {
      if (l.status === 'convertido' || l.status === 'fechado') {
        return sum + (parseFloat(l.valor_negocio) || 0)
      }
      return sum
    }, 0) || 0

    // Score IA (baseado na taxa de conversão)
    const scoreMediaIA = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 10).toFixed(1) : 0

    // Meta (exemplo: R$ 100.000)
    const metaReceita = 100000
    const metaPercent = Math.min(Math.round((receitaTotal / metaReceita) * 100), 100)
    const metaFaltante = Math.max(metaReceita - receitaTotal, 0)

    // Melhor mês (simulado baseado no mês atual)
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const mesAtual = new Date().getMonth()
    const bestMonth = meses[mesAtual] + ' 2025'

    const data = {
      total_leads: totalLeads,
      leads_convertidos: leadsConvertidos,
      receita_total: receitaTotal,
      score_media_ia: parseFloat(scoreMediaIA),
      receita_fechada: receitaTotal,
      delta_receita: totalLeads > 0 ? Math.round(Math.random() * 30) : 0, // Simulado
      best_month: bestMonth,
      meta_percent: metaPercent,
      meta_faltante: metaFaltante
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDashboardGamificacao(orgId) {
  try {
    // Busca atividades do usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('responsavel', user.email) // ou user_id se tiver

    if (leadsError) throw leadsError

    const totalLeads = leads?.length || 0
    const leadsConvertidos = leads?.filter(l => l.status === 'convertido')?.length || 0
    
    // Calcula level baseado na performance
    const level = Math.min(Math.floor(totalLeads / 10) + 1, 10)
    const levelLabels = {
      1: 'Iniciante', 2: 'Aprendiz', 3: 'Praticante', 4: 'Experiente', 
      5: 'Especialista', 6: 'Avançado', 7: 'Expert', 8: 'Mestre', 
      9: 'Guru', 10: 'Lenda'
    }

    const streak = Math.floor(Math.random() * 15) + 1 // Simulado
    const levelProgress = ((totalLeads % 10) / 10) * 100

    // Metas diárias baseadas nos dados reais
    const ligacoesHoje = leads?.filter(l => {
      const hoje = new Date().toDateString()
      const leadDate = new Date(l.updated_at || l.created_at).toDateString()
      return leadDate === hoje && l.status !== 'novo'
    })?.length || 0

    const emailsHoje = leads?.filter(l => {
      const hoje = new Date().toDateString()
      const leadDate = new Date(l.updated_at || l.created_at).toDateString()
      return leadDate === hoje && l.observacoes?.toLowerCase().includes('email')
    })?.length || 0

    const propostasHoje = leads?.filter(l => {
      const hoje = new Date().toDateString()
      const leadDate = new Date(l.updated_at || l.created_at).toDateString()
      return leadDate === hoje && (l.status === 'proposta' || l.status === 'negociacao')
    })?.length || 0

    const data = {
      level: level,
      level_label: levelLabels[level] || 'Vendedor',
      level_progress: Math.round(levelProgress),
      streak: streak,
      next_badge: Math.max(15 - streak, 0),
      daily_goals: [
        { 
          label: "5 ligações feitas", 
          percent: Math.min(Math.round((ligacoesHoje / 5) * 100), 100) 
        },
        { 
          label: "3 e-mails enviados", 
          percent: Math.min(Math.round((emailsHoje / 3) * 100), 100) 
        },
        { 
          label: "2 propostas criadas", 
          percent: Math.min(Math.round((propostasHoje / 2) * 100), 100) 
        }
      ]
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDashboardFunil(orgId) {
  try {
    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('status')
      .eq('org_id', orgId)

    if (leadsError) throw leadsError

    const total = leads?.length || 1 // Evita divisão por 0
    
    // Conta leads por status
    const statusCount = {
      novo: 0,
      qualificado: 0,
      proposta: 0,
      fechado: 0
    }

    leads?.forEach(lead => {
      const status = lead.status?.toLowerCase()
      if (status === 'novo') statusCount.novo++
      else if (status === 'qualificado' || status === 'interessado') statusCount.qualificado++
      else if (status === 'proposta' || status === 'negociacao') statusCount.proposta++
      else if (status === 'convertido' || status === 'fechado') statusCount.fechado++
    })

    const steps = [
      { 
        label: "Lead", 
        value: statusCount.novo, 
        percent: 100, 
        color: ["from-blue-500", "to-blue-600"] 
      },
      { 
        label: "Qualificado", 
        value: statusCount.qualificado, 
        percent: Math.round((statusCount.qualificado / total) * 100), 
        color: ["from-green-500", "to-green-600"] 
      },
      { 
        label: "Proposta", 
        value: statusCount.proposta, 
        percent: Math.round((statusCount.proposta / total) * 100), 
        color: ["from-yellow-500", "to-yellow-600"] 
      },
      { 
        label: "Fechamento", 
        value: statusCount.fechado, 
        percent: Math.round((statusCount.fechado / total) * 100), 
        color: ["from-purple-500", "to-purple-600"] 
      }
    ]

    // Identifica gargalo
    const conversoes = [
      statusCount.qualificado / Math.max(statusCount.novo, 1),
      statusCount.proposta / Math.max(statusCount.qualificado, 1),
      statusCount.fechado / Math.max(statusCount.proposta, 1)
    ]
    
    const menorConversao = Math.min(...conversoes)
    const etapaGargalo = conversoes.indexOf(menorConversao)
    const etapasNomes = ['Qualificação', 'Proposta', 'Fechamento']

    const data = {
      steps,
      insight: {
        icon: "💡",
        title: `Insight: Gargalo na etapa "${etapasNomes[etapaGargalo]}"`,
        desc: `Taxa de conversão de ${Math.round(menorConversao * 100)}% nesta etapa`
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDashboardInsights(orgId) {
  try {
    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)

    if (leadsError) throw leadsError

    const insights = []

    // Insight 1: Melhor dia da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const conversoesPorDia = new Array(7).fill(0)
    const totalPorDia = new Array(7).fill(0)

    leads?.forEach(lead => {
      const dia = new Date(lead.created_at).getDay()
      totalPorDia[dia]++
      if (lead.status === 'convertido' || lead.status === 'fechado') {
        conversoesPorDia[dia]++
      }
    })

    const taxasPorDia = conversoesPorDia.map((conv, i) => 
      totalPorDia[i] > 0 ? conv / totalPorDia[i] : 0
    )
    const melhorDia = taxasPorDia.indexOf(Math.max(...taxasPorDia))
    
    if (totalPorDia[melhorDia] > 0) {
      insights.push({
        icon: "📅",
        text: `Seus leads de ${diasSemana[melhorDia]} convertem ${Math.round(taxasPorDia[melhorDia] * 100)}% mais`,
        sub: `Baseado em ${totalPorDia[melhorDia]} leads neste dia`,
        bg: "bg-blue-50"
      })
    }

    // Insight 2: Setor com melhor performance
    const setores = {}
    leads?.forEach(lead => {
      const setor = lead.setor || 'Outros'
      if (!setores[setor]) setores[setor] = { total: 0, convertidos: 0, receita: 0 }
      setores[setor].total++
      if (lead.status === 'convertido' || lead.status === 'fechado') {
        setores[setor].convertidos++
        setores[setor].receita += parseFloat(lead.valor_negocio) || 0
      }
    })

    let melhorSetor = null
    let maiorReceita = 0
    Object.entries(setores).forEach(([setor, dados]) => {
      if (dados.receita > maiorReceita && dados.total >= 2) {
        maiorReceita = dados.receita
        melhorSetor = setor
      }
    })

    if (melhorSetor) {
      insights.push({
        icon: "🏢",
        text: `Clientes do setor ${melhorSetor} geram mais receita`,
        sub: `R$ ${maiorReceita.toLocaleString('pt-BR')} em receita total`,
        bg: "bg-green-50"
      })
    }

    // Insight 3: Próxima ação sugerida
    const leadsParaContato = leads?.filter(l => 
      l.status === 'novo' || l.status === 'interessado'
    ).sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))

    if (leadsParaContato && leadsParaContato.length > 0) {
      const proximoLead = leadsParaContato[0]
      insights.push({
        icon: "⚡",
        text: `Hora de entrar em contato com ${proximoLead.nome}`,
        sub: `Lead há ${Math.floor((Date.now() - new Date(proximoLead.created_at)) / (1000 * 60 * 60 * 24))} dias sem contato`,
        bg: "bg-purple-50"
      })
    }

    // Se não tiver insights suficientes, adiciona genéricos
    if (insights.length === 0) {
      insights.push({
        icon: "📊",
        text: "Cadastre mais leads para gerar insights personalizados",
        sub: "A IA precisa de mais dados para análises precisas",
        bg: "bg-gray-50"
      })
    }

    return { data: insights, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDashboardPerformance(orgId) {
  try {
    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)

    if (leadsError) throw leadsError

    // Últimos 7 dias
    const hoje = new Date()
    const labels = []
    const revenue = []
    const leadsCount = []
    const conversions = []

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      const dataStr = data.toDateString()
      
      labels.push(data.toLocaleDateString('pt-BR', { weekday: 'short' }))

      const leadsDoDia = leads?.filter(l => 
        new Date(l.created_at).toDateString() === dataStr
      ) || []

      const receitaDoDia = leadsDoDia
        .filter(l => l.status === 'convertido' || l.status === 'fechado')
        .reduce((sum, l) => sum + (parseFloat(l.valor_negocio) || 0), 0)

      const conversoesDoDia = leadsDoDia
        .filter(l => l.status === 'convertido' || l.status === 'fechado').length

      revenue.push(receitaDoDia)
      leadsCount.push(leadsDoDia.length)
      conversions.push(conversoesDoDia)
    }

    const data = {
      revenue,
      leads: leadsCount,
      conversions,
      labels
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getNextBestAction(orgId) {
  try {
    const { data: leads, error: leadsError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .in('status', ['novo', 'interessado', 'qualificado'])
      .order('created_at', { ascending: true })
      .limit(1)

    if (leadsError) throw leadsError

    if (!leads || leads.length === 0) {
      return { data: null, error: 'Nenhum lead para contato' }
    }

    const lead = leads[0]
    const diasSemContato = Math.floor(
      (Date.now() - new Date(lead.updated_at || lead.created_at)) / (1000 * 60 * 60 * 24)
    )

    // Calcula chance baseada em dados reais
    let chance = 70 // Base
    if (diasSemContato <= 1) chance = 90
    else if (diasSemContato <= 3) chance = 80
    else if (diasSemContato <= 7) chance = 60
    else chance = 40

    const data = {
      name: lead.nome,
      phone: lead.telefone || lead.whatsapp || '5511999999999',
      chance: chance,
      last_contact: diasSemContato,
      sector: lead.setor || 'Não informado',
      value: parseFloat(lead.valor_negocio) || 0
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// ==== CRUD DE LEADS ====
export async function getLeads(orgId) {
  if (!orgId) return { data: [], error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createLead(lead, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const payload = { ...lead, org_id: orgId }
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single()
  return { data, error }
}

export async function updateLead(leadId, lead, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...lead })
    .eq('id', leadId)
    .eq('org_id', orgId)
    .select()
    .single()
  return { data, error }
}

export async function deleteLead(leadId, orgId) {
  if (!orgId) return { data: null, error: 'Org ID não informado.' }
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', leadId)
    .eq('org_id', orgId)
    .select()
    .single()
  return { data, error }
}

// ==== OUTRAS FUNÇÕES ====
export function getCurrentOrgId() {
  return localStorage.getItem('org_id')
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}

export async function signUpWithEmail(email, password, userData = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/src/pages/login.html`
  })
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { user: null, error }
  return { user: data.user, error: null }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/index.html` }
  })
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: { redirectTo: `${window.location.origin}/index.html` }
  })
  if (error) return { data: null, error }
  return { data, error: null }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

export function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    let profile = null
    if (session?.user) profile = await getUserProfile(session.user.id)
    callback(event, session, profile)
  })
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') return null
  return data
}

export default supabase
