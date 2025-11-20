import { ref, nextTick, onMounted } from "vue";
import type { Ref } from "vue";
import { useEventListener, useResizeObserver } from '@vueuse/core'

// 增强版瀑布流配置选项
export interface AdvancedWaterfallOptions {
  /** 容器选择器 */
  containerSelector: string
  /** 桌面端列数，默认 3 */
  columns?: number
  /** 列间距，默认 15 */
  gap?: number
  /** 防抖延迟时间（ms），默认 150 */
  debounceDelay?: number
  /** 响应式断点配置 */
  breakpoints?: {
    mobile: number    // 手机端宽度，默认 768
    tablet: number    // 平板端宽度，默认 1200
  }
}

/**
 * 简单版瀑布流
 */
export function useWaterfall(
  containerSelector: string,
  columns: number = 2,
  gap: number = 16
) {
  // 根据屏幕宽度获取列数
  const getResponsiveColumns = (): number => {
    const width = window.innerWidth;
    if (width < 768) {
      return 1; // 手机端单列
    } else if (width < 1024) {
      return 2; // 平板双列
    }
    return columns; // 桌面端使用传入的列数
  };

  const waterfall = () => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = Array.from(container.children);
    const containerWidth = container.clientWidth;
    const currentColumns = getResponsiveColumns();
    const columnWidth = (containerWidth - gap * (currentColumns - 1)) / currentColumns;

    // 初始化列高度数组
    const columnsHeight = new Array(currentColumns).fill(0);

    items.forEach((item) => {
      const element = item as HTMLElement;

      // 找到高度最小的列
      const minHeight = Math.min(...columnsHeight);
      const columnIndex = columnsHeight.indexOf(minHeight);

      // 设置元素位置
      element.style.width = `${columnWidth}px`;
      element.style.position = "absolute";
      element.style.left = `${columnIndex * (columnWidth + gap)}px`;
      element.style.top = `${minHeight}px`;

      // 更新列高度
      columnsHeight[columnIndex] = minHeight + element.offsetHeight + gap;
    });

    // 设置容器高度
    const containerHeight = Math.max(...columnsHeight);
    (container as HTMLElement).style.height = `${containerHeight}px`;
  };

  onMounted(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;

    if (container) {
      // 使用 VueUse 监听容器大小变化（自动清理）
      useResizeObserver(container, waterfall);
    }

    // 初始布局
    waterfall();

    // 使用 VueUse 自动管理事件监听（自动清理）
    useEventListener(window, 'load', waterfall);
    useEventListener(window, 'resize', waterfall);
  });

  return {
    waterfall,
  };
}

/**
 * 增强版瀑布流
 */
export function useAdvancedWaterfall(options: AdvancedWaterfallOptions) {
  const {
    containerSelector,
    columns = 3,
    gap = 15,
    debounceDelay = 150,
    breakpoints = { mobile: 768, tablet: 1200 }
  } = options

  // 布局准备状态
  const isLayoutReady: Ref<boolean> = ref(false)

  // 防抖定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // 根据屏幕宽度获取列数
  const getColumns = (): number => {
    const width = window.innerWidth
    if (width <= breakpoints.mobile) return 1
    if (width <= breakpoints.tablet) return 2
    return columns
  }

  // 等待所有图片加载完成
  const waitForImages = async (): Promise<void> => {
    await nextTick()
    const images = document.querySelectorAll(`${containerSelector} img`)
    if (images.length === 0) {
      return Promise.resolve()
    }

    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if ((img as HTMLImageElement).complete) {
          resolve()
        } else {
          img.addEventListener('load', () => resolve())
          img.addEventListener('error', () => resolve()) // 即使图片加载失败也继续
        }
      })
    })

    return Promise.all(imagePromises).then(() => { })
  }

  // 核心瀑布流布局函数
  const waterfallLayout = () => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const items = Array.from(container.children) as HTMLElement[]
    if (items.length === 0) return

    const containerWidth = container.clientWidth
    const cols = getColumns()
    const columnWidth = (containerWidth - gap * (cols - 1)) / cols

    // 初始化列高度数组
    const columnsHeight = new Array(cols).fill(0)

    items.forEach((item) => {
      // 找到高度最小的列
      const minHeight = Math.min(...columnsHeight)
      const columnIndex = columnsHeight.indexOf(minHeight)

      // 设置元素位置
      item.style.width = `${columnWidth}px`
      item.style.position = 'absolute'
      item.style.left = `${columnIndex * (columnWidth + gap)}px`
      item.style.top = `${minHeight}px`

      // 更新列高度
      columnsHeight[columnIndex] = minHeight + item.offsetHeight + gap
    })

    // 设置容器高度
    const containerHeight = Math.max(...columnsHeight)
      ; (container as HTMLElement).style.height = `${containerHeight}px`

    // 标记布局已准备好
    if (!isLayoutReady.value) {
      isLayoutReady.value = true
    }
  }

  // 防抖包装的布局函数
  const debouncedLayout = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      waterfallLayout()
    }, debounceDelay)
  }

  // 完整的布局执行函数（包含图片等待）
  const waterfall = async () => {
    isLayoutReady.value = false
    await waitForImages()
    waterfallLayout()
  }

  // 初始化监听
  const initListeners = () => {
    const container = document.querySelector(containerSelector) as HTMLElement

    if (container) {
      useResizeObserver(container, debouncedLayout)
    }

    useEventListener(window, 'resize', debouncedLayout)
  }

  return {
    waterfall,        // 完整的布局函数（异步，包含图片等待）
    waterfallLayout,  // 同步布局函数（不等待图片）
    debouncedLayout,  // 防抖布局函数
    isLayoutReady,    // 布局准备状态
    initListeners,    // 初始化监听器
    waitForImages     // 图片等待函数
  }
}
