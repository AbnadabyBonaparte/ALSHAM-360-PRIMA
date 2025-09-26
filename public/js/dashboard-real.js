/**
 * 📊 ALSHAM 360° PRIMA - Dashboard Unificado (KPIs + Gráficos + Realtime)
 * Produção final multi-tenant com supabase.js
 *
 * @version 7.1.0 - PRODUÇÃO NASA 10/10
 * @author
 *   ALSHAM Development Team
 */

import {
  supabase,
  getCurrentSession,
  getCurrentOrgId,
  genericSelect,
  subscribeToTable
} from "/src/lib/supabase.js";

// ==============================
// AUTH
// ==============================
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.isAuthenticated = false;
  }

  async checkAuth() {
    try {
      const session = await getCurrentSession();
      if (!session?.user) return { authenticated: false };

      this.currentUser = session.user;
      this.isAuthenticated = true;

      const orgId = await getCurrentOrgId();
      const { data } = await genericSelect("user_profiles", { user_id: session.user.id, org_id: orgId });
      this.currentProfile = data?.[0] || null;

      return { authenticated: true, user: this.currentUser, profile: this.currentProfile, orgId };
    } catch (error) {
      console.error("Erro crítico na autenticação:", error);
      return { authenticated: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.currentUser = null;
      this.currentProfile = null;
      this.isAuthenticated = false;
      window.location.href = "/login.html";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }
}

// ==============================
// DATA
// ==============================
class DataManager {
  constructor(authManager) {
    this.auth = authManager;
  }

  async getLeads(limit = 100) {
    const orgId = this.auth.currentProfile?.org_id || (await getCurrentOrgId());
    const { data } = await genericSelect("leads_crm", { org_id: orgId }, { limit });
    return { success: true, data: data || [] };
  }

  async getSalesOpportunities() {
    const orgId = this.auth.currentProfile?.org_id || (await getCurrentOrgId());
    const { data } = await genericSelect("sales_opportunities", { org_id: orgId });
    return { success: true, data: data || [] };
  }
}

// ==============================
// DASHBOARD APP
// ==============================
class DashboardApp {
  constructor() {
    this.auth = new AuthManager();
    this.data = new DataManager(this.auth);
    this.state = { kpis: {}, leads: [], opportunities: [], charts: {} };
  }

  async init() {
    const authResult = await this.auth.checkAuth();
    if (!authResult.authenticated) return window.location.href = "/login.html";

    await this.loadRealData();
    this.renderDashboard();
    this.setupRealtime();
  }

  async loadRealData() {
    const [leadsResult, oppResult] = await Promise.all([
      this.data.getLeads(500),
      this.data.getSalesOpportunities()
    ]);
    this.state.leads = leadsResult.data;
    this.state.opportunities = oppResult.data;
    this.calculateKPIs();
  }

  calculateKPIs() {
    const leads = this.state.leads;
    const opps = this.state.opportunities;
    this.state.kpis = {
      totalLeads: leads.length,
      newLeadsToday: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
      leadsThisMonth: leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length,
      activeOpportunities: opps.filter(o => ["prospecting", "proposal", "negotiation"].includes(o.stage)).length,
      totalRevenue: opps.filter(o => o.stage === "closed_won").reduce((s, o) => s + (parseFloat(o.value) || 0), 0),
      conversionRate: leads.length ? ((leads.filter(l => l.status === "convertido").length / leads.length) * 100).toFixed(1) : 0
    };
  }

  setupRealtime() {
    const orgId = this.auth.currentProfile?.org_id;
    if (!orgId) return;

    subscribeToTable("leads_crm", orgId, () => this.refresh());
    subscribeToTable("sales_opportunities", orgId, () => this.refresh());
  }

  async refresh() {
    await this.loadRealData();
    this.renderDashboard();
  }

  renderDashboard() {
    this.renderKPIs();
    this.renderCharts();
  }

  renderKPIs() {
    const kpis = this.state.kpis;
    const container = document.getElementById("dashboard-kpis");
    if (!container) return;
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded shadow"><p>Total de Leads</p><h2>${kpis.totalLeads}</h2></div>
        <div class="bg-white p-6 rounded shadow"><p>Novos Hoje</p><h2>${kpis.newLeadsToday}</h2></div>
        <div class="bg-white p-6 rounded shadow"><p>Receita Total</p><h2>R$ ${(kpis.totalRevenue || 0).toLocaleString("pt-BR")}</h2></div>
        <div class="bg-white p-6 rounded shadow"><p>Taxa de Conversão</p><h2>${kpis.conversionRate}%</h2></div>
      </div>
    `;
  }

  renderCharts() {
    const canvasStatus = document.getElementById("status-chart");
    const canvasDaily = document.getElementById("daily-chart");
    if (!canvasStatus || !canvasDaily || !window.Chart) return;

    // Status Chart
    if (this.state.charts.statusChart) this.state.charts.statusChart.destroy();
    this.state.charts.statusChart = new Chart(canvasStatus.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Novo","Contatado","Qualificado","Proposta","Convertido","Perdido"],
        datasets: [{
          data: [
            this.state.leads.filter(l => l.status === "novo").length,
            this.state.leads.filter(l => l.status === "contatado").length,
            this.state.leads.filter(l => l.status === "qualificado").length,
            this.state.leads.filter(l => l.status === "proposta").length,
            this.state.leads.filter(l => l.status === "convertido").length,
            this.state.leads.filter(l => l.status === "perdido").length
          ],
          backgroundColor: ["#3B82F6","#F59E0B","#8B5CF6","#10B981","#EF4444","#6B7280"]
        }]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } }
    });

    // Daily Chart
    if (this.state.charts.dailyChart) this.state.charts.dailyChart.destroy();
    const days = [], counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}));
      counts.push(this.state.leads.filter(l => l.created_at?.startsWith(d.toISOString().split("T")[0])).length);
    }
    this.state.charts.dailyChart = new Chart(canvasDaily.getContext("2d"), {
      type: "line",
      data: { labels: days, datasets: [{ label:"Novos Leads", data: counts, borderColor:"#3B82F6", fill:true }] },
      options: { responsive: true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    });
  }
}

// ==============================
// INICIALIZAÇÃO
// ==============================
let dashboardApp = null;
document.addEventListener("DOMContentLoaded", async () => {
  dashboardApp = new DashboardApp();
  await dashboardApp.init();
});
