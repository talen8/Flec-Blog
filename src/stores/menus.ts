import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMenus } from '@/api/menu'
import type { Menu } from '@/types/menu'

export const useMenusStore = defineStore('menus', () => {
  const menus = ref<Menu[]>([])
  const error = ref<string | null>(null)

  /**
   * 获取导航菜单（type = 'navigation' 且 is_enabled = true）
   */
  const navigationMenus = computed(() => {
    return menus.value
      .filter(menu => menu.type === 'navigation')
      .sort((a, b) => a.sort - b.sort)
  })

  /**
   * 获取页脚菜单（type = 'footer' 且 is_enabled = true）
   */
  const footerMenus = computed(() => {
    return menus.value
      .filter(menu => menu.type === 'footer')
      .sort((a, b) => a.sort - b.sort)
  })

  /**
   * 获取聚合菜单（type = 'aggregate' 且 is_enabled = true）
   */
  const aggregateMenus = computed(() => {
    return menus.value
      .filter(menu => menu.type === 'aggregate')
      .sort((a, b) => a.sort - b.sort)
  })

  /**
   * 拉平菜单结构，获取所有导航菜单项（包括子菜单）
   */
  const flatNavigationMenus = computed(() => {
    const result: Menu[] = []
    
    const flatten = (items: Menu[]) => {
      items.forEach(item => {
        if (item.type === 'navigation') {
          result.push(item)
          if (item.children && item.children.length > 0) {
            flatten(item.children)
          }
        }
      })
    }
    
    flatten(navigationMenus.value)
    return result
  })

  /**
   * 加载菜单列表
   */
  const fetchMenus = async () => {
    error.value = null
    
    try {
      const data = await getMenus()
      menus.value = data || []
    } catch (err) {
      error.value = '获取菜单失败'
      console.error('获取菜单失败:', err)
      menus.value = []
    }
  }

  return {
    menus,
    error,
    navigationMenus,
    footerMenus,
    aggregateMenus,
    flatNavigationMenus,
    fetchMenus
  }
})

