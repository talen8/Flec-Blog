/**
 * Pinia Store 简化包装
 */

import { storeToRefs } from 'pinia'
import { useCategoriesStore as _useCategoriesStore } from '@/stores/categories'
import { useTagsStore as _useTagsStore } from '@/stores/tags'
import { useArticlesStore as _useArticlesStore, useCurrentArticleStore as _useCurrentArticleStore } from '@/stores/articles'
import { useStatsStore as _useStatsStore } from '@/stores/stats'
import { useCommentsStore as _useCommentsStore } from '@/stores/comments'
import { useMenusStore as _useMenusStore } from '@/stores/menus'
import { useMomentsStore as _useMomentsStore } from '@/stores/moments'

/**
 * 分类数据
 * @example const { categories, total, fetchCategories } = useCategories()
 */
export function useCategories() {
  const store = _useCategoriesStore()
  return {
    ...storeToRefs(store),
    fetchCategories: store.fetchCategories
  }
}

/**
 * 标签数据
 * @example const { tags, total, fetchTags } = useTags()
 */
export function useTags() {
  const store = _useTagsStore()
  return {
    ...storeToRefs(store),
    fetchTags: store.fetchTags
  }
}

/**
 * 文章列表数据
 * @example const { articles, total, loading, currentPage, pageSize, fetchArticles, setPageSize, resetPage } = useArticles()
 */
export function useArticles() {
  const store = _useArticlesStore()
  return {
    ...storeToRefs(store),
    fetchArticles: store.fetchArticles,
    setPageSize: store.setPageSize,
    resetPage: store.resetPage
  }
}

/**
 * 当前文章数据
 * @example const { currentArticle, setCurrentArticle, clearCurrentArticle } = useCurrentArticle()
 */
export function useCurrentArticle() {
  const store = _useCurrentArticleStore()
  return {
    ...storeToRefs(store),
    setCurrentArticle: store.setCurrentArticle,
    clearCurrentArticle: store.clearCurrentArticle
  }
}

/**
 * 网站统计数据
 * @example const { siteStats, error, fetchStats } = useStats()
 */
export function useStats() {
  const store = _useStatsStore()
  return {
    ...storeToRefs(store),
    fetchStats: store.fetchStats
  }
}

/**
 * 评论数据
 * @example const { comments, total, loading, currentPage, pageSize, fetchComments, addComment, resetComments } = useComments()
 */
export function useComments() {
  const store = _useCommentsStore()
  return {
    ...storeToRefs(store),
    fetchComments: store.fetchComments,
    addComment: store.addComment,
    resetComments: store.resetComments
  }
}

/**
 * 菜单数据
 * @example const { menus, navigationMenus, footerMenus, aggregateMenus, fetchMenus } = useMenus()
 */
export function useMenus() {
  const store = _useMenusStore()
  return {
    ...storeToRefs(store),
    fetchMenus: store.fetchMenus
  }
}

/**
 * 动态数据
 * @example const { moments, total, currentPage, pageSize, fetchMoments } = useMoments()
 */
export function useMoments() {
  const store = _useMomentsStore()
  return {
    ...storeToRefs(store),
    fetchMoments: store.fetchMoments
  }
}
