// ALSHAM 360° PRIMA - Register JavaScript (Obra-Prima 10/10)
// Registro premium, seguro, acessível e conectado ao Supabase real

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
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Register page loaded - ALSHAM 360° PRIMA')
    checkAuthStatus()
    setupEventListeners()
    setupAnimations()
    focusFirstField()
})

// ===== ACESSIBILIDADE: foco no primeiro campo =====
function focusFirstField() {
    setTimeout(() => {
        if (fullNameInput) fullNameInput.focus()
    }, 300)
}

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
        // Usuário não logado, segue fluxo normal
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    registerForm.addEventListener('submit', handleRegister)
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility)
    passwordInput.addEventListener('input', checkPasswordStrength)
    confirmPasswordInput.addEventListener('input', validatePasswordMatch)
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('keypress', handleEnterKey)
        input.addEventListener('input', clearMessages)
    })
    googleRegisterBtn.addEventListener('click', handleGoogleRegister)
    microsoftRegisterBtn.addEventListener('click', handleMicrosoftRegister)
    onAuthStateChange(handleAuthStateChange)
}

// ===== HANDLERS PRINCIPAIS =====
async function handleRegister(e) {
    e.preventDefault()
    if (isLoading) return

    // Coleta dados
    const fullName = fullNameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    const acceptedTerms = termsCheckbox.checked
    const marketingConsent = marketingCheckbox.checked

    // ===== Validações fortíssimas =====
    if (!fullName || !email || !password || !confirmPassword) {
        showError('Por favor, preencha todos os campos obrigatórios')
        return
    }
    if (fullName.length < 2) {
        showError('Nome deve ter pelo menos 2 caracteres')
        fullNameInput.focus()
        return
    }
    if (!isValidEmail(email)) {
        showError('Por favor, insira um e-mail válido')
        emailInput.focus()
        return
    }
    if (password.length < 8) {
        showError('A senha deve ter no mínimo 8 caracteres')
        passwordInput.focus()
        return
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        showError('A senha deve conter letras maiúsculas e minúsculas')
        passwordInput.focus()
        return
    }
    if (!/\d/.test(password)) {
        showError('A senha deve conter pelo menos um número')
        passwordInput.focus()
        return
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showError('Inclua pelo menos um símbolo na sua senha')
        passwordInput.focus()
        return
    }
    if (password !== confirmPassword) {
        showError('As senhas não coincidem')
        confirmPasswordInput.focus()
        return
    }
    if (!acceptedTerms) {
        showError('Você deve aceitar os Termos de Uso e Política de Privacidade')
        termsCheckbox.focus()
        return
    }

    // Segurança extra: força de senha visual
    const passwordStrength = getPasswordStrength(password)
    if (passwordStrength < 3) {
        showError('Sua senha deve ser mais forte (use letras, números e símbolos)')
        passwordInput.focus()
        return
    }

    // ===== Registro real no Supabase =====
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
            registerForm.reset()
            resetPasswordStrength()
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 3000)
        } else {
            throw new Error(result.error?.message || 'Erro desconhecido ao criar conta')
        }
    } catch (error) {
        let errorMsg = 'Erro ao criar conta. Tente novamente.'
        if (error.message?.includes('User already registered')) {
            errorMsg = 'Este e-mail já está cadastrado. Tente fazer login.'
        } else if (error.message?.includes('Password should be at least')) {
            errorMsg = 'A senha não atende aos requisitos mínimos.'
        } else if (error.message?.includes('Invalid email')) {
            errorMsg = 'E-mail inválido'
        } else if (error.message?.includes('Signup is disabled')) {
            errorMsg = 'Registro temporariamente desabilitado. Tente novamente mais tarde.'
        }
        showError(errorMsg)
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
        showSuccess('Redirecionando para Google...')
    } catch (error) {
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
        showSuccess('Redirecionando para Microsoft...')
    } catch (error) {
        showError('Erro ao conectar com Microsoft. Tente novamente.')
        setLoading(false)
    }
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !isLoading) {
        e.preventDefault()
        registerForm.dispatchEvent(new Event('submit'))
    }
}

function handleAuthStateChange(event, session, profile) {
    if (event === 'SIGNED_IN' && session?.user) {
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
    strengthBars.forEach(bar => bar.className = 'h-1 w-1/4 bg-gray-200 rounded')
    const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400']
    const texts = ['Muito fraca', 'Fraca', 'Boa', 'Forte']
    for (let i = 0; i < strength; i++) {
        strengthBars[i].className = `h-1 w-1/4 ${colors[strength - 1]} rounded`
    }
    if (password.length === 0) {
        strengthText.textContent = 'Mínimo 8 caracteres (use letras, números e símbolos)'
        strengthText.className = 'text-xs text-gray-500 mt-1'
    } else {
        strengthText.textContent = texts[strength - 1] || 'Muito fraca'
        strengthText.className = `text-xs mt-1 ${strength >= 3 ? 'text-green-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-600'}`
    }
}

function getPasswordStrength(password) {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
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
    strengthBars.forEach(bar => bar.className = 'h-1 w-1/4 bg-gray-200 rounded')
    strengthText.textContent = 'Mínimo 8 caracteres (use letras, números e símbolos)'
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
    errorMessage.setAttribute('aria-live', 'assertive')
    successMessage.classList.add('hidden')
    setTimeout(() => {
        errorMessage.classList.add('hidden')
    }, 8000)
}

function showSuccess(message) {
    successText.textContent = message
    successMessage.classList.remove('hidden')
    successMessage.setAttribute('aria-live', 'polite')
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
    const elements = document.querySelectorAll('.bg-white, .bg-gradient-premium')
    elements.forEach((element, index) => {
        element.style.opacity = '0'
        element.style.transform = 'translateY(20px)'
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(.25,.8,.25,1)'
            element.style.opacity = '1'
            element.style.transform = 'translateY(0)'
        }, index * 120)
    })
}

// ===== CSS ADICIONAL =====
const style = document.createElement('style')
style.textContent = `
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
        10%, 90% { transform: translateX(-2px);}
        20%, 80% { transform: translateX(4px);}
        30%, 50%, 70% { transform: translateX(-8px);}
        40%, 60% { transform: translateX(8px);}
    }
    .bg-grid-pattern {
        background-image:
            linear-gradient(rgba(59,130,246,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.08) 1px, transparent 1px);
        background-size: 20px 20px;
    }
    input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, .12);
    }
    button:hover {
        transform: translateY(-1px);
    }
    button:active {
        transform: translateY(0);
    }
    .border-green-300 { border-color: #86efac; }
    .border-red-300 { border-color: #fca5a5; }
`
document.head.appendChild(style)

console.log('✨ Register JavaScript carregado (Obra-Prima) - ALSHAM 360° PRIMA')
