<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useAuth } from '@/utils/auth'
import { useToast } from '@/composables/useToast'
import { renderSimpleMarkdown } from '@/utils/markdown'
import { useCommentContext } from '@/composables/useComment'

interface Props {
  // 评论ID，如果提供则为回复模式
  commentId?: number
  // 回复的目标昵称
  replyTo?: string
}

const props = defineProps<Props>()
const { success, info } = useToast()

// 获取评论上下文
const context = useCommentContext()

// 从本地存储加载游客信息
const loadGuestInfo = () => {
  const stored = localStorage.getItem('guest_info')
  return stored ? JSON.parse(stored) : { nickname: '', email: '', website: '' }
}

// 从本地存储加载评论内容
const loadCommentContent = () => {
  return localStorage.getItem('comment_draft') || ''
}

// 状态（从本地存储初始化）
const saved = loadGuestInfo()
const nickname = ref(saved.nickname)
const email = ref(saved.email)
const website = ref(saved.website)
const commentContent = ref(loadCommentContent())

const isSubmitting = ref(false)
const showPreview = ref(false)
const showExpandedBtn = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const buttonGroupRef = ref<HTMLElement | null>(null)

// 错误提示
const errors = ref({
  nickname: '',
  email: '',
  website: '',
  content: ''
})

// 计算属性
const isLoggedIn = useAuth()
const isReplyMode = computed(() => !!props.replyTo)
const isUserInfoFilled = computed(() => nickname.value.trim() && email.value.trim())
const shouldShowSend = computed(() => isLoggedIn.value || isUserInfoFilled.value)
const mainBtn = computed(() => ({
  text: isSubmitting.value ? '发送中...' : (shouldShowSend.value ? '发送' : '登录'),
  icon: isSubmitting.value ? 'ri-loader-4-line rotating' : (shouldShowSend.value ? 'ri-send-plane-fill' : 'ri-login-box-line')
}))
const secondaryBtn = computed(() => ({
  text: isUserInfoFilled.value ? '登录' : '发送',
  icon: isUserInfoFilled.value ? 'ri-login-box-line' : 'ri-send-plane-fill'
}))
const renderedMarkdown = computed(() => renderSimpleMarkdown(commentContent.value))

// 工具函数
const resetTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const validateForm = () => {
  // 清空之前的错误
  errors.value = { nickname: '', email: '', website: '', content: '' }

  // 如果未登录，验证游客信息
  if (!isLoggedIn.value) {
    // 验证昵称
    if (!nickname.value.trim()) {
      errors.value.nickname = '请输入昵称'
      return false
    }
    if (nickname.value.trim().length < 2) {
      errors.value.nickname = '昵称至少需要2个字符'
      return false
    }
    if (nickname.value.trim().length > 32) {
      errors.value.nickname = '昵称不能超过32个字符'
      return false
    }
    
    // 验证邮箱
    if (!email.value.trim()) {
      errors.value.email = '请输入邮箱'
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      errors.value.email = '请输入正确的邮箱格式'
      return false
    }
    
    // 验证网站地址格式（选填）
    if (website.value.trim() && !/^https?:\/\/.+/.test(website.value.trim())) {
      errors.value.website = '网站地址格式不正确'
      return false
    }
  }

  // 验证评论内容
  if (!commentContent.value.trim()) {
    errors.value.content = '请输入评论内容'
    return false
  }

  return true
}

// 清除特定字段的错误
const clearError = (field: 'nickname' | 'email' | 'website' | 'content') => {
  errors.value[field] = ''
}

// 事件处理
const handleSubmitComment = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const content = commentContent.value.trim()

    // 准备游客信息（如果未登录）
    const guestInfo = !isLoggedIn.value ? {
      nickname: nickname.value.trim(),
      email: email.value.trim(),
      website: website.value.trim() || undefined
    } : undefined

    // 根据是否为回复模式调用不同的方法
    if (isReplyMode.value && props.commentId) {
      await context.addReply(props.commentId, content, guestInfo)
    } else {
      await context.addComment(content, guestInfo)
    }

    // 保存游客信息到本地存储
    if (!isLoggedIn.value) {
      localStorage.setItem('guest_info', JSON.stringify({
        nickname: nickname.value.trim(),
        email: email.value.trim(),
        website: website.value.trim()
      }))
    }

    commentContent.value = ''
    resetTextareaHeight()

    success('评论发表成功')
  } catch (error: any) {
    const errorMsg = error.message || error.response?.data?.message || '评论发表失败'
    errors.value.email = errorMsg
  } finally {
    isSubmitting.value = false
  }
}

