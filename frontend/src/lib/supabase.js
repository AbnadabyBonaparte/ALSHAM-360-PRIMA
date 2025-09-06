// lib/supabase.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// === TROQUEI PELOS SEUS DADOS ABAIXO ===
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'
export const supabase = createClient(supabaseUrl, supabaseKey)

// ====== BUSCA DE KPIs DO DASHBOARD ======
export async function getDashboardKPIs() {
  // Total de leads
  const { count: totalLeads, error: errorTotal } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // Leads qualificados
  const { count: qualifiedLeads, error: errorQualified } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'qualified')

  // Leads convertidos para receita/percentual
  const { data: convertedLeadsData, count: convertedLeadsCount, error: errorConverted } = await supabase
    .from('leads')
    .select('value', { count: 'exact' })
    .eq('status', 'converted')

  // Receita total
  const totalRevenue = convertedLeadsData
    ? convertedLeadsData.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0)
    : 0

  // Taxa de conversão
  const conversionRate = (totalLeads && totalLeads > 0 && convertedLeadsCount)
    ? Math.round((convertedLeadsCount / totalLeads) * 100)
    : 0

  return {
    data: {
      totalLeads: totalLeads || 0,
      qualifiedLeads: qualifiedLeads || 0,
      conversionRate,
      totalRevenue,
      lastUpdated: Date.now()
    },
    error: errorTotal || errorQualified || errorConverted
  }
}

// ====== BUSCA DE LEADS PARA TABELA ======
export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
