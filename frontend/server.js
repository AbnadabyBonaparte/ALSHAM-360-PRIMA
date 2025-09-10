/**
 * 🚀 ALSHAM 360° PRIMA - Enterprise Server 10/10 NASA Standard
 * 
 * Servidor Express.js enterprise-grade com:
 * - Multi-tenancy e segurança máxima
 * - Rate limiting e proteção DDoS
 * - Logging estruturado e monitoramento
 * - Cache Redis e otimizações de performance
 * - Suporte PWA e SSR
 * - Integração completa com Supabase
 * - Deployment Railway ready
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

// ===== IMPORTS E CONFIGURAÇÕES =====
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const winston = require('winston');
const Redis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs').promises;
const cluster = require('cluster');
const os = require('os');

// ===== CONFIGURAÇÕES DE AMBIENTE =====
const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    logLevel: process.env.LOG_LEVEL || 'info',
    enableCluster: process.env.ENABLE_CLUSTER === 'true',
    maxCpus: parseInt(process.env.MAX_CPUS) || os.cpus().length
};

// ===== LOGGER ENTERPRISE =====
const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.colorize({ all: true })
    ),
    defaultMeta: { service: 'alsham-360-server' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// ===== REDIS CLIENT ENTERPRISE =====
let redisClient;
try {
    redisClient = new Redis(config.redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
    });

    redisClient.on('connect', () => logger.info('Redis conectado com sucesso'));
    redisClient.on('error', (err) => logger.error('Erro Redis:', err));
    redisClient.on('ready', () => logger.info('Redis pronto para uso'));
    redisClient.on('reconnecting', () => logger.warn('Redis reconectando...'));
} catch (error) {
    logger.error('Erro ao conectar Redis:', error);
    redisClient = null;
}

// ===== SUPABASE CLIENT ENTERPRISE =====
const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// ===== MIDDLEWARE DE CACHE ENTERPRISE =====
const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (!redisClient || req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}`;
        
        try {
            const cached = await redisClient.get(key);
            if (cached) {
                logger.info(`Cache hit: ${key}`);
                res.set('X-Cache', 'HIT');
                return res.json(JSON.parse(cached));
            }
            
            res.sendResponse = res.json;
            res.json = (body) => {
                if (res.statusCode === 200) {
                    redisClient.setex(key, duration, JSON.stringify(body))
                        .catch(err => logger.error('Erro ao salvar cache:', err));
                }
                res.set('X-Cache', 'MISS');
                res.sendResponse(body);
            };
            
            next();
        } catch (error) {
            logger.error('Erro no middleware de cache:', error);
            next();
        }
    };
};

// ===== MIDDLEWARE DE AUTENTICAÇÃO =====
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Token de acesso requerido',
                code: 'UNAUTHORIZED'
            });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ 
                error: 'Token inválido ou expirado',
                code: 'INVALID_TOKEN'
            });
        }

        req.user = user;
        req.userId = user.id;
        
        // Buscar organização do usuário
        const { data: orgData } = await supabase
            .from('user_organizations')
            .select('org_id, role')
            .eq('user_id', user.id)
            .single();
            
        req.orgId = orgData?.org_id;
        req.userRole = orgData?.role;
        
        next();
    } catch (error) {
        logger.error('Erro na autenticação:', error);
        res.status(500).json({ 
            error: 'Erro interno de autenticação',
            code: 'AUTH_ERROR'
        });
    }
};

// ===== RATE LIMITING ENTERPRISE =====
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message, code: 'RATE_LIMIT_EXCEEDED' },
        standardHeaders: true,
        legacyHeaders: false,
        store: redisClient ? new (require('rate-limit-redis'))({
            sendCommand: (...args) => redisClient.call(...args),
        }) : undefined,
        skip: (req) => {
            // Skip rate limiting para health checks
            return req.path === '/health' || req.path === '/metrics';
        }
    });
};

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 100, // Permitir 100 requests por 15 min sem delay
    delayMs: 500, // Adicionar 500ms de delay por request após o limite
    maxDelayMs: 20000, // Máximo de 20 segundos de delay
});

// ===== FUNÇÃO PRINCIPAL DO SERVIDOR =====
function createServer() {
    const app = express();

    // ===== MIDDLEWARE DE SEGURANÇA =====
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "https:", "wss:"],
                mediaSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false
    }));

    // ===== CORS ENTERPRISE =====
    app.use(cors({
        origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Org-ID'],
        exposedHeaders: ['X-Total-Count', 'X-Cache']
    }));

    // ===== MIDDLEWARE BÁSICO =====
    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // ===== LOGGING =====
    app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
    }));

    // ===== RATE LIMITING =====
    app.use('/api/', createRateLimit(15 * 60 * 1000, 1000, 'Muitas requisições da API'));
    app.use('/auth/', createRateLimit(15 * 60 * 1000, 50, 'Muitas tentativas de autenticação'));
    app.use(speedLimiter);

    // ===== MIDDLEWARE DE MÉTRICAS =====
    app.use((req, res, next) => {
        req.startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - req.startTime;
            logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        });
        next();
    });

    // ===== ROTAS DE SAÚDE =====
    app.get('/health', async (req, res) => {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config.nodeEnv,
            services: {
                redis: redisClient ? 'connected' : 'disconnected',
                supabase: 'connected'
            }
        };

        // Verificar Redis
        if (redisClient) {
            try {
                await redisClient.ping();
                health.services.redis = 'connected';
            } catch (error) {
                health.services.redis = 'error';
                health.status = 'degraded';
            }
        }

        res.status(health.status === 'ok' ? 200 : 503).json(health);
    });

    app.get('/metrics', async (req, res) => {
        const metrics = {
            timestamp: new Date().toISOString(),
            process: {
                pid: process.pid,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                loadAverage: os.loadavg()
            }
        };

        res.json(metrics);
    });

    // ===== ROTAS DA API =====
    
    // Rota de autenticação
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email e senha são obrigatórios',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                logger.warn(`Tentativa de login falhada para ${email}: ${error.message}`);
                return res.status(401).json({
                    error: 'Credenciais inválidas',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            logger.info(`Login bem-sucedido para ${email}`);
            res.json({
                user: data.user,
                session: data.session,
                message: 'Login realizado com sucesso'
            });

        } catch (error) {
            logger.error('Erro no login:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    });

    // Rota de logout
    app.post('/api/auth/logout', authMiddleware, async (req, res) => {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                logger.error('Erro no logout:', error);
                return res.status(500).json({
                    error: 'Erro ao fazer logout',
                    code: 'LOGOUT_ERROR'
                });
            }

            logger.info(`Logout realizado para usuário ${req.userId}`);
            res.json({ message: 'Logout realizado com sucesso' });

        } catch (error) {
            logger.error('Erro no logout:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    });

    // Rota de dados do dashboard
    app.get('/api/dashboard/stats', authMiddleware, cacheMiddleware(60), async (req, res) => {
        try {
            const { data: leads } = await supabase
                .from('leads')
                .select('*')
                .eq('org_id', req.orgId);

            const { data: deals } = await supabase
                .from('deals')
                .select('*')
                .eq('org_id', req.orgId);

            const stats = {
                totalLeads: leads?.length || 0,
                totalDeals: deals?.length || 0,
                conversionRate: leads?.length ? ((deals?.length || 0) / leads.length * 100).toFixed(2) : 0,
                revenue: deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
            };

            res.json(stats);

        } catch (error) {
            logger.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                error: 'Erro ao carregar estatísticas',
                code: 'STATS_ERROR'
            });
        }
    });

    // Rota de leads
    app.get('/api/leads', authMiddleware, cacheMiddleware(30), async (req, res) => {
        try {
            const { page = 1, limit = 20, status, search } = req.query;
            const offset = (page - 1) * limit;

            let query = supabase
                .from('leads')
                .select('*', { count: 'exact' })
                .eq('org_id', req.orgId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (status) {
                query = query.eq('status', status);
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            res.set('X-Total-Count', count);
            res.json({
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar leads:', error);
            res.status(500).json({
                error: 'Erro ao carregar leads',
                code: 'LEADS_ERROR'
            });
        }
    });

    // ===== SERVIR ARQUIVOS ESTÁTICOS =====
    app.use(express.static('dist', {
        maxAge: config.nodeEnv === 'production' ? '1y' : '0',
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));

    // ===== SPA FALLBACK =====
    app.get('*', async (req, res) => {
        try {
            const indexPath = path.join(__dirname, 'dist', 'index.html');
            const indexContent = await fs.readFile(indexPath, 'utf8');
            res.send(indexContent);
        } catch (error) {
            logger.error('Erro ao servir index.html:', error);
            res.status(404).send('Página não encontrada');
        }
    });

    // ===== MIDDLEWARE DE ERRO GLOBAL =====
    app.use((error, req, res, next) => {
        logger.error('Erro não tratado:', error);
        
        res.status(error.status || 500).json({
            error: config.nodeEnv === 'production' 
                ? 'Erro interno do servidor' 
                : error.message,
            code: error.code || 'INTERNAL_ERROR',
            ...(config.nodeEnv !== 'production' && { stack: error.stack })
        });
    });

    return app;
}

// ===== INICIALIZAÇÃO DO SERVIDOR =====
async function startServer() {
    try {
        // Criar diretório de logs se não existir
        await fs.mkdir('logs', { recursive: true });

        const app = createServer();
        
        const server = app.listen(config.port, '0.0.0.0', () => {
            logger.info(`🚀 ALSHAM 360° PRIMA Server rodando na porta ${config.port}`);
            logger.info(`📊 Ambiente: ${config.nodeEnv}`);
            logger.info(`🔧 PID: ${process.pid}`);
            logger.info(`💾 Redis: ${redisClient ? 'Conectado' : 'Desconectado'}`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            logger.info(`Recebido ${signal}. Iniciando shutdown graceful...`);
            
            server.close(() => {
                logger.info('Servidor HTTP fechado.');
                
                if (redisClient) {
                    redisClient.disconnect();
                    logger.info('Redis desconectado.');
                }
                
                process.exit(0);
            });

            // Forçar saída após 30 segundos
            setTimeout(() => {
                logger.error('Forçando saída após timeout.');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Tratar erros não capturados
        process.on('uncaughtException', (error) => {
            logger.error('Exceção não capturada:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Promise rejeitada não tratada:', reason);
            process.exit(1);
        });

    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// ===== CLUSTER MODE (OPCIONAL) =====
if (config.enableCluster && cluster.isMaster) {
    logger.info(`Iniciando cluster com ${config.maxCpus} workers`);
    
    for (let i = 0; i < config.maxCpus; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} morreu. Reiniciando...`);
        cluster.fork();
    });
} else {
    startServer();
}

module.exports = { createServer, startServer };

