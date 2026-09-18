import { API_BASE, ApiError, parseResponse } from '../../lib/apiClient'
import { getSession } from '../../lib/session'
import type { CreditRequestDocument, DocumentType } from '../../types/document'

function authHeaders(): HeadersInit {
  const session = getSession()
  if (!session) throw new ApiError(401, 'UNAUTHORIZED', 'Sessão expirada.')
  return { Authorization: `Bearer ${session.accessToken}` }
}

export const documentsApi = {
  list: async (creditRequestId: string): Promise<CreditRequestDocument[]> => {
    const response = await fetch(
      `${API_BASE}/credit-requests/${creditRequestId}/documents`,
      { headers: authHeaders() },
    )
    return parseResponse<CreditRequestDocument[]>(response)
  },

  // Upload multipart — não passa por `apiFetch` (sempre serializa JSON).
  upload: async (
    creditRequestId: string,
    file: File,
    type: DocumentType,
  ): Promise<CreditRequestDocument> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const response = await fetch(
      `${API_BASE}/credit-requests/${creditRequestId}/documents`,
      { method: 'POST', headers: authHeaders(), body: formData },
    )
    return parseResponse<CreditRequestDocument>(response)
  },

  remove: async (documentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/documents/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    await parseResponse<void>(response)
  },

  download: async (document: CreditRequestDocument): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/documents/${document.id}/download`,
      { headers: authHeaders() },
    )
    if (!response.ok) {
      throw new ApiError(
        response.status,
        'DOWNLOAD_FAILED',
        'Não foi possível baixar o documento.',
      )
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = document.originalName
    link.click()
    URL.revokeObjectURL(url)
  },
}
