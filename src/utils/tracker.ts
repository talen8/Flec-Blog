/**
 * FLEC Blog 自动统计追踪脚本 (TypeScript 版本)
 * 
 * 功能：
 * - 自动追踪所有页面访问（PV/UV）
 * - 支持SPA路由切换（Vue Router）
 * - 页面停留时长追踪
 * - 手动事件追踪API
 */

interface TrackerConfig {
  endpoint: string
  debug: boolean
  enabled: boolean
}

interface BaseData {
  url: string
  hostname: string
  referrer: string
  language: string
  screen: string
  title: string
  timestamp: number
  article_id?: number
}

interface TrackData {
  type: 'pageview' | 'event' | 'duration'
  event_name?: string
  event_data?: Record<string, any>
  duration?: number
}

export interface TrackerAPI {
  track(eventName: string, eventData?: Record<string, any>): void
  trackPageview(url?: string, articleId?: number): void
  enableDebug(): void
  setConfig(config: Partial<TrackerConfig>): void
}

declare global {
  interface Window {
    tracker?: TrackerAPI
    TRACKER_ENDPOINT?: string
  }
}

// 配置（支持环境变量）
const config: TrackerConfig = {
  // 使用 VITE_API_URL 拼接 /collect
  endpoint: `${import.meta.env.VITE_API_URL}/collect`,
  debug: false, // 关闭调试模式
  enabled: true
}

// 工具函数：打印调试信息
function log(...args: any[]): void {
  if (config.debug) {
    console.log('[Tracker]', ...args)
  }
}

// 收集基础数据
function getBaseData(url?: string, articleId?: number): BaseData {
  const baseData: BaseData = {
    url: url || (location.pathname + location.search),
    hostname: location.hostname,
    referrer: document.referrer || '',
    language: navigator.language || '',
    screen: `${screen.width}x${screen.height}`,
    title: document.title || '',
    timestamp: Date.now()
  }
  
  if (articleId !== undefined) {
    baseData.article_id = articleId
  }
  
  return baseData
}

// 发送数据到服务器
function send(data: TrackData, url?: string, articleId?: number): void {
  if (!config.enabled) {
    log('Tracker is disabled, skipping send')
    return
  }

  const payload = {
    ...getBaseData(url, articleId),
    ...data
  }
  
  log('Sending data:', payload)
  
  // 优先使用 Beacon API（即使页面关闭也能发送）
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { 
      type: 'application/json' 
    })
    const success = navigator.sendBeacon(config.endpoint, blob)
    log('Beacon sent:', success)
    return
  }
  
  // 降级到 fetch（带 keepalive 保证页面关闭时也能发送）
  fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  })
    .then(() => log('Fetch sent successfully'))
    .catch(err => {
      log('Fetch error:', err)
      // 静默失败，不影响用户体验
    })
}

// 记录页面访问
function trackPageview(url?: string, articleId?: number): void {
  send({ type: 'pageview' }, url, articleId)
}

// 页面停留时长追踪
let pageStartTime = Date.now()
let lastPageUrl = location.pathname + location.search
let currentArticleId: number | undefined = undefined

// 设置当前文章ID
export function setCurrentArticleId(articleId?: number): void {
  currentArticleId = articleId
}

// 更新页面开始时间（用于路由切换）
export function updatePageStartTime(url?: string, articleId?: number): void {
  const duration = Date.now() - pageStartTime
  
  // 发送上一个页面的停留时长
  if (duration > 1000) {  // 停留超过1秒才记录
    send({ 
      type: 'duration', 
      duration: Math.floor(duration / 1000)
    }, lastPageUrl, currentArticleId)
  }
  
  // 重置计时
  pageStartTime = Date.now()
  lastPageUrl = url || (location.pathname + location.search)
  currentArticleId = articleId
}

// Tracker API
export const tracker: TrackerAPI = {
  /**
   * 追踪自定义事件
   * @param eventName 事件名称
   * @param eventData 事件数据（可选）
   */
  track(eventName: string, eventData?: Record<string, any>): void {
    if (!eventName) {
      console.warn('[Tracker] Event name is required')
      return
    }
    
    send({ 
      type: 'event', 
      event_name: eventName,
      event_data: eventData || {}
    })
  },
  
  /**
   * 手动追踪页面访问
   * @param url 可选的URL，默认使用当前页面URL
   * @param articleId 可选的文章ID，用于文章详情页
   */
  trackPageview(url?: string, articleId?: number): void {
    trackPageview(url, articleId)
  },
  
  /**
   * 开启调试模式
   */
  enableDebug(): void {
    config.debug = true
    log('Debug mode enabled')
  },

  /**
   * 设置配置
   */
  setConfig(newConfig: Partial<TrackerConfig>): void {
    Object.assign(config, newConfig)
    log('Config updated:', config)
  }
}

// 初始化追踪器
export function initTracker(): void {
  log('Tracker initializing...', { endpoint: config.endpoint })

  // 页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏，记录停留时长
      const duration = Date.now() - pageStartTime
      if (duration > 1000) {
        send({ 
          type: 'duration', 
          duration: Math.floor(duration / 1000)
        }, undefined, currentArticleId)
      }
    } else {
      // 页面显示，重新开始计时
      pageStartTime = Date.now()
    }
  })
  
  // 页面卸载
  window.addEventListener('beforeunload', () => {
    const duration = Date.now() - pageStartTime
    if (duration > 1000) {
      send({ 
        type: 'duration', 
        duration: Math.floor(duration / 1000)
      }, undefined, currentArticleId)
    }
  })

  // 暴露到全局（可选，方便在浏览器控制台调试）
  if (typeof window !== 'undefined') {
    window.tracker = tracker
  }
  
  log('Tracker initialized successfully')
}

// 默认导出
export default tracker

