import request from '../utils/request'
import type { Comment, CommentTargetType, CreateCommentParams } from '../types/comment'
import type { PaginationData, PaginationQuery } from '../types/request'

/**
 * 获取评论列表参数
 */
interface GetCommentsParams extends Partial<PaginationQuery> {
  target_type: CommentTargetType
  target_key: string | number
}

/**
 * 获取评论列表
 * @param params 查询参数
 * @returns 评论列表数据，包含评论数组和分页信息
 */
export function getComments(params: GetCommentsParams): Promise<PaginationData<Comment>> {
  return request.get<PaginationData<Comment>>('/comments', { 
    params: {
      ...params,
      target_key: String(params.target_key)
    }
  })
}

/**
 * 创建评论
 * @param params 评论参数
 * @returns 新创建的评论数据
 */
export function createComment(params: CreateCommentParams): Promise<Comment> {
  return request.post<Comment>('/comments', {
    ...params,
    target_key: String(params.target_key)
  })
}