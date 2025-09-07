// ALSHAM 360° PRIMA - Login JavaScript Ultimate 10/10
// Sistema de autenticação premium com recursos avançados de segurança e UX

import { 
    signInWithEmail, 
    signInWithGoogle, 
    signInWithMicrosoft,
    getCurrentUser,
    onAuthStateChange,
    resetPassword
} from '../lib/supabase.js'

// ===== ESTADO DA APLICAÇÃO =====
const loginState = {
    isLoading: false,
    isPasswordVisible: false,
    attemptCount: 0,
    maxAttempts: 5,
    lockoutTime: 300000, // 5 minutos
    isLocked: false,
    lastAttemptTime: null,
    formData: {
        email: '',
        password: '',
        rememberMe: false
    },
    validation: {
        email: false,
        password: false
    },
    biometricAvailable: false
};

// ===== ELEMENTOS DOM =====
const elements = {
    form: document.getElementById('login-form'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    loginBtnText: document.getElementById('login-btn-text'),
    loginSpinner: document.getElementById('login-spinner'),
    togglePassword: document.getElementById('toggle-password'),
    eyeOpen: document.getElementById('eye-open'),
    eyeClosed: document.getElementById('eye-closed'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    successMessage: document.getElementById('success-message'),
    successText: document.getElementById('success-text'),
    googleLogin: document.getElementById('google-login'),
    microsoftLogin: document.getElementById('microsoft-login'),
    appleLogin: document.getElementById('apple-login'),
    biometricLogin: document.getElementById('biometric-login'),
    rememberMe: document.getElementById('remember'),
    forgotPassword: document.getElementById('forgot-password'),
    loginAttempts: document.getElementById('login-attempts'),
    securityNotice: document.getElementById('security-notice'),
    offlineNotice: document.getElementById('offline-notice')
};

// ===== CONFIGURAÇÕES =====
const config = {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    passwordMinLength: 6,
    maxAttempts: 5,
    lockoutDuration: 300000, // 5 minutos
    sessionTimeout: 3600000, // 1 hora
    securityCheckInterval: 60000, // 1 minuto
    offlineCheckInterval: 5000, // 5 segundos
    animationDuration: 600,
    autoRedirectDelay: 1500
};

let securityTimer = null;
let offlineTimer = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeLoginPage);

async function initializeLoginPage() {
    console.log('🔐 Login page loaded - ALSHAM 360° PRIMA Ultimate');
    
    try {
        await checkAuthStatus();
        setupEventListeners();
        setupAnimations();
        setupSecurityFeatures();
        setupOfflineDetection();
        checkBiometricSupport();
        loadSavedCredentials();
        handleOAuthCallback();
        initializeSecurityTimer();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao carregar a página. Recarregue e tente novamente.');
    }
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
async function checkAuthStatus() {
    try {
        const { user, profile } = await getCurrentUser();
        
        if (user && profile) {
            showSuccess('Você já está logado! Redirecionando...');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, config.autoRedirectDelay);
            return true;
        }
    } catch (error) {
        // Usuário não logado - continua fluxo normal
    }
    return false;
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    // Formulário principal
    elements.form?.addEventListener('submit', handleLogin);
    
    // Campos de entrada
    elements.email?.addEventListener('input', debounce(validateEmail, 300));
    elements.password?.addEventListener('input', debounce(validatePassword, 300));
    
    // Visibilidade da senha
    elements.togglePassword?.addEventListener('click', togglePasswordVisibility);
    
    // OAuth providers
    elements.googleLogin?.addEventListener('click', handleGoogleLogin);
    elements.microsoftLogin?.addEventListener('click', handleMicrosoftLogin);
    elements.appleLogin?.addEventListener('click', handleAppleLogin);
    
    // Biometria
    elements.biometricLogin?.addEventListener('click', handleBiometricLogin);
    
    // Lembrar usuário
    elements.rememberMe?.addEventListener('change', updateRememberMe);
    
    // Esqueci minha senha
    elements.forgotPassword?.addEventListener('click', handleForgotPassword);
    
    // Teclas especiais
    elements.email?.addEventListener('keypress', handleEnterKey);
    elements.password?.addEventListener('keypress', handleEnterKey);
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Limpeza de mensagens
    [elements.email, elements.password].forEach(input => {
        input?.addEventListener('input', clearMessages);
        input?.addEventListener('focus', handleFieldFocus);
        input?.addEventListener('blur', handleFieldBlur);
    });
    
    // Estado de autenticação
    onAuthStateChange(handleAuthStateChange);
    
    // Eventos de segurança
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// ===== VALIDAÇÕES =====
function validateEmail() {
    const value = elements.email?.value.trim() || '';
    const isValid = config.emailRegex.test(value) && value.length <= 254;
    
    loginState.validation.email = isValid;
    loginState.formData.email = value;
    
    updateFieldValidation(elements.email, isValid, 
        isValid ? '' : 'Por favor, insira um e-mail válido');
    
    return isValid;
}

function validatePassword() {
    const value = elements.password?.value || '';
    const isValid = value.length >= config.passwordMinLength;
    
    loginState.validation.password = isValid;
    loginState.formData.password = value;
    
    updateFieldValidation(elements.password, isValid, 
        isValid ? '' : `A senha deve ter pelo menos ${config.passwordMinLength} caracteres`);
    
    return isValid;
}

function updateFieldValidation(field, isValid, errorMessage) {
    if (!field) return;
    
    // Reset classes
    field.classList.remove('border-red-300', 'border-green-300');
    
    // Aplicar estilo baseado na validação
    if (field.value.trim() !== '') {
        if (isValid) {
            field.classList.add('border-green-300');
        } else {
            field.classList.add('border-red-300');
        }
    }
    
    // Mostrar/esconder mensagem de erro no campo
    const errorElement = field.parentElement?.querySelector('.field-error');
    if (errorElement) {
        if (!isValid && errorMessage && field.value.trim() !== '') {
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        } else {
            errorElement.classList.add('hidden');
        }
    }
}

// ===== HANDLER PRINCIPAL DE LOGIN =====
async function handleLogin(e) {
    e.preventDefault();
    
    if (loginState.isLoading || loginState.isLocked) return;
    
    // Verificar limite de tentativas
    if (loginState.attemptCount >= config.maxAttempts) {
        lockAccount();
        return;
    }
    
    // Validar formulário
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    
    if (!emailValid || !passwordValid) {
        showError('Por favor, corrija os campos destacados');
        animateFormError();
        return;
    }
    
    try {
        setLoading(true);
        clearMessages();
        
        console.log('Tentativa de login:', loginState.formData.email);
        
        const result = await signInWithEmail(
            loginState.formData.email, 
            loginState.formData.password
        );
        
        if (result.user) {
            // Login bem-sucedido
            resetAttemptCount();
            showSuccess('Login realizado com sucesso! Redirecionando...');
            
            // Salvar credenciais se solicitado
            if (loginState.formData.rememberMe) {
                saveCredentials();
            } else {
                clearSavedCredentials();
            }
            
            // Registrar atividade de login
            await logLoginActivity(result.user.id, 'success');
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = '/index.html';
            }, config.autoRedirectDelay);
        }
        
    } catch (error) {
        loginState.attemptCount++;
        updateAttemptDisplay();
        
        await logLoginActivity(loginState.formData.email, 'failed', error.message);
        
        const errorMsg = getErrorMessage(error);
        showError(errorMsg);
        animateFormError();
        
        // Verificar se deve bloquear
        if (loginState.attemptCount >= config.maxAttempts) {
            lockAccount();
        }
        
    } finally {
        setLoading(false);
    }
}

