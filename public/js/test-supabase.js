/**
 * 🧪 ALSHAM 360° PRIMA - Test Supabase Diagnostic Tool V1.0
 * CORRIGIDO: Aguarda Supabase carregar
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.supabase) {
    console.log("✅ Supabase carregado para Test");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    log("❌ ERRO: Supabase não carregou após 10 segundos");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// Logger
function log(msg) {
  const output = document.getElementById("diagnostic-output");
  if (!output) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
  console.log(msg);
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const {
    supabase,
    getCurrentSession,
    getCurrentUser,
    genericSelect,
    getDefaultOrgId
  } = window.AlshamSupabase;

  log("✅ Sistema de diagnóstico inicializado");

  // Verificar variáveis
  document.getElementById("btn-check-env")?.addEventListener("click", () => {
    log("🔍 Verificando variáveis de ambiente...");
    
    const hasSupabase = !!window.AlshamSupabase;
    const hasClient = !!supabase;
    const defaultOrg = getDefaultOrgId();
    
    log(`✓ AlshamSupabase: ${hasSupabase ? "✅ Carregado" : "❌ Não encontrado"}`);
    log(`✓ Supabase Client: ${hasClient ? "✅ Inicializado" : "❌ Falhou"}`);
    log(`✓ Default Org ID: ${defaultOrg || "❌ Não definido"}`);
  });

  // Testar conexão
  document.getElementById("btn-check-connection")?.addEventListener("click", async () => {
    log("🌐 Testando conexão com Supabase...");
    try {
      const { data, error } = await supabase.from("organizations").select("count").limit(1);
      if (error) throw error;
      log("✅ Conexão bem-sucedida");
    } catch (err) {
      log(`❌ Erro de conexão: ${err.message}`);
    }
  });

  // Testar sessão
  document.getElementById("btn-check-auth")?.addEventListener("click", async () => {
    log("🔐 Verificando sessão de autenticação...");
    try {
      const session = await getCurrentSession();
      const user = await getCurrentUser();
      
      if (session?.user) {
        log(`✅ Sessão ativa para: ${session.user.email}`);
        log(`✓ User ID: ${session.user.id}`);
      } else {
        log("⚠️ Nenhuma sessão ativa encontrada");
      }
      
      if (user) {
        log(`✓ User confirmado: ${user.email}`);
      }
    } catch (err) {
      log(`❌ Erro ao verificar sessão: ${err.message}`);
    }
  });

  // Testar consulta
  document.getElementById("btn-check-query")?.addEventListener("click", async () => {
    log("📊 Testando consulta de dados...");
    try {
      const orgId = getDefaultOrgId();
      log(`✓ Usando Org ID: ${orgId}`);
      
      const { data, error } = await genericSelect("leads_crm", { org_id: orgId }, { limit: 5 });
      
      if (error) throw error;
      
      log(`✅ Consulta bem-sucedida: ${data?.length || 0} registros encontrados`);
      
      if (data && data.length > 0) {
        log(`✓ Exemplo: ${data[0].nome || data[0].id || "registro sem nome"}`);
      }
    } catch (err) {
      log(`❌ Erro na consulta: ${err.message}`);
    }
  });

  log("🎯 Clique nos botões acima para executar os testes");
});
