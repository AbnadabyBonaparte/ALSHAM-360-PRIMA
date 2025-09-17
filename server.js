import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js'; // Integração Supabase

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Env vars for Supabase (secure, from .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || 1000;
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000; // 15 min

// Freeze configs for immutability (enterprise-grade)
const frozenConfig = Object.freeze({
  port: PORT,
  rateLimit: { max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW },
});

// Supabase client (generic for all tables)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware auth for protected endpoints (check Supabase session)
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user; // Attach user for RLS
  next();
};

const app = express();

// Middleware de segurança (CSP ajustado para Supabase)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.supabase.co"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit(frozenConfig.rateLimit);
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// API Endpoints com Supabase (exemplos; expanda para 55+ tabelas)
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('leads_crm').select('*').limit(100);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('leads_crm').insert(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mais endpoints (ex.: relatorios)
app.get('/api/relatorios', authMiddleware, async (req, res) => {
  try {
    // Exemplo: KPIs agregados
    const { data, error } = await supabase.from('leads_crm').select('status, count(*)').group('status');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Servir arquivos estáticos (dist para build Vite)
app.use(express.static('dist', { extensions: ['html'] }));
app.use(express.static('.'));

// Ignorar favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

// SPA/Multi-page fallback
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf8');
    res.send(indexContent);
  } catch (err1) {
    try {
      const indexPath = join(__dirname, 'index.html');
      const indexContent = readFileSync(indexPath, 'utf8');
      res.send(indexContent);
    } catch (err2) {
      console.error('Erro ao servir índice:', err1, err2);
      res.status(404).send('Página não encontrada');
    }
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ALSHAM 360° PRIMA rodando na porta ${PORT}`);
});

export default app;
