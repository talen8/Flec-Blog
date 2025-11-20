<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useMoments } from '@/composables/useStores'
import { formatMomentTime } from '@/utils/date'
import type { MomentMusic, Moment } from '@/types/moment'
import APlayer from 'aplayer'
import 'aplayer/dist/APlayer.min.css'
import Comments from '@/components/features/comment/Comments.vue'
import { fillComment } from '@/composables/useComment'
import { useAdvancedWaterfall } from '@/composables/useWaterfall'

const { moments, fetchMoments } = useMoments()

// 音乐播放器实例
const musicPlayers = ref<Map<number, any>>(new Map())

// 图片预览
const showPreview = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)

// 增强版瀑布流
const { waterfall, isLayoutReady, initListeners } = useAdvancedWaterfall({
  containerSelector: '#moment-list',
  columns: 3,
  gap: 15,
  debounceDelay: 150,
  breakpoints: {
    mobile: 768,
    tablet: 1200
  }
})

onMounted(async () => {
  // 加载动态数据
  await fetchMoments()

  // 等待 DOM 更新
  await nextTick()

  // 初始化音乐播放器
  await initAllMusicPlayers()

  // 执行瀑布流布局（会自动等待图片加载）
  await waterfall()

  // 初始化监听器
  initListeners()
})

onUnmounted(() => {
  // 销毁所有音乐播放器
  musicPlayers.value.forEach(player => player.destroy())
  musicPlayers.value.clear()
})

// 监听动态列表变化，重新计算布局和初始化音乐播放器
watch(() => moments.value.length, async () => {
  await nextTick()
  await initAllMusicPlayers()
  await waterfall()
})

const formatTime = (time: string) => {
  return formatMomentTime(time)
}

// 生成动态引用文本
const generateMomentQuote = (moment: Moment) => {
  let quote = ''

  if (moment.content.text) {
    // 限制引用文本长度
    const text = moment.content.text.length > 100
      ? moment.content.text.substring(0, 100) + '...'
      : moment.content.text
    quote = `> ${text}\n\n`
  } else {
    quote = `> [${getMomentContentType(moment)}]\n\n`
  }

  return quote
}

// 获取动态内容类型描述
const getMomentContentType = (moment: Moment) => {
  if (moment.content.images?.length) return '图片动态'
  if (moment.content.video) return '视频动态'
  if (moment.content.music) return '音乐动态'
  if (moment.content.link) return '链接分享'
  return '动态'
}

// 引用动态内容进行评论
const handleCommentClick = (moment: Moment) => {
  fillComment(generateMomentQuote(moment))
}

const previewImage = (images: string[], index: number) => {
  previewImages.value = images
  previewIndex.value = index
  showPreview.value = true
  document.body.style.overflow = 'hidden'
}

