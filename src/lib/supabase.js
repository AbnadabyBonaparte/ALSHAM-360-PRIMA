// ALSHAM 360° PRIMA - O CÉREBRO DO SISTEMA
// Versão Definitiva: Contém TODAS as funções para interagir com o Supabase.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurações do Supabase (ÚNICA VEZ, SÓ AQUI)
const supabaseUrl = 'https://rgvnbtuqtxvfxhrdnkjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndm5idHVxdHh2ZnhocmRua2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTIzNjIsImV4cCI6MjA3MDQ4ODM2Mn0.CxKiXMiYLz2b-yux0JI-A37zu4Q_nxQUnRf_MzKw-VI';

export const DEFAULT_ORG_ID = 'd2c41372-5b3c-441e-b9cf-b5f89c4b6dfe';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== AUTENTICAÇÃO COM EMAIL E SENHA =====
export async function signInWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Erro no login:', error.message);
        return { user: null, error };
    }
}

export async function signUpWithEmail(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Erro no registro:', error.message);
        return { user: null, error };
    }
}

// ===== AUTENTICAÇÃO SOCIAL =====
export async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/index.html`
            }
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Erro no login com Google:', error.message);
        return { data: null, error };
    }
}

export async function signInWithMicrosoft() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                redirectTo: `${window.location.origin}/index.html`
            }
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Erro no login com Microsoft:', error.message);
        return { data: null, error };
    }
}

// ===== GESTÃO DE SENHA =====
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/src/pages/login.html`
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao resetar senha:', error.message);
        return { data: null, error };
    }
}

export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Erro ao atualizar senha:', error.message);
        return { user: null, error };
    }
}

// ===== AUTENTICAÇÃO E PERFIS =====
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar perfil:', error.message);
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
            const profile = await getUserProfile(user.id);
            return { user, profile };
        }
        return { user: null, profile: null };
    } catch (error) {
        console.error('Erro ao obter usuário:', error.message);
        return { user: null, profile: null };
    }
}

// Funções de sessão e listeners que o auth.js precisa
export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Erro ao buscar sessão:", error);
        return null;
    }
    return data.session;
}

export function onAuthStateChange(callback) {
    supabase.auth.onAuthStateChanged(async (event, session) => {
        let profile = null;
        if (session?.user) {
            profile = await getUserProfile(session.user.id);
        }
        callback(event, session, profile);
    });
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
}

// ===== DASHBOARD KPIs =====
export async function getDashboardKPIs(orgId) {
    try {
        const { data, error } = await supabase
            .from('dashboard_kpis')
            .select('*')
            .eq('org_id', orgId)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar KPIs:', error);
            // Retorna dados padrão em caso de erro
            return {
                data: {
                    total_leads: 0,
                    leads_convertidos: 0,
                    receita_total: 0,
                    score_media_ia: 0,
                    receita_fechada: 0
                },
                error: null
            };
        }
        
        // Se não há dados, retorna estrutura padrão
        if (!data) {
            return {
                data: {
                    total_leads: 0,
                    leads_convertidos: 0,
                    receita_total: 0,
                    score_media_ia: 0,
                    receita_fechada: 0
                },
                error: null
            };
        }
        
        return { data, error: null };
        
    } catch (error) {
        console.error('Erro ao buscar KPIs do dashboard:', error);
        return {
            data: {
                total_leads: 0,
                leads_convertidos: 0,
                receita_total: 0,
                score_media_ia: 0,
                receita_fechada: 0
            },
            error
        };
    }
}

// ===== LEADS AVANÇADOS =====
export async function getLeadsAvancados(orgId, options = {}) {
    try {
        const limit = options.limit || 50;
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('org_id', orgId)
            .limit(limit)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao buscar leads:', error);
            return { data: [], error };
        }
        
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Erro ao buscar leads avançados:', error);
        return { data: [], error };
    }
}

// ===== FUNIL ANALYTICS =====
export async function getFunilAnalytics(orgId) {
    try {
        const { data, error } = await supabase
            .from('funil_analytics')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar funil:', error);
            return { data: [], error };
        }
        
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Erro ao buscar analytics do funil:', error);
        return { data: [], error };
    }
}

// ===== PERFORMANCE TEMPORAL =====
export async function getPerformanceTemporalBetterStuff(orgId) {
    try {
        const { data, error } = await supabase
            .from('performance_temporal')
            .select('*')
            .eq('org_id', orgId)
            .order('data_registro', { ascending: false })
            .limit(30);
        
        if (error) {
            console.error('Erro ao buscar performance temporal:', error);
            return { data: { timeline: [] }, error };
        }
        
        return { data: { timeline: data || [] }, error: null };
    } catch (error) {
        console.error('Erro ao buscar performance temporal:', error);
        return { data: { timeline: [] }, error };
    }
}

// ===== GAMIFICAÇÃO =====
export async function getGamificationStatus(userId, orgId) {
    try {
        const { data, error } = await supabase
            .from('gamification_status')
            .select('*')
            .eq('user_id', userId)
            .eq('org_id', orgId)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar gamificação:', error);
            return {
                data: {
                    perfil: { level: 1, total_points: 0 },
                    progressao: { streak_atual: 0 },
                    badges: []
                },
                error: null
            };
        }
        
        return { 
            data: data || {
                perfil: { level: 1, total_points: 0 },
                progressao: { streak_atual: 0 },
                badges: []
            }, 
            error: null 
        };
    } catch (error) {
        console.error('Erro ao buscar status de gamificação:', error);
        return {
            data: {
                perfil: { level: 1, total_points: 0 },
                progressao: { streak_atual: 0 },
                badges: []
            },
            error
        };
    }
}

export async function registrarPontosGamificacao(userId, acao, pontos) {
    try {
        const { data, error } = await supabase
            .from('gamification_pontos')
            .insert({
                user_id: userId,
                acao,
                pontos,
                created_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Erro ao registrar pontos:', error);
            return { data: null, error };
        }
        
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao registrar pontos de gamificação:', error);
        return { data: null, error };
    }
}

// ===== INSIGHTS IA =====
export async function getInsightsIA(orgId) {
    try {
        const { data, error } = await supabase
            .from('insights_ia')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('Erro ao buscar insights IA:', error);
            return {
                data: {
                    predicoes: [],
                    proximasAcoes: [],
                    insights: []
                },
                error
            };
        }
        
        return { 
            data: {
                predicoes: data || [],
                proximasAcoes: data || [],
                insights: data || []
            }, 
            error: null 
        };
    } catch (error) {
        console.error('Erro ao buscar insights de IA:', error);
        return {
            data: {
                predicoes: [],
                proximasAcoes: [],
                insights: []
            },
            error
        };
    }
}
