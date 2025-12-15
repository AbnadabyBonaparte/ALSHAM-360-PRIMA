// Teste simples de conexão com Supabase via REST API
import { readFileSync } from 'fs';

async function testConnection() {
  console.log('🧪 Testando conexão com Supabase via REST API...');

  try {
    // Ler as credenciais do arquivo .env.local
    const envContent = readFileSync('.env.local', 'utf8');
    const envLines = envContent.split('\n');

    let supabaseUrl = '';
    let supabaseKey = '';

    envLines.forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1].trim();
      }
    });

    console.log('URL encontrada:', supabaseUrl);
    console.log('Key encontrada:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Credenciais não encontradas no .env.local!');
      return;
    }

    // Testar conexão básica
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status da resposta:', response.status);

    if (response.ok) {
      console.log('✅ Conexão estabelecida com sucesso!');
    } else {
      console.log('⚠️ Conexão estabelecida, mas resposta não OK:', response.status);
    }

    // Tentar listar tabelas
    console.log('\n📋 Testando acesso às tabelas...');

    const tables = ['organizations', 'user_profiles', 'leads_crm', 'audit_log'];

    for (const table of tables) {
      try {
        const tableResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        });

        if (tableResponse.ok) {
          console.log(`✅ ${table}: OK`);
        } else {
          console.log(`❌ ${table}: ${tableResponse.status} - ${tableResponse.statusText}`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

testConnection();
