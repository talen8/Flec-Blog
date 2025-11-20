import request from '../utils/request'
import type { Article } from '../types/article'
import type { PaginationData, ArticleQuery } from '../types/request'

/**
 * 获取文章列表（前台）
 * @param params 查询参数（全部可选）
 * @param params.page 页码；不传返回全部数据
 * @param params.page_size 每页数量；不传返回全部数据
 * @param params.year 按年份筛选
 * @param params.month 按月份筛选
 * @param params.category 按分类筛选（slug）
 * @param params.tag 按标签筛选（slug）
 * @returns 文章列表数据，包含文章数组和分页信息
 */
export function getArticlesForWeb(params: ArticleQuery = {}): Promise<PaginationData<Article>> {
  return request.get<PaginationData<Article>>('/articles', { params })
}

/**
 * 根据 slug 获取文章详情
 * @param slug 文章的唯一标识符
 * @returns 文章详细信息
 */
export function getArticleBySlug(slug: string): Promise<Article> {
  return request.get<Article>(`/articles/${slug}`)
}

/**
 * 搜索文章
 * @param keyword 搜索关键词
 * @param params 分页参数
 * @returns 搜索结果列表
 */
export function searchArticles(keyword: string, params: Partial<ArticleQuery> = {}): Promise<PaginationData<Article>> {
  return request.get<PaginationData<Article>>('/articles/search', {
    params: { keyword, ...params }
  })
}
