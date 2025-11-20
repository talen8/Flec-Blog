<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { formatDate } from '@/utils/date'
import { renderSimpleMarkdown } from '@/utils/markdown'
import { useCommentContext } from '@/composables/useComment'
import { scrollToElement } from '@/utils/scroll'
import type { Comment } from '@/types/comment'
import CommentInput from './CommentInput.vue'

interface Props {
  comment: Comment
  depth: number
}

const props = defineProps<Props>()
const context = useCommentContext()

// 是否正在回复此评论
const isReplying = computed(() =>
  context.replyState.replyingToId.value === props.comment.id
)

// 渲染评论内容为markdown
const renderedContent = computed(() =>
  renderSimpleMarkdown(props.comment.content)
)

// 处理回复按钮点击
const handleReplyClick = () => {
  const wasReplying = isReplying.value
  context.replyState.startReply(props.comment.id, props.comment.user.nickname)

  // 如果是展开回复（而不是取消回复），则滚动到输入框
  if (!wasReplying) {
    nextTick(() => {
      scrollToElement(`#reply-input-${props.comment.id}`)
    })
  }
}

// 获取头像URL
const getAvatarUrl = (user: Comment['user']) => {
  // 如果有自定义头像，使用自定义头像
  if (user.avatar) return user.avatar
  // 使用邮箱hash生成 Cravatar robohash 头像
  return `https://cravatar.cn/avatar/${user.email_hash}?d=robohash&s=48`
}
</script>

<template>
  <div class="comment-item" :class="{ 'is-reply': depth > 0 }" :id="`comment-${comment.id}`">
    <!-- 左：头像 -->
    <div class="comment-left">
      <img :src="getAvatarUrl(comment.user)" :alt="comment.user.nickname" class="comment-avatar">
    </div>

    <!-- 右：上中下 -->
    <div class="comment-right">
      <!-- 上：昵称、时间、系统信息 -->
      <div class="comment-header">
        <span class="comment-author">
          {{ comment.user.nickname }}
          <span v-if="comment.reply_user" class="reply-arrow">
            <i class="ri-arrow-right-s-fill"></i>
            {{ comment.reply_user.nickname }}
          </span>
        </span>
        <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
        <span v-if="comment.location" class="comment-meta">{{ comment.location }}</span>
        <span v-if="comment.os" class="comment-meta">{{ comment.os }}</span>
        <span v-if="comment.browser" class="comment-meta">{{ comment.browser }}</span>
      </div>

      <!-- 中：内容 -->
      <div class="comment-body markdown-body" v-html="renderedContent"></div>

      <!-- 下：功能按钮 -->
      <div class="comment-actions">
        <button class="action-btn" @click="handleReplyClick" aria-label="回复评论">
          回复
        </button>
      </div>

      <!-- 回复输入框 -->
      <div v-if="isReplying" :id="`reply-input-${comment.id}`" class="reply-input-wrapper">
        <CommentInput :comment-id="comment.id" :reply-to="context.replyState.replyingToNickname.value" />
      </div>

      <!-- 子评论插槽 -->
      <slot name="replies"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  gap: 10px;

  &.is-reply {
    padding: 10px 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--flec-border-color);
    }
  }
}

.comment-left {
  flex-shrink: 0;
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.comment-right {
  flex: 1;
  min-width: 0;
  margin-left: 5px;
}

.comment-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
  margin-top: 5px;
  gap: 8px;
}

.comment-author {
  color: var(--theme-color);
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  line-height: 1;

  .reply-arrow {
    display: inline-flex;
    align-items: center;

    i {
      color: var(--theme-meta-color);
      font-size: 1rem;
      line-height: 1;
      display: inline-block;
      margin: 0 2px;
    }
  }
}

.comment-time {
  color: var(--theme-meta-color);
  font-size: 0.85rem;
  white-space: nowrap;
  line-height: 1;
}

.comment-meta {
  color: var(--theme-meta-color);
  font-size: 0.85rem;
  white-space: nowrap;
  line-height: 1;
  position: relative;
  padding-left: 12px;

  &::before {
    content: '·';
    position: absolute;
    left: 0;
    color: var(--font-color);
    opacity: 0.5;
  }
}

.comment-body {
  color: var(--font-color);
  line-height: 1.5;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: var(--theme-meta-color);
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  i {
    font-size: 0.95rem;
  }
}

.reply-input-wrapper {
  margin-top: 12px;
}

.replies-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--flec-border-color);
}

@media screen and (max-width: 768px) {
  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 6px;
  }

  .comment-header {
    gap: 6px;
  }

  .comment-author {
    font-size: 0.85rem;

    .reply-arrow {
      display: block;
      margin: 2px 0;
    }
  }

  .comment-time {
    font-size: 0.75rem;
  }

  .comment-meta {
    font-size: 0.75rem;
  }

  .comment-body {
    font-size: 0.85rem;
  }

  .action-btn {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
}
</style>
