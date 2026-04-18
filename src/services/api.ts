import api, { API_BASE_URL } from '@/plugins/axios'

export async function checkApiConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const response = await api.get<string>('/hello', { responseType: 'text' })
    return { connected: true, message: String(response.data) }
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status) return { connected: false, message: `Erreur ${status}` }
    return { connected: false, message: 'API non accessible' }
  }
}

export { API_BASE_URL }
