/**
 * ALSHAM 360° PRIMA - Create Organization System V2.1
 * CORRIGIDO: Aguarda Supabase carregar
 */

// Aguarda Supabase estar disponível
function waitForSupabase(callback, maxAttempts = 100, attempt = 0) {
  if (window.AlshamSupabase && window.AlshamSupabase.supabase) {
    console.log("✅ Supabase carregado para Create Org");
    callback();
  } else if (attempt >= maxAttempts) {
    console.error("❌ Supabase não carregou");
    showToast("Erro ao carregar sistema", "error");
  } else {
    setTimeout(() => waitForSupabase(callback, maxAttempts, attempt + 1), 100);
  }
}

// UI Helper (precisa estar fora)
function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  toast.className = `${colors[type] || colors.info} px-4 py-2 rounded-lg shadow transform translate-x-full opacity-0 transition-all`;
  toast.textContent = msg;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove("translate-x-full", "opacity-0"), 100);
  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => container.removeChild(toast), 300);
  }, 4000);
}

// Aguarda Supabase antes de executar
waitForSupabase(() => {
  const { supabase, createAuditLog } = window.AlshamSupabase;

  // ===== UTILIDADES =====
  function generateNewUUID() {
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    const input = document.getElementById("org-id");
    if (input) input.value = uuid;
    showToast("Novo UUID gerado", "info");
    return uuid;
  }

  // ===== AÇÕES =====
  async function createOrganization() {
    const id = document.getElementById("org-id")?.value.trim();
    const name = document.getElementById("org-name")?.value.trim();
    const statusEl = document.getElementById("create-status");

    if (!id || !name) {
      showToast("Preencha todos os campos", "warning");
      return;
    }

    statusEl.textContent = "🔄 Criando...";
    try {
      const { data: existing } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", id)
        .single();

      if (existing) {
        statusEl.textContent = "✅ Organização já existe";
        showToast("Organização já cadastrada", "info");
        localStorage.setItem("alsham_org_id", id);
        return;
      }

      const { data, error } = await supabase
        .from("organizations")
        .insert([{ id, name, created_at: new Date().toISOString() }])
        .select();

      if (error) throw error;

      localStorage.setItem("alsham_org_id", id);
      await createAuditLog("ORG_CREATED", { org_id: id, name }, "system", id);

      statusEl.textContent = `✅ Criada: ${name}`;
      showToast("Organização criada com sucesso", "success");
    } catch (e) {
      console.error("Erro criar organização:", e);
      statusEl.textContent = `❌ Erro: ${e.message}`;
      showToast("Erro ao criar", "error");
    }
  }

  async function verifyOrganization() {
    const id = document.getElementById("org-id")?.value.trim();
    const statusEl = document.getElementById("verify-status");
    const dataEl = document.getElementById("verify-data");

    if (!id) {
      showToast("Digite um UUID", "warning");
      return;
    }

    statusEl.textContent = "🔍 Verificando...";
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        statusEl.textContent = "❌ Não encontrada";
        dataEl.classList.add("hidden");
      } else {
        statusEl.textContent = `✅ Encontrada: ${data.name}`;
        dataEl.classList.remove("hidden");
        dataEl.innerHTML = `
          <p><b>ID:</b> ${data.id}</p>
          <p><b>Nome:</b> ${data.name}</p>
        `;
      }
    } catch (e) {
      console.error("Erro verificar organização:", e);
      statusEl.textContent = `❌ Erro: ${e.message}`;
      showToast("Erro ao verificar", "error");
    }
  }

  async function listOrganizations() {
    const statusEl = document.getElementById("list-status");
    const dataEl = document.getElementById("list-data");

    statusEl.textContent = "📋 Listando...";
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      statusEl.textContent = `✅ ${data.length} encontrada(s)`;
      dataEl.innerHTML =
        data
          .map(
            (org) =>
              `<div class="border-b py-2"><b>${org.name}</b><br><code>${org.id}</code></div>`
          )
          .join("") || "<p>Nenhuma organização encontrada</p>";
      dataEl.classList.remove("hidden");
    } catch (e) {
      console.error("Erro listar organizações:", e);
      statusEl.textContent = `❌ Erro: ${e.message}`;
      showToast("Erro ao listar", "error");
    }
  }

  async function setupComplete() {
    const statusEl = document.getElementById("complete-status");
    statusEl.textContent = "🚀 Executando setup...";

    try {
      await createOrganization();
      await verifyOrganization();
      await listOrganizations();

      statusEl.textContent = "🎉 Setup completo!";
      showToast("Setup completo finalizado!", "success");
    } catch (e) {
      console.error("Erro setup completo:", e);
      statusEl.textContent = `❌ Erro: ${e.message}`;
      showToast("Erro no setup", "error");
    }
  }

  // ===== EXPORT GLOBAL =====
  window.OrganizationSystem = {
    generateNewUUID,
    createOrganization,
    verifyOrganization,
    listOrganizations,
    setupComplete,
  };

  window.generateNewUUID = generateNewUUID;
  window.createOrganization = createOrganization;
  window.verifyOrganization = verifyOrganization;
  window.listOrganizations = listOrganizations;
  window.setupComplete = setupComplete;

  console.log("🏢 Create Organization System v2.1 pronto");
});
