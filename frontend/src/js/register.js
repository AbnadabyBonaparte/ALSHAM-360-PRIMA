// ALSHAM 360° PRIMA - Register JavaScript Ultimate 10/10
// Registro premium com melhorias em UX, segurança e internacionalização

import {
    signUpWithEmail,
    signInWithGoogle,
    signInWithMicrosoft,
    getCurrentUser,
    onAuthStateChange
} from '../lib/supabase.js'

// ===== ESTADO DA APLICAÇÃO =====
const registerState = {
    isLoading: false,
    passwordVisible: false,
    confirmPasswordVisible: false,
    formData: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
        marketingConsent: false
    },
    validation: {
        fullName: false,
        email: false,
        password: false,
        confirmPassword: false,
        terms: false
    }
};

// ===== ELEMENTOS DOM =====
const elements = {
    form: document.getElementById('register-form'),
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    registerBtn: document.getElementById('register-btn'),
    registerBtnText: document.getElementById('register-btn-text'),
    registerSpinner: document.getElementById('register-spinner'),
    togglePassword: document.getElementById('toggle-password'),
    toggleConfirmPassword: document.getElementById('toggle-confirm-password'),
    eyeOpen: document.getElementById('eye-open'),
    eyeClosed: document.getElementById('eye-closed'),
    eyeOpenConfirm: document.getElementById('eye-open-confirm'),
    eyeClosedConfirm: document.getElementById('eye-closed-confirm'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    successMessage: document.getElementById('success-message'),
    successText: document.getElementById('success-text'),
    googleRegister: document.getElementById('google-register'),
    microsoftRegister: document.getElementById('microsoft-register'),
    appleRegister: document.getElementById('apple-register'),
    termsCheckbox: document.getElementById('terms'),
    marketingCheckbox: document.getElementById('marketing'),
    strengthBars: [
        document.getElementById('strength-1'),
        document.getElementById('strength-2'),
        document.getElementById('strength-3'),
        document.getElementById('strength-4')
    ],
    strengthText: document.getElementById('strength-text'),
    progressBar: document.getElementById('form-progress'),
    stepIndicator: document.getElementById('step-indicator')
};

// ===== CONFIGURAÇÕES =====
const config = {
    passwordMinLength: 8,
    nameMinLength: 2,
    maxAttempts: 3,
    autoRedirectDelay: 3000,
    debounceDelay: 300,
    strengthColors: ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'],
    strengthTexts: ['Muito fraca', 'Fraca', 'Boa', 'Forte'],
    emailDomains: ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com.br', 'uol.com.br'],
    supportedLanguages: ['pt-BR', 'en-US', 'es-ES']
};

let attemptCount = 0;
let debounceTimers = {};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', initializeRegisterPage);

async function initializeRegisterPage() {
    console.log('📝 Register page loaded - ALSHAM 360° PRIMA Ultimate');
    
    try {
        await checkAuthStatus();
        setupEventListeners();
        setupAnimations();
        setupFormValidation();
        setupAccessibility();
        focusFirstField();
        initializeProgressTracking();
        
        // Pré-carregamento de dados se disponível
        await preloadFormData();
        
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
            }, 1500);
            return true;
        }
    } catch (error) {
        // Usuário não logado, continua fluxo normal
    }
    return false;
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    // Formulário principal
    elements.form?.addEventListener('submit', handleRegister);
    
    // Campos de entrada
    elements.fullName?.addEventListener('input', debounce(validateFullName, config.debounceDelay));
    elements.email?.addEventListener('input', debounce(validateEmail, config.debounceDelay));
    elements.password?.addEventListener('input', debounce(validatePassword, config.debounceDelay));
    elements.confirmPassword?.addEventListener('input', debounce(validateConfirmPassword, config.debounceDelay));
    
    // Visibilidade de senhas
    elements.togglePassword?.addEventListener('click', () => togglePasswordVisibility('password'));
    elements.toggleConfirmPassword?.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));
    
    // Checkboxes
    elements.termsCheckbox?.addEventListener('change', validateTerms);
    elements.marketingCheckbox?.addEventListener('change', updateMarketingConsent);
    
    // OAuth
    elements.googleRegister?.addEventListener('click', handleGoogleRegister);
    elements.microsoftRegister?.addEventListener('click', handleMicrosoftRegister);
    elements.appleRegister?.addEventListener('click', handleAppleRegister);
    
    // Teclas especiais
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Limpeza de mensagens
    [elements.fullName, elements.email, elements.password, elements.confirmPassword].forEach(input => {
        input?.addEventListener('input', clearMessages);
        input?.addEventListener('focus', handleFieldFocus);
        input?.addEventListener('blur', handleFieldBlur);
    });
    
    // Estado de autenticação
    onAuthStateChange(handleAuthStateChange);
    
    // Prevenção de spam
    setupSpamPrevention();
}

