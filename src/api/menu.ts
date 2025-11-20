import request from '@/utils/request'
import type { Menu } from '@/types/menu'

/**
 * 获取菜单列表
 */
export const getMenus = () => {
  return request.get<Menu[]>('/menus')
}

