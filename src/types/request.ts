/**
 * API响应数据结构
 * @template T 响应数据类型
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  page: number
  page_size: number
}

/**
 * 文章查询参数（所有参数可选，支持灵活组合）
 */
export interface ArticleQuery {
  page?: number        // 页码；不传返回全部数据
  page_size?: number   // 每页数量；不传返回全部数据
  year?: string        // 按年份筛选
  month?: string       // 按月份筛选
  category?: string    // 按分类筛选（slug）
  tag?: string         // 按标签筛选（slug）
}

/**
 * 分页响应数据结构
 * @template T 列表项数据类型
 */
export interface PaginationData<T = any> {
  list: T[]
  total: number
  page: number
  page_size: number
}