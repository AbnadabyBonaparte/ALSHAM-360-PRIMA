// Teste de conexão com Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🧪 Testando conexão com Supabase...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('URL:', supabaseUrl);
  console.log('Key presente:', !!supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais não encontradas!');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Testar conexão básica
    const { data, error } = await supabase.from('organizations').select('count').limit(1);

    if (error) {
      console.log('⚠️ Tabela organizations não existe ou sem permissão:', error.message);
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
    }

    // Listar tabelas disponíveis
    console.log('\n📋 Verificando tabelas disponíveis...');
    const tables = [
      'organizations',
      'user_profiles',
      'leads_crm',
      'audit_log'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
  }
}

testConnection();






