import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

// 使用 VueUse 管理双token（自动同步 localStorage）
export const accessToken = useLocalStorage<string | null>('access_token', null)
export const refreshToken = useLocalStorage<string | null>('refresh_token', null)

// 响应式登录状态（共享的 computed）
export const isLoggedIn = computed(() => !!accessToken.value && accessToken.value !== '')

/**
 * 设置双token
 */
export const setTokens = (access: string, refresh: string): void => {
  accessToken.value = access
  refreshToken.value = refresh
}

/**
 * 设置access token（用于token刷新）
 */
export const setAccessToken = (access: string): void => {
  accessToken.value = access
}

/**
 * 登出操作（清除双token）
 */
export const logout = (): void => {
  accessToken.value = null
  refreshToken.value = null
}

/**
 * 获取响应式的登录状态
 */
export const useAuth = () => isLoggedIn
