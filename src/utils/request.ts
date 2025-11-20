import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { accessToken, refreshToken, setTokens, logout } from './auth'
import type { ApiResponse } from '@/types/request'
import { useToast } from '@/composables/useToast'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 是否正在刷新token的标志
let isRefreshing = false
// 存储待重试的请求
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// 处理队列中的请求
const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })
  failedQueue = []
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // refresh接口不需要带Authorization header（在body中发送refresh_token）
    if (config.url === '/auth/refresh') {
      return config
    }
    
    // 其他接口带上access token
    if (accessToken.value) {
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }
    return config
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data
    if (code !== 0) {
      return Promise.reject(new Error(message || '请求失败'))
    }
    return data
  },
  async (err: AxiosError) => {
    const { warning, error } = useToast()
    const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // 处理401未授权 - 尝试刷新token
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return service(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = refreshToken.value
      if (!refresh) {
        // 没有refresh token，直接登出
        warning('登录已过期，请重新登录')
        logout()
        return Promise.reject(err)
      }

      try {
        // 调用refresh接口（返回的已经是data，不是整个response）
        const data: { access_token: string; refresh_token: string } = await service.post('/auth/refresh', {
          refresh_token: refresh
        })
        
        // 更新token
        setTokens(data.access_token, data.refresh_token)
        
        // 处理队列中的请求
        processQueue()
        
        // 重试原请求
        return service(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清空队列并登出
        processQueue(refreshError)
        warning('登录已过期，请重新登录')
        logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // 处理404
    if (err.response?.status === 404) {
      return Promise.reject(err)
    }
    
    // 处理500服务器错误
    if (err.response?.status === 500) {
      error('服务器错误，请稍后重试')
      return Promise.reject(err)
    }
    
    // 处理网络错误
    if (!err.response) {
      error('网络连接失败，请检查网络设置')
      return Promise.reject(err)
    }
    
    // 其他错误
    return Promise.reject(err)
  }
)

// 创建类型安全的 request 对象
const request = {
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return service.get(url, config) as Promise<T>
  },
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.post(url, data, config) as Promise<T>
  },
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.put(url, data, config) as Promise<T>
  },
  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return service.patch(url, data, config) as Promise<T>
  },
  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return service.delete(url, config) as Promise<T>
  }
}

export default request