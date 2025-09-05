// ALSHAM 360° PRIMA - Register JavaScript
// Sistema de registro premium com Supabase

import { 
    signUpWithEmail, 
    signInWithGoogle, 
    signInWithMicrosoft,
    getCurrentUser,
    onAuthStateChange
} from '../lib/supabase.js'

// Elementos DOM
const registerForm = document.getElementById('register-form')
const fullNameInput = document.getElementById('fullName')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const confirmPasswordInput = document.getElementById('confirmPassword')
const registerBtn = document.getElementById('register-btn')
const registerBtnText = document.getElementById('register-btn-text')
const registerSpinner = document.getElementById('register-spinner')
const togglePasswordBtn = document.getElementById('toggle-password')
const eyeOpen = document.getElementById('eye-open')
const eyeClosed = document.getElementById('eye-closed')
const errorMessage = document.getElementById('error-message')
const errorText = document.getElementById('error-text')
const successMessage = document.getElementById('success-message')
const successText = document.getElementById('success-text')
const googleRegisterBtn = document.getElementById('google-register')
const microsoftRegisterBtn = document.getElementById('microsoft-register')
const termsCheckbox = document.getElementById('terms')
const marketingCheckbox = document.getElementById('marketing')

// Password strength elements
const strengthBars = [
    document.getElementById('strength-1'),
    document.getElementById('strength-2'),
    document.getElementById('strength-3'),
    document.getElementById('strength-4')
]
const strengthText = document.getElementById('strength-text')

// Estado da aplicação
let isLoading = false

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Register page loaded - ALSHAM 360° PRIMA')
    
    // Verificar se já está logado
    checkAuthStatus()
    
    // Configurar listeners
    setupEventListeners()
    
    // Configurar animações de entrada
    setupAnimations()
})

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
async function checkAuthStatus() {
    try {
        const { user, profile } = await getCurrentUser()
        
        if (user && profile) {
            console.log('Usuário já logado, redirecionando...')
            showSuccess('Você já está logado! Redirecionando...')
            
            setTimeout(() => {
                window.location.href = '/index.html'
            }, 1500)
        }
    } catch (error) {
        console.log('Usuário não logado')
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form de registro
    registerForm.addEventListener('submit', handleRegister)
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility)
    
    // Password strength checker
    passwordInput.addEventListener('input', checkPasswordStrength)
    
    // Confirm password validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch)
    
    // OAuth buttons
    googleRegisterBtn.addEventListener('click', handleGoogleRegister)
    microsoftRegisterBtn.addEventListener('click', handleMicrosoftRegister)
    
    // Enter key nos inputs
    fullNameInput.addEventListener('keypress', handleEnterKey)
    emailInput.addEventListener('keypress', handleEnterKey)
    passwordInput.addEventListener('keypress', handleEnterKey)
    confirmPasswordInput.addEventListener('keypress', handleEnterKey)
    
    // Limpar mensagens de erro ao digitar
    fullNameInput.addEventListener('input', clearMessages)
    emailInput.addEventListener('input', clearMessages)
    passwordInput.addEventListener('input', clearMessages)
    confirmPasswordInput.addEventListener('input', clearMessages)
    
    // Auth state listener
    onAuthStateChange(handleAuthStateChange)
}

// ===== HANDLERS =====
async function handleRegister(e) {
    e.preventDefault()
    
    if (isLoading) return
    
    const fullName = fullNameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    const acceptedTerms = termsCheckbox.checked
    const marketingConsent = marketingCheckbox.checked
    
    // Validação básica
    if (!fullName || !email || !password || !confirmPassword) {
        showError('Por favor, preencha todos os campos obrigatórios')
        return
    }
    
    if (fullName.length < 2) {
        showError('Nome deve ter pelo menos 2 caracteres')
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
    
    if (password !== confirmPassword) {
        showError('As senhas não coincidem')
        return
    }
    
    if (!acceptedTerms) {
        showError('Você deve aceitar os Termos de Uso e Política de Privacidade')
        return
    }
    
    const passwordStrength = getPasswordStrength(password)
    if (passwordStrength < 2) {
        showError('Por favor, use uma senha mais forte')
        return
    }
    
    try {
        setLoading(true)
        clearMessages()
        
        console.log('Tentando registro com:', email)
        
        const result = await signUpWithEmail(email, password, {
            fullName,
            marketingConsent
        })
        
        if (result.user) {
            showSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar.')
            
            // Limpar formulário
            registerForm.reset()
            resetPasswordStrength()
            
            // Redirecionar após alguns segundos
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 3000)
        }
        
    } catch (error) {
        console.error('Erro no registro:', error)
        
        let errorMsg = 'Erro ao criar conta. Tente novamente.'
        
        if (error.message.includes('User already registered')) {
            errorMsg = 'Este e-mail já está cadastrado. Tente fazer login.'
        } else if (error.message.includes('Password should be at least 6 characters')) {
            errorMsg = 'A senha deve ter pelo menos 6 caracteres'
        } else if (error.message.includes('Invalid email')) {
            errorMsg = 'E-mail inválido'
        } else if (error.message.includes('Signup is disabled')) {
            errorMsg = 'Registro temporariamente desabilitado. Tente novamente mais tarde.'
        }
        
        showError(errorMsg)
        
        // Shake animation no erro
        registerForm.classList.add('shake')
        setTimeout(() => registerForm.classList.remove('shake'), 500)
        
    } finally {
        setLoading(false)
    }
}

