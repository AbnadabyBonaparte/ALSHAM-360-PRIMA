import { supabase } from '../lib/supabase.js';

let currentUserProfile = null;
let leads = [];
let filters = { search: "", status: "", period: "" };
const tableName = 'leads_crm';

document.addEventListener("DOMContentLoaded", async () => {
  await initializeLeadsPage();
  setupUI();
});

async function initializeLeadsPage() {
  try {
    // Autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '../pages/login.html';
      return;
    }
    // Perfil para pegar org_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .single();
    if (profileError || !profile) throw new Error("Perfil ou organização do usuário não encontrada.");
    currentUserProfile = profile;
    await loadLeads();
  } catch (e) {
    showToast("Erro ao carregar usuário ou leads: " + e.message, "error");
  }
}

async function loadLeads() {
  showLoading(true);
  let query = supabase.from(tableName).select('*').eq('org_id', currentUserProfile.org_id).order('created_at', { ascending: false });
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) query = query.ilike('nome', `%${filters.search}%`);
  if (filters.period) {
    let since = null;
    const now = new Date();
    if (filters.period === "today") since = new Date(now.setHours(0,0,0,0));
    if (filters.period === "week") since = new Date(now.setDate(now.getDate() - 7));
    if (filters.period === "month") since = new Date(now.setDate(now.getDate() - 30));
    if (filters.period === "quarter") since = new Date(now.setDate(now.getDate() - 90));
    if (since) query = query.gte('created_at', since.toISOString());
  }
  const { data, error } = await query;
  if (error) {
    showToast("Erro ao carregar leads: " + error.message, "error");
    showLoading(false);
    return;
  }
  leads = data || [];
  renderLeads();
  updateKPIs();
  showLoading(false);
}

// ...restante igual ao código premium anterior: renderLeads, renderTableView, renderGridView, updateKPIs, toggleView, setupUI, handleNewLeadForm etc.
// Não esqueça de passar org_id na criação do lead!

// Exemplo do handleNewLeadForm:
async function handleNewLeadForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  data.org_id = currentUserProfile.org_id;
  const { error } = await supabase.from(tableName).insert([data]);
  if (!error) {
    showToast("Lead criado com sucesso!", "success");
    closeNewLeadModal();
    loadLeads();
  } else {
    showToast("Erro ao criar lead: " + error.message, "error");
  }
}

// (Inclua as funções de toast, loading, views etc. do JS premium anterior)