// 音乐相关函数
const fetchMusicData = async (music: MomentMusic) => {
  try {
    const apiUrl = `https://api.i-meto.com/meting/api?server=${music.server}&type=${music.type}&id=${music.id}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  } catch (error) {
    console.error('获取音乐信息失败:', error)
    return []
  }
}

const initMusicPlayer = async (momentId: number, music: MomentMusic) => {
  // 如果已经初始化过，先销毁
  if (musicPlayers.value.has(momentId)) {
    musicPlayers.value.get(momentId)?.destroy()
    musicPlayers.value.delete(momentId)
  }

  // 获取音乐数据
  const musicData = await fetchMusicData(music)
  if (musicData.length === 0) return

  // 等待 DOM 更新
  await nextTick()

  const container = document.querySelector(`#music-player-${momentId}`)
  if (!container) return

  try {
    const player = new APlayer({
      container: container as HTMLElement,
      theme: '#49B1F5',
      listMaxHeight: 90,
      lrcType: 3,
      audio: musicData.map((item: any) => ({
        name: item.name || item.title || '未知歌曲',
        artist: item.artist || item.author || '未知艺术家',
        url: item.url,
        cover: item.pic || item.cover || '',
        lrc: item.lrc,
      }))
    })

    musicPlayers.value.set(momentId, player)
  } catch (error) {
    console.error('初始化音乐播放器失败:', error)
  }
}

const initAllMusicPlayers = async () => {
  for (const moment of moments.value) {
    if (moment.content.music) {
      await initMusicPlayer(moment.id, moment.content.music)
    }
  }
}
</script>

<template>
  <div id="moment-page">
    <div class="page-title">动态</div>

    <div v-if="moments.length === 0" class="empty-state">
      <i class="ri-chat-3-line"></i>
      <p>暂无动态</p>
    </div>

    <div v-else id="moment-list" class="moment-list">
      <div v-for="moment in moments" :key="moment.id" class="moment-item" :class="{ 'layout-ready': isLayoutReady }">
        <!-- 上部分：头像、作者、时间 -->
        <div class="moment-header">
          <div class="moment-avatar">
            <img src="@/assets/img/avatar.png" alt="avatar" />
          </div>
          <div class="moment-meta">
            <div class="moment-author">M.Talen</div>
            <div class="moment-time">{{ formatTime(moment.publish_time) }}</div>
          </div>
        </div>

        <!-- 中部分：内容 -->
        <div class="moment-content">
          <!-- 文本内容 -->
          <div v-if="moment.content.text" class="moment-text">
            {{ moment.content.text }}
          </div>

          <!-- 图片内容 -->
          <div v-if="moment.content.images && moment.content.images.length > 0" class="moment-images"
            :class="`images-${Math.min(moment.content.images.length, 6)}`">
            <div v-for="(image, index) in moment.content.images.slice(0, 6)" :key="index" class="image-item"
              @click="previewImage(moment.content.images!, index)">
              <img :src="image" :alt="`图片 ${index + 1}`" loading="lazy" />
              <!-- 第6张图片且有更多图片时显示剩余数量 -->
              <div v-if="index === 5 && moment.content.images.length > 6" class="more-images-overlay">
                <i class="ri-image-line"></i>
                <span>+{{ moment.content.images.length - 6 }}</span>
              </div>
            </div>
          </div>

          <!-- 视频内容 -->
          <div v-if="moment.content.video" class="moment-video">
            <video v-if="!moment.content.video.platform || moment.content.video.platform === 'local'"
              :src="moment.content.video.url" controls preload="metadata"></video>

            <iframe v-else-if="moment.content.video.platform === 'bilibili'"
              :src="`//player.bilibili.com/player.html?bvid=${moment.content.video.video_id}&autoplay=0`" scrolling="no"
              border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

            <iframe v-else-if="moment.content.video.platform === 'youtube'"
              :src="`https://www.youtube.com/embed/${moment.content.video.video_id}`" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>

          <!-- 音乐内容 -->
          <div v-if="moment.content.music" :id="`music-player-${moment.id}`" class="moment-music"></div>

          <!-- 链接内容 -->
          <a v-if="moment.content.link" :href="moment.content.link.url" target="_blank" rel="noopener noreferrer"
            class="moment-link">
            <img v-if="moment.content.link.favicon" :src="moment.content.link.favicon" alt="favicon"
              class="link-favicon" />
            <div class="link-info">
              <div class="link-title">{{ moment.content.link.title }}</div>
              <div class="link-url">{{ moment.content.link.url }}</div>
            </div>
            <i class="ri-external-link-line"></i>
          </a>
        </div>

        <!-- 下部分：位置、分类标签、评论按钮 -->
        <div class="moment-footer">
          <div class="moment-info">
            <span v-if="moment.content.location" class="location">
              <i class="ri-map-pin-line"></i>
              {{ moment.content.location }}
            </span>
            <span v-if="moment.content.tags" class="tags">
              <i class="ri-price-tag-3-line"></i>
              {{ moment.content.tags }}
            </span>
          </div>
          <div class="moment-actions">
            <button class="comment-btn" @click="handleCommentClick(moment)" title="评论此动态">
              <i class="ri-chat-3-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div v-if="moments.length > 0" class="moment-tip">
      <i class="ri-information-line"></i>
      <span>只显示最近30条动态</span>
    </div>

    <!-- 评论区域 -->
    <Comments target-type="page" target-key="moment" />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

#moment-page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;

  .page-title {
    margin: 0 0 10px;
    font-weight: bold;
    font-size: 2rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--theme-meta-color);

    i {
      font-size: 4rem;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
      margin: 0;
    }
  }

  .moment-list {
    position: relative;
    width: 100%;
  }

  .moment-item {
    @extend .cardHover;
    position: absolute;
    padding: 0;
    overflow: hidden;
    opacity: 0;

    &.layout-ready {
      opacity: 1;
    }
  }

  // 上部分：头像、作者、时间
  .moment-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--flec-moment-divider);

    .moment-avatar {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      overflow: hidden;
      margin-right: 12px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .moment-meta {
      flex: 1;
      min-width: 0;

      .moment-author {
        font-weight: 600;
        color: var(--flec-moment-title);
      }

      .moment-time {
        font-size: 0.875rem;
        color: var(--flec-moment-date);
      }
    }
  }

  // 中部分：内容
  .moment-content {
    padding: 15px 20px;
    border-bottom: 1px solid var(--flec-moment-divider);

    .moment-text {
      line-height: 1.7;
      color: var(--flec-moment-font);
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .moment-images {
      display: grid;
      gap: 6px;
      margin-top: 12px;

      // 1张图片：100%宽，高度自动
      &.images-1 {
        grid-template-columns: 1fr;

        .image-item {
          padding-bottom: 0;
          height: auto;

          img {
            position: relative;
            height: auto;
            max-height: 500px;
          }
        }
      }

      // 2张图片：一行2个
      &.images-2 {
        grid-template-columns: repeat(2, 1fr);
      }

      // 3张图片：一行3个
      &.images-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      // 4张图片：2+2结构
      &.images-4 {
        grid-template-columns: repeat(2, 1fr);
      }

      // 5张图片：2+3结构
      &.images-5 {
        grid-template-columns: repeat(6, 1fr);

        .image-item:nth-child(1),
        .image-item:nth-child(2) {
          grid-column: span 3;
        }

        .image-item:nth-child(n+3) {
          grid-column: span 2;
        }
      }

      // 6张图片：3+3结构
      &.images-6 {
        grid-template-columns: repeat(3, 1fr);
      }

      .image-item {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        overflow: hidden;
        border-radius: 6px;
        cursor: pointer;
        background: #f5f5f5;
        transition: transform 0.3s ease;

        &:hover {
          transform: translate3d(0, -2px, 0) scale(1.02);
        }

        img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        // 剩余图片数量覆盖层
        .more-images-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-weight: 600;
          border-radius: 6px;
          backdrop-filter: blur(2px);
          transition: background 0.3s ease;
        }

        &:hover .more-images-overlay {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .moment-video {
      margin-top: 12px;
      border-radius: 6px;
      overflow: hidden;
      background: #000;
      transition: transform 0.3s ease;

      video,
      iframe {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        border: none;
        display: block;
      }

      &:hover {
        transform: translate3d(0, -2px, 0) scale(1.02);
      }
    }

    .moment-music {
      margin-top: 12px;
      transition: transform 0.3s ease;

      &:hover {
        transform: translate3d(0, -2px, 0) scale(1.02);
      }
    }

    .moment-link {
      display: flex;
      align-items: center;
      margin-top: 12px;
      padding: 12px;
      background: var(--flec-moment-card-bg);
      border-radius: 6px;
      text-decoration: none;
      color: var(--flec-moment-font);
      transition: transform 0.3s ease;

      .link-favicon {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        margin-right: 12px;
        border-radius: 4px;
      }

      .link-info {
        flex: 1;
        min-width: 0;

        .link-title {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .link-url {
          font-size: 0.75rem;
          color: var(--flec-moment-date);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      i {
        margin-left: 10px;
        font-size: 1.1rem;
        color: var(--flec-moment-date);
      }

      &:hover {
        transform: translate3d(0, -2px, 0) scale(1.02);
      }
    }
  }

  // 下部分：位置、分类标签、评论按钮
  .moment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;

    .moment-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      color: var(--flec-moment-date);

      .location {
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          font-size: 0.9rem;
        }
      }
    }

    .moment-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .comment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: var(--flec-moment-date);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          background: var(--flec-moment-card-bg);
          color: #49b1f5;
        }
      }
    }
  }

  .moment-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 30px;
    padding: 15px 20px;
    text-align: center;

    i {
      font-size: 1.1rem;
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #moment-page {
    padding: 30px;

    .page-title {
      font-size: 1.75rem;
    }

    .moment-header {
      .moment-avatar {
        width: 45px;
        height: 45px;
      }

      .moment-meta {
        .moment-author {
          font-size: 0.95rem;
        }

        .moment-time {
          font-size: 0.8rem;
        }
      }
    }

    .moment-content {
      padding: 12px 18px;

      .moment-text {
        font-size: 0.95rem;
      }
    }

    .moment-footer {
      padding: 8px 18px;

      .moment-info {
        font-size: 0.8rem;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  #moment-page {
    padding: 18px;

    .page-title {
      font-size: 1.4rem;
      margin-bottom: 8px;
    }

    .moment-header {
      padding: 0.4rem 0.8rem;

      .moment-avatar {
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }

      .moment-meta {
        .moment-author {
          font-size: 0.9rem;
        }

        .moment-time {
          font-size: 0.75rem;
        }
      }
    }

    .moment-content {
      padding: 10px 14px;

      .moment-text {
        font-size: 0.9rem;
        line-height: 1.6;
      }

      .moment-images {
        gap: 4px;
        margin-top: 10px;

        // 在移动端，5张图片改为 2+3 结构
        &.images-5 {
          grid-template-columns: repeat(4, 1fr);

          .image-item:nth-child(1),
          .image-item:nth-child(2) {
            grid-column: span 2;
          }

          .image-item:nth-child(n+3) {
            grid-column: span 1;
          }
        }

        // 在移动端，6张图片改为 2x3 结构
        &.images-6 {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .moment-link {
        padding: 10px;

        .link-favicon {
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }

        .link-info {
          .link-title {
            font-size: 0.85rem;
          }

          .link-url {
            font-size: 0.7rem;
          }
        }

        i {
          font-size: 1rem;
        }
      }
    }

    .moment-footer {
      padding: 8px 14px;

      .moment-info {
        font-size: 0.75rem;
        gap: 10px;
        flex-wrap: wrap;

        .location,
        .tags {
          i {
            font-size: 0.85rem;
          }
        }
      }

      .moment-actions {
        .comment-btn {
          width: 28px;
          height: 28px;

          i {
            font-size: 1rem;
          }
        }
      }
    }

    .moment-tip {
      margin-top: 20px;
      padding: 12px 16px;
      font-size: 0.875rem;

      i {
        font-size: 1rem;
      }
    }
  }
}
</style>

<style lang="scss">
// 音乐播放器自定义样式
.aplayer.aplayer.aplayer {
  background: var(--flec-moment-card-bg) !important;
  margin: 0 !important;
  border: none !important;
  font-family: inherit !important;
  border-radius: 6px !important;

  .aplayer-pic {
    border-radius: 6px !important;
  }

  .aplayer-lrc {
    &::before {
      background: linear-gradient(180deg, var(--flec-moment-card-bg) 0, hsla(0, 0%, 100%, 0));
    }

    &::after {
      background: linear-gradient(180deg, hsla(0, 0%, 100%, 0), var(--flec-moment-card-bg) 100%);
    }
  }
}
</style>
