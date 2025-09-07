// ALSHAM 360° PRIMA - Login JavaScript
// Sistema de autenticação premium com Supabase

import { 
    signInWithEmail, 
    signInWithGoogle, 
    signInWithMicrosoft,
    getCurrentUser,
    onAuthStateChange
} from '../lib/supabase.js'

// Elementos DOM
const loginForm = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('login-btn')
const loginBtnText = document.getElementById('login-btn-text')
const loginSpinner = document.getElementById('login-spinner')
const togglePasswordBtn = document.getElementById('toggle-password')
const eyeOpen = document.getElementById('eye-open')
const eyeClosed = document.getElementById('eye-closed')
const errorMessage = document.getElementById('error-message')
const errorText = document.getElementById('error-text')
const successMessage = document.getElementById('success-message')
const successText = document.getElementById('success-text')
const googleLoginBtn = document.getElementById('google-login')
const microsoftLoginBtn = document.getElementById('microsoft-login')

// Estado da aplicação
let isLoading = false

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    checkAuthStatus()
    
    // Configurar listeners
    setupEventListeners()
    
    // Configurar animações de entrada
    setupAnimations()
    
    // Verificar parâmetros da URL (OAuth callback)
    handleOAuthCallback()
})

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
async function checkAuthStatus() {
    try {
        const { user, profile } = await getCurrentUser()
        
        if (user && profile) {
            showSuccess('Você já está logado! Redirecionando...')
            
            setTimeout(() => {
                window.location.href = '/index.html'
            }, 1500)
        }
    } catch (error) {
        // Usuário não logado - não faz nada
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form de login
    loginForm.addEventListener('submit', handleLogin)
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility)
    
    // OAuth buttons
    googleLoginBtn.addEventListener('click', handleGoogleLogin)
    microsoftLoginBtn.addEventListener('click', handleMicrosoftLogin)
    
    // Enter key nos inputs
    emailInput.addEventListener('keypress', handleEnterKey)
    passwordInput.addEventListener('keypress', handleEnterKey)
    
    // Limpar mensagens de erro ao digitar
    emailInput.addEventListener('input', clearMessages)
    passwordInput.addEventListener('input', clearMessages)
    
    // Auth state listener
    onAuthStateChange(handleAuthStateChange)
}

// ===== HANDLERS =====
async function handleLogin(e) {
    e.preventDefault()
    
    if (isLoading) return
    
    const email = emailInput.value.trim()
    const password = passwordInput.value
    
    // Validação básica
    if (!email || !password) {
        showError('Por favor, preencha todos os campos')
        return
    }
    
    if (!isValidEmail(email)) {
        showError('Por favor, insira um e-mail válido')
        return
    }
    
    if (password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres')
        return
    }
    
    try {
        setLoading(true)
        clearMessages()
        
        const result = await signInWithEmail(email, password)
        
        if (result.user) {
            showSuccess('Login realizado com sucesso! Redirecionando...')
            
            // Salvar preferências
            if (document.getElementById('remember').checked) {
                localStorage.setItem('alsham_remember_email', email)
            }
            
            // Redirecionar após sucesso
            setTimeout(() => {
                window.location.href = '/index.html'
            }, 1500)
        }
        
    } catch (error) {
        let errorMsg = 'Erro no login. Tente novamente.'
        
        if (error.message && error.message.includes('Invalid login credentials')) {
            errorMsg = 'E-mail ou senha incorretos'
        } else if (error.message && error.message.includes('Email not confirmed')) {
            errorMsg = 'Por favor, confirme seu e-mail antes de fazer login'
        } else if (error.message && error.message.includes('Too many requests')) {
            errorMsg = 'Muitas tentativas. Tente novamente em alguns minutos'
        }
        
        showError(errorMsg)
        
        // Shake animation no erro
        loginForm.classList.add('shake')
        setTimeout(() => loginForm.classList.remove('shake'), 500)
        
    } finally {
        setLoading(false)
    }
}

async function handleGoogleLogin() {
    if (isLoading) return
    
    try {
        setLoading(true)
        clearMessages()
        await signInWithGoogle()
        showSuccess('Redirecionando para Google...')
    } catch (error) {
        showError('Erro ao conectar com Google. Tente novamente.')
        setLoading(false)
    }
}

async function handleMicrosoftLogin() {
    if (isLoading) return
    
    try {
        setLoading(true)
        clearMessages()
        await signInWithMicrosoft()
        showSuccess('Redirecionando para Microsoft...')
    } catch (error) {
        showError('Erro ao conectar com Microsoft. Tente novamente.')
        setLoading(false)
    }
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !isLoading) {
        loginForm.dispatchEvent(new Event('submit'))
    }
}

function handleAuthStateChange(event, session, profile) {
    if (event === 'SIGNED_IN' && session?.user) {
        showSuccess('Login realizado com sucesso!')
        setTimeout(() => {
            window.location.href = '/index.html'
        }, 1000)
    }
}

// ===== OAUTH CALLBACK =====
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    if (error) {
        showError('Erro na autenticação. Tente novamente.')
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname)
    }
}

// ===== UTILITÁRIOS =====
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password'
    passwordInput.type = isPassword ? 'text' : 'password'
    eyeOpen.classList.toggle('hidden', !isPassword)
    eyeClosed.classList.toggle('hidden', isPassword)
}

function setLoading(loading) {
    isLoading = loading
    
    loginBtn.disabled = loading
    googleLoginBtn.disabled = loading
    microsoftLoginBtn.disabled = loading
    
    if (loading) {
        loginBtnText.textContent = 'Entrando...'
        loginSpinner.classList.remove('hidden')
        loginBtn.classList.add('opacity-75')
    } else {
        loginBtnText.textContent = 'Entrar'
        loginSpinner.classList.add('hidden')
        loginBtn.classList.remove('opacity-75')
    }
}

function showError(message) {
    errorText.textContent = message
    errorMessage.classList.remove('hidden')
    successMessage.classList.add('hidden')
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        errorMessage.classList.add('hidden')
    }, 5000)
}

function showSuccess(message) {
    successText.textContent = message
    successMessage.classList.remove('hidden')
    errorMessage.classList.add('hidden')
}

function clearMessages() {
    errorMessage.classList.add('hidden')
    successMessage.classList.add('hidden')
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// ===== ANIMAÇÕES =====
function setupAnimations() {
    // Animar entrada dos elementos
    const elements = document.querySelectorAll('.bg-white, .bg-gradient-premium')
    elements.forEach((element, index) => {
        element.style.opacity = '0'
        element.style.transform = 'translateY(20px)'
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out'
            element.style.opacity = '1'
            element.style.transform = 'translateY(0)'
        }, index * 100)
    })
    
    // Carregar email salvo
    const savedEmail = localStorage.getItem('alsham_remember_email')
    if (savedEmail) {
        emailInput.value = savedEmail
        document.getElementById('remember').checked = true
    }
}

// ===== CSS ADICIONAL =====
const style = document.createElement('style')
style.textContent = `
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .bg-grid-pattern {
        background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    button:hover {
        transform: translateY(-1px);
    }
    button:active {
        transform: translateY(0);
    }
`
document.head.appendChild(style)
