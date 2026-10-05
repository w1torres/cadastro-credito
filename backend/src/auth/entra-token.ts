import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

/** Claims que o Entra ID devolve no id token e que usamos para identificar o usuário. */
export interface EntraIdClaims {
  email?: string;
  preferred_username?: string;
  oid?: string;
  name?: string;
}

const jwksPorTenant = new Map<string, JWTVerifyGetKey>();

function jwksDoTenant(tenantId: string): JWTVerifyGetKey {
  let jwks = jwksPorTenant.get(tenantId);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`),
      { cacheMaxAge: 60 * 60 * 1000 },
    );
    jwksPorTenant.set(tenantId, jwks);
  }
  return jwks;
}

/**
 * Valida a assinatura do id token contra a chave pública do tenant e confere
 * audience (nosso client id) e issuer (nosso tenant). Sem essas duas checagens,
 * qualquer token válido de qualquer aplicação Entra ID seria aceito.
 */
export async function verifyEntraIdToken(
  idToken: string,
  tenantId: string,
  clientId: string,
): Promise<EntraIdClaims> {
  const { payload } = await jwtVerify(idToken, jwksDoTenant(tenantId), {
    audience: clientId,
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  });
  return payload as EntraIdClaims;
}
