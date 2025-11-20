import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getArticlesForWeb } from '@/api/article'
import type { Article } from '@/types/article'
import type { ArticleQuery } from '@/types/request'

/**
 * 文章列表状态管理
 */
export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  /**
   * 获取文章列表
   * @param query 查询参数（支持筛选条件）
   * @param forceRefresh 是否强制刷新
   */
  const fetchArticles = async (query: ArticleQuery = {}, forceRefresh = false) => {
    // 如果传入了 page，更新当前页码
    if (query.page !== undefined) {
      currentPage.value = query.page
    }
    
    // 避免重复请求，除非强制刷新
    if (!forceRefresh && articles.value.length > 0 && Object.keys(query).length === 0) return

    const response = await getArticlesForWeb({
      page: currentPage.value,
      page_size: pageSize.value,
      ...query  // 支持所有筛选参数
    })
    articles.value = response.list
    total.value = response.total
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一页
  }

  const resetPage = () => {
    currentPage.value = 1
  }

  return {
    articles,
    total,
    currentPage,
    pageSize,
    fetchArticles,
    setPageSize,
    resetPage
  }
})

/**
 * 当前文章状态管理（用于文章详情页）
 */
export const useCurrentArticleStore = defineStore('currentArticle', () => {
  const currentArticle = ref<Article | null>(null)

  const setCurrentArticle = (article: Article | null) => {
    currentArticle.value = article
  }

  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  return {
    currentArticle,
    setCurrentArticle,
    clearCurrentArticle
  }
})