async function handleGoogleRegister() {
    if (isLoading) return
    
    try {
        setLoading(true)
        clearMessages()
        
        console.log('Iniciando registro com Google...')
        await signInWithGoogle()
        
        // O redirecionamento será feito pelo OAuth
        showSuccess('Redirecionando para Google...')
        
    } catch (error) {
        console.error('Erro no registro com Google:', error)
        showError('Erro ao conectar com Google. Tente novamente.')
        setLoading(false)
    }
}

async function handleMicrosoftRegister() {
    if (isLoading) return
    
    try {
        setLoading(true)
        clearMessages()
        
        console.log('Iniciando registro com Microsoft...')
        await signInWithMicrosoft()
        
        // O redirecionamento será feito pelo OAuth
        showSuccess('Redirecionando para Microsoft...')
        
    } catch (error) {
        console.error('Erro no registro com Microsoft:', error)
        showError('Erro ao conectar com Microsoft. Tente novamente.')
        setLoading(false)
    }
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !isLoading) {
        registerForm.dispatchEvent(new Event('submit'))
    }
}

function handleAuthStateChange(event, session, profile) {
    console.log('Auth state changed:', event)
    
    if (event === 'SIGNED_IN' && session?.user) {
        console.log('Usuário registrado:', session.user.email)
        showSuccess('Registro realizado com sucesso!')
        
        setTimeout(() => {
            window.location.href = '/index.html'
        }, 1000)
    }
}

// ===== VALIDAÇÕES =====
function checkPasswordStrength() {
    const password = passwordInput.value
    const strength = getPasswordStrength(password)
    
    // Reset all bars
    strengthBars.forEach(bar => {
        bar.className = 'h-1 w-1/4 bg-gray-200 rounded'
    })
    
    // Update strength bars
    const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400']
    const texts = [
        'Muito fraca',
        'Fraca', 
        'Boa',
        'Forte'
    ]
    
    for (let i = 0; i < strength; i++) {
        strengthBars[i].className = `h-1 w-1/4 ${colors[strength - 1]} rounded`
    }
    
    if (password.length === 0) {
        strengthText.textContent = 'Mínimo 6 caracteres'
        strengthText.className = 'text-xs text-gray-500 mt-1'
    } else {
        strengthText.textContent = texts[strength - 1] || 'Muito fraca'
        strengthText.className = `text-xs mt-1 ${strength >= 3 ? 'text-green-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-600'}`
    }
}

function getPasswordStrength(password) {
    let strength = 0
    
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
    if (/\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    return strength
}

function validatePasswordMatch() {
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmPasswordInput.classList.remove('border-red-300')
            confirmPasswordInput.classList.add('border-green-300')
        } else {
            confirmPasswordInput.classList.remove('border-green-300')
            confirmPasswordInput.classList.add('border-red-300')
        }
    } else {
        confirmPasswordInput.classList.remove('border-red-300', 'border-green-300')
    }
}

function resetPasswordStrength() {
    strengthBars.forEach(bar => {
        bar.className = 'h-1 w-1/4 bg-gray-200 rounded'
    })
    strengthText.textContent = 'Mínimo 6 caracteres'
    strengthText.className = 'text-xs text-gray-500 mt-1'
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
    
    registerBtn.disabled = loading
    googleRegisterBtn.disabled = loading
    microsoftRegisterBtn.disabled = loading
    
    if (loading) {
        registerBtnText.textContent = 'Criando conta...'
        registerSpinner.classList.remove('hidden')
        registerBtn.classList.add('opacity-75')
    } else {
        registerBtnText.textContent = 'Criar Conta'
        registerSpinner.classList.add('hidden')
        registerBtn.classList.remove('opacity-75')
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
    
    .border-green-300 {
        border-color: #86efac;
    }
    
    .border-red-300 {
        border-color: #fca5a5;
    }
`
document.head.appendChild(style)

console.log('✨ Register JavaScript carregado - ALSHAM 360° PRIMA')

