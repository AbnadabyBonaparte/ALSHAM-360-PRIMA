// Script simples para verificar tabelas do Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('URL:', supabaseUrl);
  console.log('Key presente:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais não encontradas!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Lista de tabelas possíveis baseada no catálogo
  const possibleTables = [
    'leads_crm',
    'opportunities',
    'campaigns',
    'organizations',
    'user_profiles',
    'user_organizations',
    'gamification_points',
    'gamification_badges',
    'notifications',
    'ai_predictions',
    'audit_log',
    'leads_crm',
    'sales_opportunities',
    'contacts',
    'accounts',
    'automation_rules',
    'automation_executions',
    'email_templates',
    'lead_labels',
    'lead_sources',
    'sentiment_analysis_logs',
    'ai_logs'
  ];

  console.log('\n🔍 Verificando tabelas existentes...');

  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Erro - ${err.message}`);
    }
  }
}

checkTables().catch(console.error);






