import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { nextTick } from 'vue'
import { tracker, updatePageStartTime, setCurrentArticleId } from '@/utils/tracker'

// 网站配置常量
export const SITE_TITLE = '爱吃猫的鱼'
export const SITE_SUBTITLE = 'FlecBLOG'

// 声明全局类型
declare global {
  interface Window {
    __articleContentReady?: () => void;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: '首页',
        component: () => import('@/views/Home.vue'),
        meta: { typeHeader: 'home' }
      },
      {
        path: 'archive',
        name: '归档',
        component: () => import('@/views/Archive.vue'),
      },
      {
        path: 'archive/:year/:month',
        name: '归档详情',
        component: () => import('@/views/Archive.vue'),
      },
      {
        path: 'category',
        name: '分类',
        component: () => import('@/views/Category.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'categories/:slug',
        name: '分类详情',
        component: () => import('@/views/CategoryDetail.vue'),
      },
      {
        path: 'tag',
        name: '标签',
        component: () => import('@/views/Tag.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'tags/:slug',
        name: '标签详情',
        component: () => import('@/views/TagDetail.vue'),
      },
      {
        path: 'friend',
        name: '友链',
        component: () => import('@/views/Friend.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'about',
        name: '关于',
        component: () => import('@/views/About.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'subscribe',
        name: '订阅本站',
        component: () => import('@/views/Subscribe.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'cookies',
        name: 'Cookies',
        component: () => import('@/views/Cookies.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'privacy',
        name: '隐私协议',
        component: () => import('@/views/Privacy.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'copyright',
        name: '版权协议',
        component: () => import('@/views/Copyright.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'ask',
        name: '提问须知',
        component: () => import('@/views/AskQuestion.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'moment',
        name: '动态',
        component: () => import('@/views/Moment.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'profile',
        name: '个人信息',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'notifications',
        name: '通知中心',
        component: () => import('@/views/Notification.vue')
      },
      {
        path: 'feedback',
        name: '反馈投诉',
        component: () => import('@/views/Feedback.vue'),
        meta: { showSidebar: false }
      },
      {
        path: 'posts/:slug',
        name: '文章详情',
        component: () => import('@/views/ArticleDetail.vue'),
        meta: { typeHeader: 'post' }
      },
      {
        path: '404',
        name: '页面未找到',
        component: () => import('@/views/NotFound.vue'),
        meta: { showSidebar: false }
      },
      {
        path: ':pathMatch(.*)*',
        redirect: '/404'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      // 文章详情页需要等待异步内容加载完成
      if (to.name === '文章详情') {
        return new Promise((resolve) => {
          window.__articleContentReady = () => {
            requestAnimationFrame(() => resolve(savedPosition))
          }
          // 超时保护
          setTimeout(() => {
            if (window.__articleContentReady) {
              window.__articleContentReady = undefined
              resolve(savedPosition)
            }
          }, 2000)
        })
      }
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫：设置页面标题和追踪页面访问
router.afterEach((to, from) => {
  // 设置页面标题
  const pageName = to.name as string || ''
  
  if (to.name === '首页') {
    // 首页：标题 - 子标题
    document.title = `${SITE_TITLE} - ${SITE_SUBTITLE}`
  } else if (pageName) {
    // 其他页面：页面标题 | 标题
    document.title = `${pageName} | ${SITE_TITLE}`
  } else {
    // 没有设置 name 的页面
    document.title = `${SITE_TITLE} - ${SITE_SUBTITLE}`
  }
  
  // 等待 DOM 更新后再追踪（确保 document.title 已更新）
  nextTick(() => {
    const url = to.fullPath
    
    // 记录上一个页面的停留时长并重置计时器
    if (from.name) {
      updatePageStartTime(url)
    }
    
    // 如果不是文章详情页，清除文章ID
    // 注意：文章详情页的 article_id 会在 ArticleDetail.vue 组件中设置
    if (to.name !== '文章详情') {
      setCurrentArticleId(undefined)
      tracker.trackPageview(url)
    }
    // 文章详情页的埋点会在 ArticleDetail.vue 中处理
  })
})

export default router