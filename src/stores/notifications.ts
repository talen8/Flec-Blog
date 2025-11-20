import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '@/api/notification'
import type { Notification, GetNotificationsParams } from '@/types/notification'

/**
 * 通知状态管理
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const unreadCount = ref(0)
  const loading = ref(false)

  /**
   * 获取通知列表
   */
  const fetchNotifications = async (params?: Partial<GetNotificationsParams>) => {
    loading.value = true
    try {
      const response = await getNotifications({
        page: params?.page ?? currentPage.value,
        page_size: params?.page_size ?? pageSize.value
      })
      notifications.value = response.list
      total.value = response.total
      unreadCount.value = response.unread_count
      if (params?.page !== undefined) {
        currentPage.value = params.page
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 仅获取未读数量（用于轮询）
   */
  const fetchUnreadCount = async () => {
    try {
      // 获取第一页通知列表，只为了获取未读数量
      const response = await getNotifications({
        page: 1,
        page_size: 1
      })
      unreadCount.value = response.unread_count
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  /**
   * 标记单条已读
   */
  const markNotificationAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      // 更新本地状态
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.is_read) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  /**
   * 全部标记已读
   */
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead()
      // 更新本地状态
      notifications.value.forEach(n => {
        n.is_read = true
        n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }


  /**
   * 重置页码
   */
  const resetPage = () => {
    currentPage.value = 1
  }

  /**
   * 清空所有通知数据
   */
  const clearNotifications = () => {
    notifications.value = []
    total.value = 0
    currentPage.value = 1
    unreadCount.value = 0
  }

  /**
   * 计算属性：是否有未读通知
   */
  const hasUnread = computed(() => unreadCount.value > 0)

  /**
   * 计算属性：未读通知列表
   */
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.is_read)
  )

  return {
    notifications,
    total,
    currentPage,
    pageSize,
    unreadCount,
    loading,
    hasUnread,
    unreadNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetPage,
    clearNotifications
  }
})




