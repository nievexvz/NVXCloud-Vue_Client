import axios from 'axios'

const API_BASE = 'https://www.nievexsviz.my.id'
const API_KEY = 'nvxc'

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-api-key': API_KEY
  }
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making request to:', config.url)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const cdnService = {
  async uploadFile(file) {
    try {
      console.log('📤 Starting file upload...')
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post('/api/v1/cdn', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      })
      
      console.log('✅ Upload successful:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Upload failed:', error)
      throw error
    }
  }
}

export const shortenerService = {
  async createShortUrl(url, customId = null) {
    try {
      console.log('🔗 Creating short URL for:', url)
      const data = { url }
      if (customId) {
        data.customId = customId
      }
      
      const response = await api.post('/api/v1/short', data, {
        timeout: 10000
      })
      
      console.log('✅ Short URL created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Short URL creation failed:', error)
      throw error
    }
  }
}

export const healthService = {
  async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE}/health`, {
        timeout: 5000
      })
      return response.data
    } catch (error) {
      console.error('❌ Health check failed:', error)
      throw error
    }
  }
}