// ===== VALIDAÇÕES INDIVIDUAIS =====
function validateFullName() {
    const value = elements.fullName?.value.trim() || '';
    const isValid = value.length >= config.nameMinLength && /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
    
    registerState.validation.fullName = isValid;
    registerState.formData.fullName = value;
    
    updateFieldValidation(elements.fullName, isValid, 
        isValid ? '' : 'Nome deve ter pelo menos 2 caracteres e conter apenas letras');
    
    updateFormProgress();
    return isValid;
}

function validateEmail() {
    const value = elements.email?.value.trim() || '';
    const isValid = isValidEmail(value);
    
    registerState.validation.email = isValid;
    registerState.formData.email = value;
    
    updateFieldValidation(elements.email, isValid, 
        isValid ? '' : 'Por favor, insira um e-mail válido');
    
    // Sugestão de domínios
    if (value.includes('@') && !isValid) {
        showEmailSuggestion(value);
    }
    
    updateFormProgress();
    return isValid;
}

function validatePassword() {
    const value = elements.password?.value || '';
    const strength = getPasswordStrength(value);
    const isValid = strength >= 3;
    
    registerState.validation.password = isValid;
    registerState.formData.password = value;
    
    updatePasswordStrength(value, strength);
    updateFieldValidation(elements.password, isValid, 
        isValid ? '' : 'Senha deve ser mais forte (use letras, números e símbolos)');
    
    // Revalidar confirmação se já preenchida
    if (elements.confirmPassword?.value) {
        validateConfirmPassword();
    }
    
    updateFormProgress();
    return isValid;
}

function validateConfirmPassword() {
    const password = elements.password?.value || '';
    const confirmPassword = elements.confirmPassword?.value || '';
    const isValid = password === confirmPassword && password.length > 0;
    
    registerState.validation.confirmPassword = isValid;
    registerState.formData.confirmPassword = confirmPassword;
    
    updateFieldValidation(elements.confirmPassword, isValid, 
        isValid ? '' : 'As senhas não coincidem');
    
    updateFormProgress();
    return isValid;
}

function validateTerms() {
    const isValid = elements.termsCheckbox?.checked || false;
    registerState.validation.terms = isValid;
    registerState.formData.acceptedTerms = isValid;
    
    updateFormProgress();
    return isValid;
}

function updateMarketingConsent() {
    registerState.formData.marketingConsent = elements.marketingCheckbox?.checked || false;
}

// ===== HANDLERS PRINCIPAIS =====
async function handleRegister(e) {
    e.preventDefault();
    
    if (registerState.isLoading) return;
    if (attemptCount >= config.maxAttempts) {
        showError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        return;
    }
    
    // Validação final
    const isFormValid = validateForm();
    if (!isFormValid) {
        attemptCount++;
        animateFormError();
        return;
    }
    
    try {
        setLoading(true);
        clearMessages();
        
        console.log('Iniciando registro:', registerState.formData.email);
        
        const result = await signUpWithEmail(
            registerState.formData.email,
            registerState.formData.password,
            {
                fullName: registerState.formData.fullName,
                marketingConsent: registerState.formData.marketingConsent,
                language: navigator.language || 'pt-BR',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            }
        );
        
        if (result.user) {
            showSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
            resetForm();
            
            // Analytics
            trackRegistrationSuccess();
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, config.autoRedirectDelay);
        } else {
            throw new Error(result.error?.message || 'Erro desconhecido ao criar conta');
        }
        
    } catch (error) {
        attemptCount++;
        handleRegistrationError(error);
        animateFormError();
    } finally {
        setLoading(false);
    }
}