// ===== HANDLERS OAUTH =====
async function handleGoogleLogin() {
    if (loginState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        console.log('Iniciando login com Google...');
        
        await signInWithGoogle();
        showSuccess('Redirecionando para Google...');
        trackSocialLogin('google');
        
    } catch (error) {
        showError('Erro ao conectar com Google. Tente novamente.');
        setLoading(false);
    }
}

async function handleMicrosoftLogin() {
    if (loginState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        console.log('Iniciando login com Microsoft...');
        
        await signInWithMicrosoft();
        showSuccess('Redirecionando para Microsoft...');
        trackSocialLogin('microsoft');
        
    } catch (error) {
        showError('Erro ao conectar com Microsoft. Tente novamente.');
        setLoading(false);
    }
}

async function handleAppleLogin() {
    if (loginState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        showSuccess('Login com Apple em desenvolvimento...');
        trackSocialLogin('apple');
        
    } catch (error) {
        showError('Erro ao conectar com Apple. Tente novamente.');
    } finally {
        setLoading(false);
    }
}

// ===== BIOMETRIA =====
async function checkBiometricSupport() {
    try {
        if (window.PublicKeyCredential && 
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
            loginState.biometricAvailable = true;
            if (elements.biometricLogin) {
                elements.biometricLogin.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.log('Biometria não disponível:', error);
    }
}

async function handleBiometricLogin() {
    try {
        setLoading(true);
        clearMessages();
        
        // Implementar WebAuthn
        showSuccess('Login biométrico em desenvolvimento...');
        
    } catch (error) {
        showError('Erro na autenticação biométrica. Tente novamente.');
    } finally {
        setLoading(false);
    }
}

// ===== RECUPERAÇÃO DE SENHA =====
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = elements.email?.value.trim();
    if (!email) {
        showError('Digite seu e-mail antes de solicitar recuperação de senha');
        elements.email?.focus();
        return;
    }
    
    if (!validateEmail()) {
        showError('Por favor, insira um e-mail válido');
        return;
    }
    
    try {
        setLoading(true);
        clearMessages();
        
        await resetPassword(email);
        showSuccess('Instruções de recuperação enviadas para seu e-mail!');
        
    } catch (error) {
        showError('Erro ao enviar instruções. Verifique o e-mail e tente novamente.');
    } finally {
        setLoading(false);
    }
}

// ===== GERENCIAMENTO DE TENTATIVAS =====
function updateAttemptDisplay() {
    if (elements.loginAttempts) {
        const remaining = config.maxAttempts - loginState.attemptCount;
        if (remaining <= 2 && remaining > 0) {
            elements.loginAttempts.textContent = `${remaining} tentativas restantes`;
            elements.loginAttempts.classList.remove('hidden');
            elements.loginAttempts.className = remaining === 1 ? 
                'text-red-600 text-sm mt-2' : 'text-yellow-600 text-sm mt-2';
        }
    }
}

function lockAccount() {
    loginState.isLocked = true;
    loginState.lastAttemptTime = Date.now();
    
    showError(`Conta temporariamente bloqueada por segurança. Tente novamente em ${config.lockoutDuration / 60000} minutos.`);
    
    if (elements.loginBtn) elements.loginBtn.disabled = true;
    
    // Timer para desbloqueio
    setTimeout(() => {
        unlockAccount();
    }, config.lockoutDuration);
    
    // Mostrar countdown
    showLockoutCountdown();
}

function unlockAccount() {
    loginState.isLocked = false;
    loginState.attemptCount = 0;
    
    if (elements.loginBtn) elements.loginBtn.disabled = false;
    if (elements.loginAttempts) elements.loginAttempts.classList.add('hidden');
    
    clearMessages();
    showSuccess('Conta desbloqueada. Você pode tentar fazer login novamente.');
}

function resetAttemptCount() {
    loginState.attemptCount = 0;
    if (elements.loginAttempts) elements.loginAttempts.classList.add('hidden');
}

function showLockoutCountdown() {
    if (!elements.loginAttempts) return;
    
    const startTime = Date.now();
    const endTime = startTime + config.lockoutDuration;
    
    const countdown = setInterval(() => {
        const now = Date.now();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        elements.loginAttempts.textContent = `Bloqueado por: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        elements.loginAttempts.classList.remove('hidden');
    }, 1000);
}

// ===== CREDENCIAIS SALVAS =====
function loadSavedCredentials() {
    try {
        const savedEmail = localStorage.getItem('alsham_remember_email');
        const rememberMe = localStorage.getItem('alsham_remember_me') === 'true';
        
        if (savedEmail && elements.email) {
            elements.email.value = savedEmail;
            loginState.formData.email = savedEmail;
            validateEmail();
        }
        
        if (elements.rememberMe) {
            elements.rememberMe.checked = rememberMe;
            loginState.formData.rememberMe = rememberMe;
        }
        
    } catch (error) {
        console.warn('Erro ao carregar credenciais salvas:', error);
    }
}

function saveCredentials() {
    try {
        localStorage.setItem('alsham_remember_email', loginState.formData.email);
        localStorage.setItem('alsham_remember_me', 'true');
    } catch (error) {
        console.warn('Erro ao salvar credenciais:', error);
    }
}

function clearSavedCredentials() {
    try {
        localStorage.removeItem('alsham_remember_email');
        localStorage.removeItem('alsham_remember_me');
    } catch (error) {
        console.warn('Erro ao limpar credenciais:', error);
    }
}

function updateRememberMe() {
    loginState.formData.rememberMe = elements.rememberMe?.checked || false;
}

// ===== HANDLERS DE EVENTOS =====
function handleEnterKey(e) {
    if (e.key === 'Enter' && !loginState.isLoading) {
        e.preventDefault();
        elements.form?.dispatchEvent(new Event('submit'));
    }
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter para submeter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        elements.form?.dispatchEvent(new Event('submit'));
    }
    
    // Escape para limpar mensagens
    if (e.key === 'Escape') {
        clearMessages();
    }
}

function handleFieldFocus(e) {
    e.target.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
}

function handleFieldBlur(e) {
    e.target.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
}

function handleAuthStateChange(event, session, profile) {
    if (event === 'SIGNED_IN' && session?.user) {
        showSuccess('Login realizado com sucesso!');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Página ficou invisível - pausar timers se necessário
    } else {
        // Página ficou visível - retomar timers
        if (loginState.isLocked) {
            const timeElapsed = Date.now() - loginState.lastAttemptTime;
            if (timeElapsed >= config.lockoutDuration) {
                unlockAccount();
            }
        }
    }
}

function handleBeforeUnload() {
    // Salvar estado se necessário
}

// ===== OAUTH CALLBACK =====
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
        let errorMsg = 'Erro na autenticação. Tente novamente.';
        
        if (error === 'access_denied') {
            errorMsg = 'Acesso negado. Você cancelou a autenticação.';
        } else if (error === 'server_error') {
            errorMsg = 'Erro no servidor. Tente novamente em alguns minutos.';
        }
        
        showError(errorMsg);
        
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// ===== RECURSOS DE SEGURANÇA =====
function setupSecurityFeatures() {
    // Detectar tentativas de força bruta
    const attempts = sessionStorage.getItem('login_attempts');
    if (attempts) {
        loginState.attemptCount = parseInt(attempts);
        updateAttemptDisplay();
    }
    
    // Salvar tentativas na sessão
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('login_attempts', loginState.attemptCount.toString());
    });
}

function initializeSecurityTimer() {
    securityTimer = setInterval(() => {
        checkSecurityThreats();
    }, config.securityCheckInterval);
}

function checkSecurityThreats() {
    // Verificar múltiplas abas
    const tabCount = parseInt(sessionStorage.getItem('tab_count') || '0') + 1;
    sessionStorage.setItem('tab_count', tabCount.toString());
    
    if (tabCount > 3) {
        showSecurityNotice('Detectadas múltiplas abas de login. Por segurança, recomendamos usar apenas uma aba.');
    }
    
    // Verificar tentativas suspeitas
    if (loginState.attemptCount >= 3) {
        showSecurityNotice('Múltiplas tentativas de login detectadas. Certifique-se de estar usando suas credenciais corretas.');
    }
}

function showSecurityNotice(message) {
    if (elements.securityNotice) {
        elements.securityNotice.textContent = message;
        elements.securityNotice.classList.remove('hidden');
        
        setTimeout(() => {
            elements.securityNotice.classList.add('hidden');
        }, 10000);
    }
}

// ===== DETECÇÃO OFFLINE =====
function setupOfflineDetection() {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificação periódica
    offlineTimer = setInterval(checkOnlineStatus, config.offlineCheckInterval);
}

function handleOnline() {
    if (elements.offlineNotice) {
        elements.offlineNotice.classList.add('hidden');
    }
    clearMessages();
    showSuccess('Conexão restaurada!');
}

function handleOffline() {
    if (elements.offlineNotice) {
        elements.offlineNotice.classList.remove('hidden');
    }
    showError('Sem conexão com a internet. Verifique sua rede.');
}

function checkOnlineStatus() {
    if (!navigator.onLine) {
        handleOffline();
    }
}

// ===== UTILITÁRIOS =====
function togglePasswordVisibility() {
    loginState.isPasswordVisible = !loginState.isPasswordVisible;
    
    if (elements.password) {
        elements.password.type = loginState.isPasswordVisible ? 'text' : 'password';
    }
    if (elements.eyeOpen) {
        elements.eyeOpen.classList.toggle('hidden', !loginState.isPasswordVisible);
    }
    if (elements.eyeClosed) {
        elements.eyeClosed.classList.toggle('hidden', loginState.isPasswordVisible);
    }
}

function setLoading(loading) {
    loginState.isLoading = loading;
    
    [elements.loginBtn, elements.googleLogin, elements.microsoftLogin, elements.appleLogin].forEach(btn => {
        if (btn) btn.disabled = loading || loginState.isLocked;
    });
    
    if (elements.loginBtn && elements.loginBtnText && elements.loginSpinner) {
        if (loading) {
            elements.loginBtnText.textContent = 'Entrando...';
            elements.loginSpinner.classList.remove('hidden');
            elements.loginBtn.classList.add('opacity-75');
        } else {
            elements.loginBtnText.textContent = 'Entrar';
            elements.loginSpinner.classList.add('hidden');
            elements.loginBtn.classList.remove('opacity-75');
        }
    }
}

function showError(message) {
    if (elements.errorText) elements.errorText.textContent = message;
    if (elements.errorMessage) {
        elements.errorMessage.classList.remove('hidden');
        elements.errorMessage.setAttribute('aria-live', 'assertive');
    }
    if (elements.successMessage) elements.successMessage.classList.add('hidden');
    
    setTimeout(() => {
        if (elements.errorMessage) elements.errorMessage.classList.add('hidden');
    }, 8000);
}

function showSuccess(message) {
    if (elements.successText) elements.successText.textContent = message;
    if (elements.successMessage) {
        elements.successMessage.classList.remove('hidden');
        elements.successMessage.setAttribute('aria-live', 'polite');
    }
    if (elements.errorMessage) elements.errorMessage.classList.add('hidden');
}

function clearMessages() {
    if (elements.errorMessage) elements.errorMessage.classList.add('hidden');
    if (elements.successMessage) elements.successMessage.classList.add('hidden');
}

function getErrorMessage(error) {
    if (error.message?.includes('Invalid login credentials')) {
        return 'E-mail ou senha incorretos';
    } else if (error.message?.includes('Email not confirmed')) {
        return 'Por favor, confirme seu e-mail antes de fazer login';
    } else if (error.message?.includes('Too many requests')) {
        return 'Muitas tentativas. Tente novamente em alguns minutos';
    } else if (error.message?.includes('User not found')) {
        return 'Usuário não encontrado. Verifique seu e-mail ou crie uma conta';
    } else if (error.message?.includes('Invalid email')) {
        return 'Formato de e-mail inválido';
    }
    return 'Erro no login. Tente novamente.';
}

// ===== ANIMAÇÕES =====
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = `all ${config.animationDuration}ms cubic-bezier(.25,.8,.25,1)`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 120);
    });
}

function animateFormError() {
    if (elements.form) {
        elements.form.classList.add('shake');
        setTimeout(() => {
            elements.form.classList.remove('shake');
        }, 600);
    }
}

// ===== LOGGING E ANALYTICS =====
async function logLoginActivity(userIdOrEmail, status, errorMessage = null) {
    try {
        const logData = {
            user_identifier: userIdOrEmail,
            status,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: 'client_side', // Server deve capturar o IP real
            error_message: errorMessage
        };
        
        console.log('Login activity:', logData);
        // Implementar envio para backend/analytics
        
    } catch (error) {
        console.error('Erro ao registrar atividade:', error);
    }
}

function trackSocialLogin(provider) {
    console.log(`🔗 Login social com ${provider}`);
    // Implementar tracking de login social
}

// ===== UTILITÁRIOS AVANÇADOS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (securityTimer) clearInterval(securityTimer);
    if (offlineTimer) clearInterval(offlineTimer);
});

// ===== ESTILOS DINÂMICOS =====
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .shake {
        animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
        10%, 90% { transform: translateX(-2px); }
        20%, 80% { transform: translateX(4px); }
        30%, 50%, 70% { transform: translateX(-8px); }
        40%, 60% { transform: translateX(8px); }
    }
    .animate-on-load {
        transition: all 0.6s cubic-bezier(.25,.8,.25,1);
    }
    .field-error {
        transition: all 0.3s ease;
    }
    input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, .12);
    }
    button:hover:not(:disabled) {
        transform: translateY(-1px);
    }
    button:active:not(:disabled) {
        transform: translateY(0);
    }
    .border-green-300 { border-color: #86efac !important; }
    .border-red-300 { border-color: #fca5a5 !important; }
    .bg-grid-pattern {
        background-image: 
            linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
        background-size: 20px 20px;
    }
`;
document.head.appendChild(dynamicStyles);

console.log('✨ Login JavaScript Ultimate carregado - ALSHAM 360° PRIMA');