const handleLogin = () => context.showLogin()

const handleMainAction = () => shouldShowSend.value ? handleSubmitComment() : handleLogin()

const handleSecondaryAction = (event: Event) => {
  event.stopPropagation()
  showExpandedBtn.value = false
  isUserInfoFilled.value ? handleLogin() : handleSubmitComment()
}

const toggleExpandedBtn = (event: Event) => {
  event.stopPropagation()
  showExpandedBtn.value = !showExpandedBtn.value
}

const togglePreview = () => showPreview.value = !showPreview.value

const handleCancelReply = () => {
  context.replyState.cancelReply()
  commentContent.value = ''
  resetTextareaHeight()
}

// 实时保存评论内容到本地存储
watch(commentContent, (newContent) => {
  if (newContent) {
    localStorage.setItem('comment_draft', newContent)
  } else {
    localStorage.removeItem('comment_draft')
  }
})

// 点击外部关闭扩展按钮
onClickOutside(buttonGroupRef, () => {
  showExpandedBtn.value = false
})
</script>

<template>
  <div class="comment-input" :class="{ 'reply-mode': isReplyMode }">
    <div v-if="!isLoggedIn" class="user-info-row">
      <div class="input-wrapper">
        <input v-model="nickname" type="text" placeholder="昵称 *" :disabled="isSubmitting"
          :class="{ error: errors.nickname }" @input="clearError('nickname')" />
        <transition name="fade">
          <div v-if="errors.nickname" class="error-tooltip">{{ errors.nickname }}</div>
        </transition>
      </div>
      <div class="input-wrapper">
        <input v-model="email" type="email" placeholder="邮箱 *" :disabled="isSubmitting" :class="{ error: errors.email }"
          @input="clearError('email')" />
        <transition name="fade">
          <div v-if="errors.email" class="error-tooltip">{{ errors.email }}</div>
        </transition>
      </div>
      <div class="input-wrapper">
        <input v-model="website" type="url" placeholder="网址" :disabled="isSubmitting" :class="{ error: errors.website }"
          @input="clearError('website')" />
        <transition name="fade">
          <div v-if="errors.website" class="error-tooltip">{{ errors.website }}</div>
        </transition>
      </div>
    </div>

    <div class="editor-container">
      <textarea ref="textareaRef" v-model="commentContent" placeholder="写下你的评论...支持 Markdown 语法" rows="3"
        :disabled="isSubmitting" :class="{ error: errors.content }" @input="clearError('content'); resetTextareaHeight()" />
      <transition name="fade">
        <div v-if="errors.content" class="error-tooltip content-error">{{ errors.content }}</div>
      </transition>
      <transition name="expand">
        <div v-if="showPreview" class="preview-area markdown-body"
          v-html="renderedMarkdown || '<p class=\'empty-hint\'>暂无内容</p>'"></div>
      </transition>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <div v-if="isReplyMode" class="reply-tag">
          <span class="reply-tag-text">回复 {{ replyTo }}</span>
          <button class="reply-tag-close" @click="handleCancelReply" :disabled="isSubmitting" aria-label="取消回复">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <button class="tool-btn" @click="info('表情功能开发中')" title="表情" aria-label="插入表情" :disabled="isSubmitting">
          <i class="ri-emotion-line"></i>
        </button>
        <button class="tool-btn" @click="info('图片上传功能开发中')" title="图片" aria-label="上传图片" :disabled="isSubmitting">
          <i class="ri-image-line"></i>
        </button>
        <button class="tool-btn" @click="togglePreview" :title="showPreview ? '编辑' : 'Markdown预览'"
          :aria-label="showPreview ? '切换到编辑模式' : '切换到预览模式'" :class="{ active: showPreview }" :disabled="isSubmitting">
          <i :class="showPreview ? 'ri-edit-line' : 'ri-eye-line'"></i>
        </button>
      </div>
      <div ref="buttonGroupRef" class="button-group">
        <button class="submit-btn main-btn" @click="handleMainAction" :disabled="isSubmitting"
          :aria-label="mainBtn.text">
          <i :class="mainBtn.icon"></i>{{ mainBtn.text }}
        </button>
        <template v-if="!isLoggedIn">
          <button class="submit-btn expand-btn" @click="toggleExpandedBtn" :disabled="isSubmitting" aria-label="更多选项">
            <i class="ri-more-2-fill"></i>
          </button>
          <transition name="slide-fade">
            <button v-if="showExpandedBtn" class="submit-btn secondary-btn" @click="handleSecondaryAction"
              :disabled="isSubmitting" :aria-label="secondaryBtn.text">
              <i :class="secondaryBtn.icon"></i>{{ secondaryBtn.text }}
            </button>
          </transition>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes rotating {
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotating 1s linear infinite;
}

