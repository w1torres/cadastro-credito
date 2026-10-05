import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './features/auth/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { msalInstance } from './lib/msal'

function renderizar() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

// Renderiza mesmo se o MSAL falhar na inicialização: a tela de login mostra o erro.
if (msalInstance) {
  msalInstance
    .initialize()
    .catch((error: unknown) =>
      console.error('Falha ao iniciar o login Microsoft:', error),
    )
    .finally(renderizar)
} else {
  renderizar()
}
