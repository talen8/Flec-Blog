import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getComments, createComment } from '@/api/comment'
import type { Comment, CreateCommentParams, CommentTargetType } from '@/types/comment'

/**
 * 评论状态管理
 */
export const useCommentsStore = defineStore('comments', () => {
  const comments = ref<Comment[]>([])
  const currentTargetType = ref<CommentTargetType | null>(null)
  const currentTargetKey = ref<string | number | null>(null)

  /**
   * 获取评论列表
   * @param targetType 目标类型 (article/page)
   * @param targetKey 目标键值 (文章ID或页面key)
   */
  const fetchComments = async (targetType: CommentTargetType, targetKey: string | number) => {
    if (!targetType || !targetKey) return

    // 更新当前目标信息
    currentTargetType.value = targetType
    currentTargetKey.value = targetKey

    try {
      const data = await getComments({
        target_type: targetType,
        target_key: targetKey
      })

      comments.value = data.list
    } catch (error) {
      console.error('获取评论失败:', error)
      comments.value = []
    }
  }

  /**
   * 添加评论
   * @param params 评论参数
   */
  const addComment = async (params: CreateCommentParams) => {
    try {
      const newComment = await createComment(params)
      
      // 如果是顶级评论，直接添加到评论列表
      if (!params.parent_id) {
        comments.value.unshift(newComment)
      } else {
        // 如果是回复评论，需要找到父评论并添加到其 replies 中
        const addReplyToComment = (commentList: Comment[]): boolean => {
          for (const comment of commentList) {
            if (comment.id === params.parent_id) {
              if (!comment.replies) {
                comment.replies = []
              }
              comment.replies.push(newComment)
              return true
            }
            // 递归查找子评论
            if (comment.replies && comment.replies.length > 0) {
              if (addReplyToComment(comment.replies)) {
                return true
              }
            }
          }
          return false
        }
        addReplyToComment(comments.value)
      }
      
      return newComment
    } catch (error) {
      throw error
    }
  }

  /**
   * 重置评论状态
   */
  const resetComments = () => {
    comments.value = []
    currentTargetType.value = null
    currentTargetKey.value = null
  }

  return {
    comments,
    fetchComments,
    addComment,
    resetComments
  }
})