async function handleGoogleRegister() {
    if (registerState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        console.log('Iniciando registro com Google...');
        
        await signInWithGoogle();
        showSuccess('Redirecionando para Google...');
        trackSocialRegistration('google');
        
    } catch (error) {
        showError('Erro ao conectar com Google. Tente novamente.');
        setLoading(false);
    }
}

async function handleMicrosoftRegister() {
    if (registerState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        console.log('Iniciando registro com Microsoft...');
        
        await signInWithMicrosoft();
        showSuccess('Redirecionando para Microsoft...');
        trackSocialRegistration('microsoft');
        
    } catch (error) {
        showError('Erro ao conectar com Microsoft. Tente novamente.');
        setLoading(false);
    }
}

async function handleAppleRegister() {
    if (registerState.isLoading) return;
    
    try {
        setLoading(true);
        clearMessages();
        showSuccess('Login com Apple em desenvolvimento...');
        trackSocialRegistration('apple');
        
    } catch (error) {
        showError('Erro ao conectar com Apple. Tente novamente.');
    } finally {
        setLoading(false);
    }
}

function handleAuthStateChange(event, session, profile) {
    if (event === 'SIGNED_IN' && session?.user) {
        showSuccess('Registro realizado com sucesso!');
        trackRegistrationSuccess();
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

// ===== FORÇA DA SENHA =====
function updatePasswordStrength(password, strength) {
    // Reset todas as barras
    elements.strengthBars.forEach(bar => {
        if (bar) bar.className = 'h-1 w-1/4 bg-gray-200 rounded transition-all duration-300';
    });
    
    // Preencher barras baseado na força
    for (let i = 0; i < strength; i++) {
        if (elements.strengthBars[i]) {
            elements.strengthBars[i].className = `h-1 w-1/4 ${config.strengthColors[strength - 1]} rounded transition-all duration-300`;
        }
    }
    
    // Atualizar texto
    if (elements.strengthText) {
        if (password.length === 0) {
            elements.strengthText.textContent = 'Mínimo 8 caracteres (use letras, números e símbolos)';
            elements.strengthText.className = 'text-xs text-gray-500 mt-1 transition-colors duration-300';
        } else {
            elements.strengthText.textContent = config.strengthTexts[strength - 1] || 'Muito fraca';
            elements.strengthText.className = `text-xs mt-1 transition-colors duration-300 ${
                strength >= 3 ? 'text-green-600' : 
                strength >= 2 ? 'text-yellow-600' : 'text-red-600'
            }`;
        }
    }
}

function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= config.passwordMinLength) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
}

// ===== VALIDAÇÃO DE FORMULÁRIO =====
function validateForm() {
    const validations = [
        { fn: validateFullName, field: 'fullName' },
        { fn: validateEmail, field: 'email' },
        { fn: validatePassword, field: 'password' },
        { fn: validateConfirmPassword, field: 'confirmPassword' },
        { fn: validateTerms, field: 'terms' }
    ];
    
    let isValid = true;
    let firstInvalidField = null;
    
    validations.forEach(({ fn, field }) => {
        const fieldValid = fn();
        if (!fieldValid && !firstInvalidField) {
            firstInvalidField = elements[field];
        }
        isValid = isValid && fieldValid;
    });
    
    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        showError('Por favor, corrija os campos destacados');
    }
    
    return isValid;
}

