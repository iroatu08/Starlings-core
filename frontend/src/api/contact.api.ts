import apiClient from './axios.client'

export const contactApi = {
  submit: (data: { name: string; email: string; subject?: string; message: string }) =>
    apiClient.post('/contact', data),
}
