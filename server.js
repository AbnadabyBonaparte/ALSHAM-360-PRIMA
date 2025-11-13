import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Env vars
const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE,
  NODE_ENV,
  PORT = 3000,
  RATE_LIMIT_MAX = 1000,
  RATE_LIMIT_WINDOW = 15 * 60 * 1000,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Configuração inválida: defina SUPABASE_URL e SUPABASE_ANON_KEY");
  process.exit(1);
}

// ✅ Clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
  }
);

const app = express();

// ✅ Helmet (segurança enterprise)
app.use(
  helmet({
    contentSecurityPolicy:
      NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://cdn.tailwindcss.com",
                "https://*.supabase.co",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://apis.google.com"
              ],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
              connectSrc: [
                "'self'",
                "https://*.supabase.co",
                "wss://*.supabase.co",
                "https://api.openai.com",
                "https://www.google-analytics.com"
              ],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              workerSrc: ["'self'", "blob:"],
              objectSrc: ["'none'"],
              frameSrc: ["'self'"],
              manifestSrc: ["'self'"]
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

// ✅ Middlewares enterprise
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ✅ Rate limiting
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ✅ Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Auth middleware error' });
  }
};

// ✅ Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.1',
    env: NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ✅ Endpoints protegidos
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leads_crm').select('*').limit(100);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching leads:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('leads_crm').insert(req.body).select();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating lead:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/relatorios', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads_crm')
      .select('status, count:count(*)')
      .group('status');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching reports:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Servir estáticos
app.use(express.static(join(__dirname, 'dist'), { extensions: ['html'], maxAge: '1d' }));

// ✅ SPA fallback
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(indexContent);
  } catch (err) {
    res.status(404).send('Página não encontrada');
  }
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Server error' });
});

// ✅ Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ALSHAM 360° PRIMA rodando em ${NODE_ENV || 'dev'} na porta ${PORT}`);
});

export default app;
