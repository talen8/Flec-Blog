import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSiteStats } from '@/api/stats'
import type { SiteStats } from '@/types/stats'

/**
 * 网站统计状态管理
 */
export const useStatsStore = defineStore('stats', () => {
  const siteStats = ref<SiteStats>({
    total_words: '0',
    total_visitors: 0,
    total_page_views: 0,
    online_users: 0,
    running_days: 0,
    today_visitors: 0,
    today_pageviews: 0,
    yesterday_visitors: 0,
    yesterday_pageviews: 0,
    month_pageviews: 0
  })
  const error = ref<Error | null>(null)
  const hasFetched = ref(false)

  const fetchStats = async () => {
    // 如果已获取过数据，直接返回（避免重复请求）
    if (hasFetched.value) return

    error.value = null

    try {
      siteStats.value = await getSiteStats()
      hasFetched.value = true
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('获取网站统计失败')
    }
  }

  return {
    siteStats,
    error,
    fetchStats
  }
})

