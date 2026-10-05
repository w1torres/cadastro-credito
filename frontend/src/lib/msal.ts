import {
  PublicClientApplication,
  type Configuration,
} from '@azure/msal-browser'

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID

/**
 * Entra ID só é usado quando as variáveis estão configuradas. Sem elas, a
 * aplicação continua subindo (a tela de login avisa), em vez de quebrar tudo.
 */
export const ENTRA_CONFIGURADO = Boolean(clientId && tenantId)

const configuration: Configuration = {
  auth: {
    clientId: clientId ?? '',
    authority: `https://login.microsoftonline.com/${tenantId ?? 'common'}`,
    redirectUri:
      import.meta.env.VITE_ENTRA_REDIRECT_URI || window.location.origin,
  },
  cache: { cacheLocation: 'localStorage' },
}

export const msalInstance: PublicClientApplication | null = ENTRA_CONFIGURADO
  ? new PublicClientApplication(configuration)
  : null

export const ENTRA_LOGIN_SCOPES = ['openid', 'profile', 'email']