function updateFieldValidation(field, isValid, errorMessage) {
    if (!field) return;
    
    // Reset classes
    field.classList.remove('border-red-300', 'border-green-300', 'ring-red-500', 'ring-green-500');
    
    // Aplicar estilo baseado na validação
    if (field.value.trim() !== '') {
        if (isValid) {
            field.classList.add('border-green-300');
        } else {
            field.classList.add('border-red-300');
        }
    }
    
    // Mostrar/esconder mensagem de erro
    const errorElement = field.parentElement?.querySelector('.field-error');
    if (errorElement) {
        if (!isValid && errorMessage) {
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        } else {
            errorElement.classList.add('hidden');
        }
    }
}

// ===== PROGRESSO DO FORMULÁRIO =====
function initializeProgressTracking() {
    updateFormProgress();
}

function updateFormProgress() {
    const validFields = Object.values(registerState.validation).filter(Boolean).length;
    const totalFields = Object.keys(registerState.validation).length;
    const progress = (validFields / totalFields) * 100;
    
    if (elements.progressBar) {
        elements.progressBar.style.width = `${progress}%`;
        elements.progressBar.className = `h-1 transition-all duration-500 rounded-full ${
            progress < 25 ? 'bg-red-400' :
            progress < 50 ? 'bg-orange-400' :
            progress < 75 ? 'bg-yellow-400' : 'bg-green-400'
        }`;
    }
    
    if (elements.stepIndicator) {
        elements.stepIndicator.textContent = `${validFields}/${totalFields} campos completos`;
    }
}

// ===== UTILITÁRIOS =====
function togglePasswordVisibility(type) {
    if (type === 'password') {
        registerState.passwordVisible = !registerState.passwordVisible;
        if (elements.password) {
            elements.password.type = registerState.passwordVisible ? 'text' : 'password';
        }
        if (elements.eyeOpen) elements.eyeOpen.classList.toggle('hidden', !registerState.passwordVisible);
        if (elements.eyeClosed) elements.eyeClosed.classList.toggle('hidden', registerState.passwordVisible);
    } else if (type === 'confirmPassword') {
        registerState.confirmPasswordVisible = !registerState.confirmPasswordVisible;
        if (elements.confirmPassword) {
            elements.confirmPassword.type = registerState.confirmPasswordVisible ? 'text' : 'password';
        }
        if (elements.eyeOpenConfirm) elements.eyeOpenConfirm.classList.toggle('hidden', !registerState.confirmPasswordVisible);
        if (elements.eyeClosedConfirm) elements.eyeClosedConfirm.classList.toggle('hidden', registerState.confirmPasswordVisible);
    }
}

