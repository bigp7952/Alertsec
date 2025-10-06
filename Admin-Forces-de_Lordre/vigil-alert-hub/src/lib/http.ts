import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base URL configurable via Vite env
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Create Axios instance with sane defaults
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

// Inject bearer token if available
httpClient.interceptors.request.use((config: AxiosRequestConfig) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers ?? {}
      ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  } catch {
    // no-op
  }
  return config
})

// Handle 401 globally
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      } finally {
        if (location.pathname !== '/login') {
          location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export { httpClient, API_BASE_URL }


