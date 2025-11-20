import request from '../utils/request'
import type { Tag } from '../types/tag'
import type { PaginationData } from '../types/request'

/**
 * 获取标签列表
 * @returns 标签列表数据，包含标签数组和分页信息
 */
export function getTags(): Promise<PaginationData<Tag>> {
  return request.get<PaginationData<Tag>>('/tags')
}

/**
 * 根据ID获取标签详情
 * @param id 标签ID
 * @returns 标签详细信息
 */
export function getTagById(id: number): Promise<Tag> {
  return request.get<Tag>(`/tags/${id}`)
}

/**
 * 根据slug获取标签详情
 * @param slug 标签slug
 * @returns 标签详细信息
 */
export function getTagBySlug(slug: string): Promise<Tag> {
  return request.get<Tag>(`/tags/${slug}`)
}
