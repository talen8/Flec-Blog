import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCategories } from '@/api/category'
import type { Category } from '@/types/category'

/**
 * 分类列表状态管理
 */
export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const total = ref(0)

  const fetchCategories = async () => {
    // 如果已有数据，直接返回（避免重复请求）
    if (categories.value.length > 0) return
    
    const response = await getCategories()
    categories.value = response.list
    total.value = response.total
  }

  return {
    categories,
    total,
    fetchCategories
  }
})



