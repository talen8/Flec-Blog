import request from '@/utils/request'
import type { FriendGroupedResponse, FriendQueryParams, FriendApplyRequest } from '@/types/friend'

/**
 * 获取友链列表（已按类型分组）
 */
export function getFriends(params?: FriendQueryParams): Promise<FriendGroupedResponse> {
  return request.get<FriendGroupedResponse>('/friends', { params })
}

/**
 * 申请友链
 */
export function applyFriend(data: FriendApplyRequest): Promise<void> {
  return request.post<void>('/friends/apply', data)
}