.comment-input {
  margin-bottom: 30px;
  background: var(--flec-card-bg);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &.reply-mode {
    background: var(--flec-heavy-bg);
    margin-bottom: 0;
  }
}

input,
textarea {
  border: 1px solid transparent;
  background-color: transparent;
  border-radius: 6px;
  color: var(--font-color);
  outline: none;
  transition: border-color 0.2s;
  padding: 8px 12px;
  font-size: 0.9rem;

  &:focus {
    border-color: var(--theme-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.error {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
    }
  }
}

.user-info-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.input-wrapper {
  position: relative;
}

.error-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.85);
  }
  
  &.content-error {
    left: 20px;
    transform: translateX(0);
    
    &::after {
      left: 20px;
      transform: translateX(0);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.editor-container {
  position: relative;
  width: 100%;
}

textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: none;
  min-height: 60px;
  max-height: 300px;
  overflow-y: hidden;
  
  &.error {
    border-color: #ef4444;
    
    &:focus {
      border-color: #ef4444;
    }
  }
}

.preview-area {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  min-height: 80px;
  max-height: 300px;
  overflow-y: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.02);
  font-family: inherit;

  .empty-hint {
    color: var(--theme-meta-color);
    font-style: italic;
    margin: 0;
  }
}

// 展开动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.reply-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background: var(--flec-card-bg);
  border-radius: 6px;
  margin-right: 8px;
  border: 1px solid var(--flec-border-color);

  &-text {
    font-size: 0.85rem;
    color: var(--theme-color);
  }

  &-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--theme-meta-color);

    i {
      font-size: 1rem;
    }

    &:hover:not(:disabled) {
      background: var(--flec-bg);
      color: var(--font-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--font-color);

  i {
    font-size: 1.1rem;
  }

  &:hover:not(:disabled) {
    color: var(--theme-color);
  }

  &.active {
    color: var(--theme-color);
    background: rgba(73, 177, 245, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.button-group {
  display: flex;
  gap: 4px;
  position: relative;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  border-radius: 6px;
  background: var(--flec-btn);
  color: var(--font-light-color);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 1rem;
  }

  &:hover:not(:disabled) {
    background: var(--flec-btn-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.main-btn {
    padding: 6px 20px;
    min-width: 90px;
  }

  &.expand-btn {
    padding: 6px 8px;

    i {
      font-size: 1.1rem;
    }
  }

  &.secondary-btn {
    padding: 6px 16px;
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
}

.slide-fade {

  &-enter-active,
  &-leave-active {
    transition: all 0.2s;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(-8px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@media screen and (max-width: 768px) {
  .comment-input {
    padding: 12px;
    gap: 8px;
  }

  .user-info-row {
    grid-template-columns: 1fr;
  }
  
  .error-tooltip {
    font-size: 0.7rem;
    padding: 5px 10px;
    max-width: 90%;
  }

  input {
    font-size: 0.875rem;
  }

  textarea {
    font-size: 0.9rem;
  }

  .preview-area {
    font-size: 0.9rem;
  }

  .toolbar {
    flex-direction: column;
    gap: 10px;

    &-left {
      width: 100%;
      flex-wrap: wrap;
    }
  }

  .reply-tag {
    &-text {
      font-size: 0.8rem;
    }
  }

  .button-group {
    width: 100%;
  }

  .submit-btn {
    &.main-btn {
      flex: 1;
      justify-content: center;
      min-width: auto;
    }

    &.expand-btn {
      flex-shrink: 0;
    }

    &.secondary-btn {
      width: calc(100% - 4px);
    }
  }
}
</style>



