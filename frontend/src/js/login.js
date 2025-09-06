import { supabase } from '../lib/supabase.js'

// Elementos
const form = document.getElementById('login-form')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const rememberInput = document.getElementById('remember')
const loginBtn = document.getElementById('login-btn')
const loginBtnText = document.getElementById('login-btn-text')
const spinner = document.getElementById('login-spinner')
const errorMsg = document.getElementById('error-message')
const errorText = document.getElementById('error-text')
const successMsg = document.getElementById('success-message')

// Toggle senha
const togglePassword = document.getElementById('toggle-password')
const eyeOpen = document.getElementById('eye-open')
const eyeClosed = document.getElementById('eye-closed')

togglePassword?.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        eyeOpen.classList.add('hidden')
        eyeClosed.classList.remove('hidden')
    } else {
        passwordInput.type = 'password'
        eyeOpen.classList.remove('hidden')
        eyeClosed.classList.add('hidden')
    }
})

// Submit login
form?.addEventListener('submit', async e => {
    e.preventDefault()
    errorMsg.classList.add('hidden')
    successMsg.classList.add('hidden')
    loginBtn.disabled = true
    spinner.classList.remove('hidden')
    loginBtnText.classList.add('opacity-60')

    try {
        const email = emailInput.value.trim()
        const password = passwordInput.value

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { 
                // session persistence: "local" se lembrar, "session" se não
                // (o supabase-js 2.x já faz isso automático, mas pode customizar)
                shouldCreateUser: false 
            }
        })

        if (error || !data.session) {
            throw error || new Error("Falha ao autenticar.")
        }

        // Sucesso
        successMsg.classList.remove('hidden')
        setTimeout(() => {
            window.location.href = 'dashboard.html'
        }, 900)

    } catch (err) {
        errorText.textContent = err.message || 'E-mail ou senha inválidos.'
        errorMsg.classList.remove('hidden')
    } finally {
        loginBtn.disabled = false
        spinner.classList.add('hidden')
        loginBtnText.classList.remove('opacity-60')
    }
})

// OAuth
async function socialLogin(provider) {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/app/pages/dashboard.html` }
        })
        if (error) throw error
    } catch (err) {
        errorText.textContent = err.message || 'Erro ao fazer login social.'
        errorMsg.classList.remove('hidden')
    }
}

document.getElementById('google-login')?.addEventListener('click', () => socialLogin('google'))
document.getElementById('microsoft-login')?.addEventListener('click', () => socialLogin('azure'))

// "Lembrar de mim" (para cityzen dev: supabase-js já faz, mas pode customizar com local/sessionStorage)
rememberInput?.addEventListener('change', function() {
    // Para Supabase, persistência já é localStorage por padrão.
    // Se quiser forçar sessionStorage: supabase.auth.setSessionPersistence('session')
    // Se quiser forçar localStorage: supabase.auth.setSessionPersistence('local')
    // Mas o padrão local já resolve para 99% dos apps.
})
