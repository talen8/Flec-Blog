import request from '@/utils/request'
import type {
  NotificationListResponse,
  GetNotificationsParams
} from '@/types/notification'

/**
 * 获取前台用户通知列表
 */
export function getNotifications(params: GetNotificationsParams) {
  return request.get<NotificationListResponse>('/notifications', { params })
}

/**
 * 标记单条已读
 */
export function markAsRead(id: number) {
  return request.put<void>(`/notifications/${id}/read`)
}

/**
 * 全部标记已读
 */
export function markAllAsRead() {
  return request.put<void>('/notifications/read-all')
}


