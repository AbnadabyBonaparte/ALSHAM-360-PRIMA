const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://rgvnbtuqtxvfxhrdnkjg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI'
);

// Lista de tabelas conhecidas do catálogo
const knownTables = [
  'leads_crm', 'opportunities', 'campaigns', 'contacts', 'accounts',
  'organizations', 'user_organizations', 'user_profiles', 'user_roles',
  'gamification_points', 'gamification_badges', 'gamification_rank_history',
  'gamification_rewards', 'automations', 'automation_rules', 'automation_executions',
  'notifications', 'nft_gallery', 'security_audit_log', 'audit_log',
  'leads_crm_with_labels', 'v_crm_overview', 'v_gamification_summary',
  'v_leads_health', 'v_executive_overview', 'leads_por_origem',
  'gamification_rank_history', 'vw_gamification_rank', 'ai_predictions',
  'ai_recommendations', 'next_best_actions'
];

async function checkTables() {
  console.log('Verificando tabelas existentes no Supabase real...\n');

  const existingTables = [];
  const tableSchemas = {};

  for (const table of knownTables) {
    try {
      // Tentar fazer uma query simples
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (!error) {
        existingTables.push(table);
        console.log('✓ ' + table);

        // Salvar sample data para entender schema
        tableSchemas[table] = {
          exists: true,
          sample: data?.[0] || null,
          sampleKeys: data?.[0] ? Object.keys(data[0]) : []
        };
      } else {
        console.log('✗ ' + table + ' - ' + error.message);
      }
    } catch (err) {
      console.log('✗ ' + table + ' - Erro: ' + err.message);
    }

    // Pequena pausa para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\nResumo:');
  console.log('Tabelas encontradas:', existingTables.length);
  console.log('Tabelas testadas:', knownTables.length);

  // Salvar resultado
  fs.writeFileSync('supabase-schema-check.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    existingTables,
    tableSchemas,
    totalTested: knownTables.length,
    totalFound: existingTables.length
  }, null, 2));

  console.log('\nSchema salvo em: supabase-schema-check.json');
}

checkTables().catch(console.error);






