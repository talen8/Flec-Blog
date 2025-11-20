import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTags } from '@/api/tag'
import type { Tag } from '@/types/tag'

/**
 * 标签列表状态管理
 */
export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const total = ref(0)

  const fetchTags = async () => {
    // 如果已有数据，直接返回（避免重复请求）
    if (tags.value.length > 0) return
    
    const response = await getTags()
    tags.value = response.list
    total.value = response.total
  }

  return {
    tags,
    total,
    fetchTags
  }
})




