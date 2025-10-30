import { execSync } from 'node:child_process';

const webhookUrl = process.env.N8N_GUARDIAN_WEBHOOK || 'https://n8n.yourdomain.com/webhook/supabase_guardian';
const isPlaceholderWebhook = /yourdomain\.com/i.test(webhookUrl);

async function notifyGuardian(payload) {
  if (!webhookUrl || isPlaceholderWebhook) {
    console.warn('⚠️ [Deploy Local] Webhook do n8n Guardian não configurado. Notificação simulada apenas em log.');
    console.info('[Deploy Local] Payload gerado:', payload);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`⚠️ [Deploy Local] Falha ao notificar n8n Guardian (status ${response.status}).`);
    }
  } catch (error) {
    console.error('⚠️ [Deploy Local] Erro ao enviar notificação ao n8n Guardian:', error);
  }
}

console.log('🚀 [Deploy Local] Iniciando build ALSHAM 360° PRIMA...');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ [Deploy Local] Build concluído com sucesso.');

  await notifyGuardian({
    event: 'deploy_local',
    status: 'success',
    timestamp: new Date().toISOString(),
    message: 'ALSHAM 360° PRIMA - Deploy local concluído com sucesso'
  });

  console.log('📡 [Deploy Local] Notificação enviada ao n8n Guardian.');
} catch (error) {
  console.error('❌ [Deploy Local] Falha no processo de deploy local:', error.message || error);

  await notifyGuardian({
    event: 'deploy_local',
    status: 'error',
    error: error.message || String(error),
    timestamp: new Date().toISOString()
  });

  process.exitCode = 1;
}
