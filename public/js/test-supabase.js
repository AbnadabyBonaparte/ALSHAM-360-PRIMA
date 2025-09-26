<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Diagnóstico Supabase — ALSHAM 360° PRIMA</title>
  <meta name="description" content="Ferramenta de diagnóstico do Supabase no ALSHAM 360° PRIMA. Testa conexão, autenticação, consultas e variáveis de ambiente." />

  <!-- ✅ CSP revisada -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    object-src 'none';
    frame-src 'self';
    worker-src 'self' blob:;">

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { inter: ['Inter', 'sans-serif'] },
          colors: { primary: '#3B82F6', secondary: '#8B5CF6' }
        }
      }
    }
  </script>

  <!-- CSS -->
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
</head>
<body class="font-inter bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex flex-col">

  <!-- Toasts -->
  <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <!-- Conteúdo -->
  <main class="flex-1 flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">🔍 Diagnóstico Supabase</h1>

      <div class="space-y-4">
        <button id="btn-check-env" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">Verificar Variáveis</button>
        <button id="btn-check-connection" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">Testar Conexão</button>
        <button id="btn-check-auth" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">Testar Sessão</button>
        <button id="btn-check-query" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">Testar Consulta</button>
      </div>

      <div id="diagnostic-output" class="mt-6 bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm"></div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-6 text-center text-gray-500 text-sm">
    © 2025 ALSHAM 360° PRIMA — Sistema Enterprise
  </footer>

  <!-- Script externo -->
  <script type="module" src="/js/test-supabase.js"></script>
</body>
</html>
