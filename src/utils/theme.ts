import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'

// 使用 VueUse 管理主题状态（自动同步 localStorage）
export const isDark = useLocalStorage('isDark', false)

// 监听主题变化，自动更新 DOM
watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}, { immediate: true })

/**
 * 切换暗黑模式
 */
export const toggleTheme = (): void => {
  isDark.value = !isDark.value
}