<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { isDark, toggleTheme } from '@/utils/theme'
import { useAuth, logout } from '@/utils/auth'
import { useLoginModal } from '@/composables/useLoginModal'
import { useNotificationsStore } from '@/stores/notifications'
import SearchModal from '@/components/features/modals/SearchModal.vue'

interface Emits {
  (e: 'toggleDrawer'): void
}

const emit = defineEmits<Emits>()

// 登录相关
const isLoggedIn = useAuth()
const { open: openLogin } = useLoginModal()

// 通知相关
const notificationStore = useNotificationsStore()
const unreadCount = computed(() => notificationStore.unreadCount)

let pollingTimer: number | null = null

// 监听登录状态，自动启动/停止轮询
watch(isLoggedIn, (loggedIn) => {
  // 清理旧定时器
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
  
  if (loggedIn) {
    // 立即获取一次
    notificationStore.fetchUnreadCount()
    // 每30秒轮询一次
    pollingTimer = window.setInterval(() => {
      notificationStore.fetchUnreadCount()
    }, 30000)
  } else {
    notificationStore.clearNotifications()
  }
}, { immediate: true })

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})

// 搜索相关状态
const showSearchModal = ref(false)

// 打开搜索弹窗
const openSearch = () => {
  showSearchModal.value = true
}

// 退出登录
const handleLogout = () => {
  logout()
}
</script>

<template>
  <div class="nav-button">
    <button class="brighten" @click="openSearch"><i class="ri-search-line ri-xl"></i></button>
    <button class="brighten" @click="toggleTheme">
      <i class="ri-xl" :class="isDark ? 'ri-sun-line' : 'ri-moon-line'"></i>
    </button>
    <!-- 登录按钮 -->
    <button v-if="!isLoggedIn" class="brighten login-btn" @click="openLogin">
      <i class="ri-user-line ri-xl"></i>
    </button>
    <div v-else class="user-menu">
      <button class="brighten user-btn">
        <i class="ri-user-3-fill ri-xl"></i>
      </button>
      <div class="user-dropdown">
        <div class="user-info">
          <i class="ri-user-smile-line"></i>
          <span>已登录</span>
        </div>
        <div class="dropdown-divider"></div>
        <a href="/profile" class="dropdown-item">
          <i class="ri-user-settings-line"></i>
          个人信息
        </a>
        <a href="/notifications" class="dropdown-item notification-item">
          <i class="ri-notification-3-line"></i>
          <span>通知中心</span>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </a>
        <button class="dropdown-item" @click="handleLogout">
          <i class="ri-logout-box-line"></i>
          退出登录
        </button>
      </div>
    </div>
    <button class="button-menu brighten" @click="emit('toggleDrawer')">
      <i class="ri-menu-line ri-xl"></i>
    </button>
  </div>

  <!-- 搜索弹窗 -->
  <SearchModal v-model="showSearchModal" />
</template>

<style lang="scss" scoped>
.nav-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .5rem;

  .button-menu {
    display: none;
  }

  .login-btn {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 90%;
      height: 1px;
      background-color: var(--flec-nav-focus);
      transform: translateX(-50%) scaleX(0);
      transform-origin: center;
      transition: transform 0.3s ease;
    }

    &:hover:after {
      transform: translateX(-50%) scaleX(1);
    }
  }

  .user-menu {
    position: relative;
    display: inline-block;

    .user-btn {
      cursor: pointer;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 1rem);
      right: 0;
      background-color: var(--flec-bg, #fff);
      border-radius: 0.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      min-width: 180px;
      padding: 0.5rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 100;

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        color: var(--flec-font, #333);
        font-weight: 500;

        i {
          font-size: 1.25rem;
        }
      }

      .dropdown-divider {
        height: 1px;
        background-color: var(--flec-border, #e5e7eb);
        margin: 0.25rem 0;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        color: var(--flec-font, #333);
        cursor: pointer;
        border-radius: 0.25rem;
        transition: background-color 0.2s ease;
        text-align: left;
        text-decoration: none;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          background-color: var(--flec-hover-bg, rgba(0, 0, 0, 0.05));
        }

        &.notification-item {
          position: relative;
          
          .notification-badge {
            margin-left: auto;
            padding: 0.125rem 0.375rem;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 20px;
            text-align: center;
          }
        }
      }
    }

    &:hover .user-dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

@media screen and (max-width: 768px) {
  .button-menu {
    display: inline-flex !important;
  }
}
</style>