function setLoading(loading) {
    registerState.isLoading = loading;
    
    [elements.registerBtn, elements.googleRegister, elements.microsoftRegister, elements.appleRegister].forEach(btn => {
        if (btn) btn.disabled = loading;
    });
    
    if (elements.registerBtn) {
        if (loading) {
            elements.registerBtnText.textContent = 'Criando conta...';
            elements.registerSpinner?.classList.remove('hidden');
            elements.registerBtn.classList.add('opacity-75');
        } else {
            elements.registerBtnText.textContent = 'Criar Conta';
            elements.registerSpinner?.classList.add('hidden');
            elements.registerBtn.classList.remove('opacity-75');
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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

function showEmailSuggestion(email) {
    const [localPart, domain] = email.split('@');
    const suggestion = config.emailDomains.find(d => d.startsWith(domain));
    
    if (suggestion && domain !== suggestion) {
        const suggestionElement = document.getElementById('email-suggestion');
        if (suggestionElement) {
            suggestionElement.textContent = `Você quis dizer ${localPart}@${suggestion}?`;
            suggestionElement.classList.remove('hidden');
            suggestionElement.onclick = () => {
                elements.email.value = `${localPart}@${suggestion}`;
                validateEmail();
                suggestionElement.classList.add('hidden');
            };
        }
    }
}

function resetForm() {
    elements.form?.reset();
    Object.keys(registerState.validation).forEach(key => {
        registerState.validation[key] = false;
    });
    Object.keys(registerState.formData).forEach(key => {
        registerState.formData[key] = '';
    });
    updateFormProgress();
    resetPasswordStrength();
}

function resetPasswordStrength() {
    elements.strengthBars.forEach(bar => {
        if (bar) bar.className = 'h-1 w-1/4 bg-gray-200 rounded transition-all duration-300';
    });
    if (elements.strengthText) {
        elements.strengthText.textContent = 'Mínimo 8 caracteres (use letras, números e símbolos)';
        elements.strengthText.className = 'text-xs text-gray-500 mt-1 transition-colors duration-300';
    }
}

// ===== ACESSIBILIDADE E UX =====
function setupAccessibility() {
    // Anúncio de erros para screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'accessibility-announcer';
    document.body.appendChild(announcer);
}

function focusFirstField() {
    setTimeout(() => {
        if (elements.fullName && !elements.fullName.value) {
            elements.fullName.focus();
        }
    }, 300);
}

function handleFieldFocus(e) {
    e.target.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
}

function handleFieldBlur(e) {
    e.target.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
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

// ===== ANIMAÇÕES E FEEDBACK VISUAL =====
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-load');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(.25,.8,.25,1)';
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

// ===== TRATAMENTO DE ERROS =====
function handleRegistrationError(error) {
    let errorMsg = 'Erro ao criar conta. Tente novamente.';
    
    if (error.message?.includes('User already registered')) {
        errorMsg = 'Este e-mail já está cadastrado. Tente fazer login.';
    } else if (error.message?.includes('Password should be at least')) {
        errorMsg = 'A senha não atende aos requisitos mínimos.';
    } else if (error.message?.includes('Invalid email')) {
        errorMsg = 'E-mail inválido.';
    } else if (error.message?.includes('Signup is disabled')) {
        errorMsg = 'Registro temporariamente desabilitado. Tente novamente mais tarde.';
    } else if (error.message?.includes('Too many requests')) {
        errorMsg = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }
    
    showError(errorMsg);
    console.error('Erro no registro:', error);
}

// ===== PREVENÇÃO DE SPAM =====
function setupSpamPrevention() {
    let formSubmissions = 0;
    const maxSubmissions = 3;
    const timeWindow = 60000; // 1 minuto
    
    elements.form?.addEventListener('submit', () => {
        formSubmissions++;
        if (formSubmissions > maxSubmissions) {
            showError('Muitas tentativas. Aguarde um minuto antes de tentar novamente.');
            return false;
        }
        
        setTimeout(() => {
            formSubmissions = Math.max(0, formSubmissions - 1);
        }, timeWindow);
    });
}

// ===== UTILITÁRIOS AVANÇADOS =====
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(debounceTimers[func.name]);
            func(...args);
        };
        clearTimeout(debounceTimers[func.name]);
        debounceTimers[func.name] = setTimeout(later, wait);
    };
}

async function preloadFormData() {
    // Carregar dados salvos localmente (se permitido)
    try {
        const savedData = localStorage.getItem('alsham-register-draft');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (elements.fullName && parsedData.fullName) {
                elements.fullName.value = parsedData.fullName;
                validateFullName();
            }
            if (elements.email && parsedData.email) {
                elements.email.value = parsedData.email;
                validateEmail();
            }
        }
    } catch (error) {
        console.warn('Erro ao carregar dados salvos:', error);
    }
}

// ===== ANALYTICS E TRACKING =====
function trackRegistrationSuccess() {
    console.log('✅ Registro realizado com sucesso');
    // Implementar analytics (Google Analytics, Mixpanel, etc.)
}

function trackSocialRegistration(provider) {
    console.log(`🔗 Registro social com ${provider}`);
    // Implementar tracking de registro social
}

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
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;
document.head.appendChild(dynamicStyles);

console.log('✨ Register JavaScript Ultimate carregado - ALSHAM 360° PRIMA');
