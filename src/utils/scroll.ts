/**
 * 滚动工具类
 * 提供页面滚动相关的通用方法
 */

/**
 * 滚动配置选项
 */
export interface ScrollOptions {
  /** 滚动行为：smooth 平滑滚动，auto 立即滚动 */
  behavior?: ScrollBehavior
  /** 滚动位置：start 顶部对齐，center 居中对齐，end 底部对齐，nearest 最近对齐 */
  block?: ScrollLogicalPosition
}

/**
 * 滚动到指定元素位置
 * @param selector CSS 选择器
 * @param options 滚动选项
 */
export function scrollToElement(selector: string, options?: ScrollOptions): void {
  const { behavior = 'smooth', block = 'center' } = options || {}

  // # 开头用 getElementById 支持特殊字符，否则用 querySelector
  const element = selector.startsWith('#')
    ? document.getElementById(selector.slice(1))
    : document.querySelector(selector)

  element?.scrollIntoView({
    behavior,
    block
  })
}
