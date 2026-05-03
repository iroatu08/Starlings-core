import apiClient from './axios.client'

export const newsletterApi = {
  subscribe: (email: string) =>
    apiClient.post<{ success: boolean; data: { message: string } }>('/newsletter/subscribe', { email }),
}
