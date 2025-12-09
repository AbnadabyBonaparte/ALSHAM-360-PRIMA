import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes.css'
import './responsive.css'
import './compact.css'  // ← ADICIONAR ESTA LINHA!
import App from './App.tsx'

// Normaliza caminhos inesperados (ex.: /precondition/BK_LOGIN) para raiz SPA
const path = window.location.pathname
if (path && path !== '/') {
  window.history.replaceState(null, '', '/')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
