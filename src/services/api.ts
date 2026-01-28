const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function checkApiConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/hello`)
    if (response.ok) {
      const text = await response.text()
      return { connected: true, message: text }
    }
    return { connected: false, message: `Erreur ${response.status}` }
  } catch (error) {
    return { connected: false, message: 'API non accessible' }
  }
}

export { API_BASE_URL }
