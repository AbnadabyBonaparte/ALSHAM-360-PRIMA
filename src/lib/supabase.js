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
