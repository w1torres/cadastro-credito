import type { Session } from '../types/auth'

const STORAGE_KEY = 'cadastro-credito:session'

function readFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function writeToStorage(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage indisponível (modo privado, cota excedida, etc.) — a
    // sessão continua funcionando em memória, só não sobrevive a um reload.
  }
}

let currentSession: Session | null = readFromStorage()
const listeners = new Set<() => void>()

export function getSession(): Session | null {
  return currentSession
}

export function setSession(session: Session): void {
  currentSession = session
  writeToStorage(session)
  listeners.forEach((listener) => listener())
}

export function clearSession(): void {
  currentSession = null
  writeToStorage(null)
  listeners.forEach((listener) => listener())
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
