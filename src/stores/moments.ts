import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Moment } from '@/types/moment'
import { getMoments } from '@/api/moment'

export const useMomentsStore = defineStore('moments', () => {
  const moments = ref<Moment[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(30) // 一次显示30条动态

  /**
   * 加载动态列表
   */
  const fetchMoments = async (page: number = 1) => {
    try {
      const response = await getMoments({ page, page_size: pageSize.value })
      
      moments.value = response.list
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.page_size
    } catch (error) {
      console.error('获取动态列表失败:', error)
    }
  }

  return {
    moments,
    total,
    currentPage,
    pageSize,
    fetchMoments
  }
})

