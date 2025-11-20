import request from '../utils/request'
import type { PaginationData, PaginationQuery } from '../types/request'
import type { Moment } from '../types/moment'

/**
 * 获取动态列表
 * @param params 查询参数
 * @param params.page 页码；不传返回全部数据
 * @param params.page_size 每页数量；不传返回全部数据
 * @returns 动态列表数据，包含动态数组和分页信息
 */
export function getMoments(params: Partial<PaginationQuery> = {}): Promise<PaginationData<Moment>> {
  return request.get<PaginationData<Moment>>('/moments', { params })
}
