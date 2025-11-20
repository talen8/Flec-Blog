import request from '../utils/request'
import type { Category } from '../types/category'
import type { PaginationData } from '../types/request'

/**
 * 获取分类列表
 * @returns 分类列表数据，包含分类数组和分页信息
 */
export function getCategories(): Promise<PaginationData<Category>> {
  return request.get<PaginationData<Category>>('/categories')
}

/**
 * 根据ID获取分类详情
 * @param id 分类ID
 * @returns 分类详细信息
 */
export function getCategoryById(id: number): Promise<Category> {
  return request.get<Category>(`/categories/${id}`)
}

/**
 * 根据slug获取分类详情
 * @param slug 分类slug
 * @returns 分类详细信息
 */
export function getCategoryBySlug(slug: string): Promise<Category> {
  return request.get<Category>(`/categories/${slug}`)
}
