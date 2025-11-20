<script setup lang="ts">
import { ref, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { login, register, forgotPassword, resetPassword } from '@/api/user'
import { setTokens } from '@/utils/auth'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'loginSuccess': []
}>()

// 模式切换
const mode = ref<'login' | 'register' | 'forgot'>('login')

// 统一表单数据
const formData = ref({
  email: '',
  nickname: '',
  password: '',
  website: '',
  code: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证码相关
const sendingCode = ref(false)
const countdown = ref(0)

// 使用 VueUse 管理倒计时
const { pause: pauseCountdown, resume: startCountdown } = useIntervalFn(() => {
  if (--countdown.value <= 0) {
    pauseCountdown()
  }
}, 1000, { immediate: false })

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  clearMessages()
}

const closeModal = () => {
  emit('update:modelValue', false)
  pauseCountdown()
  setTimeout(() => {
    formData.value = { email: '', nickname: '', password: '', website: '', code: '' }
    confirmPassword.value = ''
    clearMessages()
    countdown.value = 0
    mode.value = 'login'
  }, 300)
}

// 发送验证码
const sendCode = async () => {
  if (!formData.value.email.trim()) {
    errorMessage.value = '请输入邮箱'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errorMessage.value = '请输入正确的邮箱格式'
    return
  }
  sendingCode.value = true
  clearMessages()
  try {
    await forgotPassword({ email: formData.value.email })
    successMessage.value = '验证码已发送'
    countdown.value = 60
    startCountdown()
    setTimeout(() => successMessage.value = '', 2000)
  } catch (error: any) {
    errorMessage.value = error.message || error.response?.data?.message || '发送失败'
  } finally {
    sendingCode.value = false
  }
}

// 统一提交处理
const handleSubmit = async () => {
  const { email, nickname, password, website, code } = formData.value

  // 邮箱验证
  if (!email.trim()) {
    errorMessage.value = '请输入邮箱'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage.value = '请输入正确的邮箱格式'
    return
  }

  // 登录模式：只验证密码是否为空
  if (mode.value === 'login') {
    if (!password.trim()) {
      errorMessage.value = '请输入密码'
      return
    }
  }

  // 注册模式的验证
  if (mode.value === 'register') {
    if (!nickname.trim()) {
      errorMessage.value = '请输入昵称'
      return
    }
    if (nickname.trim().length < 2) {
      errorMessage.value = '昵称至少需要2个字符'
      return
    }
    if (nickname.trim().length > 32) {
      errorMessage.value = '昵称不能超过32个字符'
      return
    }

    if (!password.trim()) {
      errorMessage.value = '请输入密码'
      return
    }
    if (password.length < 6) {
      errorMessage.value = '密码长度不能少于6位'
      return
    }
    if (password.length > 32) {
      errorMessage.value = '密码长度不能超过32位'
      return
    }

    if (password !== confirmPassword.value) {
      errorMessage.value = '两次密码输入不一致'
      return
    }

    if (website && !/^https?:\/\/.+/.test(website.trim())) {
      errorMessage.value = '网站地址格式不正确，请以 http:// 或 https:// 开头'
      return
    }
  }

  // 找回密码模式的验证
  if (mode.value === 'forgot') {
    if (!password.trim()) {
      errorMessage.value = '请输入密码'
      return
    }
    if (password.length < 6) {
      errorMessage.value = '密码长度不能少于6位'
      return
    }
    if (password.length > 32) {
      errorMessage.value = '密码长度不能超过32位'
      return
    }

    if (password !== confirmPassword.value) {
      errorMessage.value = '两次密码输入不一致'
      return
    }

    if (!code.trim()) {
      errorMessage.value = '请输入验证码'
      return
    }
  }

  loading.value = true
  clearMessages()

  try {
    let response
    if (mode.value === 'login') {
      response = await login({ email, password })
      setTokens(response.access_token, response.refresh_token)
      emit('loginSuccess')
      closeModal()
    } else if (mode.value === 'register') {
      response = await register({ email, nickname, password, website })
      setTokens(response.access_token, response.refresh_token)
      emit('loginSuccess')
      closeModal()
    } else {
      await resetPassword({ email, code, password })
      successMessage.value = '密码重置成功'
      setTimeout(() => {
        mode.value = 'login'
        clearMessages()
      }, 2000)
    }
  } catch (error: any) {
    errorMessage.value = error.message || error.response?.data?.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 按 ESC 键关闭
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="closeModal">
            <i class="ri-close-line"></i>
          </button>

          <!-- 标题 -->
          <div class="modal-header">
            <i
              :class="mode === 'login' ? 'ri-user-line' : mode === 'register' ? 'ri-user-add-line' : 'ri-lock-password-line'"></i>
            <h2>{{ mode === 'login' ? '欢迎回来' : mode === 'register' ? '创建账户' : '找回密码' }}</h2>
            <p>{{ mode === 'login' ? '登录到您的账户' : mode === 'register' ? '注册一个新账户' : '输入邮箱获取验证码并设置新密码' }}</p>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="login-form" novalidate>
            <!-- 邮箱（登录） -->
            <div v-if="mode === 'login'" class="form-group">
              <label><i class="ri-mail-line"></i> 邮箱</label>
              <input v-model="formData.email" type="email" placeholder="请输入邮箱" :disabled="loading"
                autocomplete="email" />
            </div>

            <!-- 邮箱（注册 - 第一行） -->
            <div v-if="mode === 'register'" class="form-group">
              <label><i class="ri-mail-line"></i> 邮箱</label>
              <input v-model="formData.email" type="email" placeholder="请输入邮箱" :disabled="loading" required
                autocomplete="email" />
            </div>

            <!-- 昵称和网站地址（注册 - 第二行并排显示） -->
            <div v-if="mode === 'register'" class="form-row">
              <div class="form-group">
                <label><i class="ri-user-line"></i> 昵称</label>
                <input v-model="formData.nickname" type="text" placeholder="请输入昵称" :disabled="loading" required />
              </div>
              <div class="form-group">
                <label><i class="ri-global-line"></i> 网站地址（可选）</label>
                <input v-model="formData.website" type="url" placeholder="https://example.com" :disabled="loading" />
              </div>
            </div>

            <!-- 邮箱（找回密码） -->
            <div v-if="mode === 'forgot'" class="form-group">
              <label><i class="ri-mail-line"></i> 邮箱地址</label>
              <div class="email-input-group">
                <input v-model="formData.email" type="email" placeholder="请输入注册邮箱" :disabled="loading || sendingCode" />
                <button type="button" class="send-code-btn" @click="sendCode"
                  :disabled="sendingCode || countdown > 0 || loading">
                  <i v-if="sendingCode" class="ri-loader-4-line spin"></i>
                  {{ sendingCode ? '发送中' : countdown > 0 ? `${countdown}s` : '发送验证码' }}
                </button>
              </div>
            </div>

            <!-- 验证码 -->
            <div v-if="mode === 'forgot'" class="form-group">
              <label><i class="ri-shield-check-line"></i> 验证码</label>
              <input v-model="formData.code" type="text" placeholder="请输入邮件中的验证码" :disabled="loading" />
            </div>

            <!-- 密码 -->
            <div class="form-group">
              <label><i class="ri-lock-line"></i> {{ mode === 'forgot' ? '新密码' : '密码' }}</label>
              <div class="password-input">
                <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                  :placeholder="mode === 'login' ? '请输入密码' : '请输入密码（至少6位）'" :disabled="loading" />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
            </div>

            <!-- 确认密码 -->
            <div v-if="mode !== 'login'" class="form-group">
              <label><i class="ri-lock-line"></i> 确认密码</label>
              <div class="password-input">
                <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="请再次输入密码"
                  :disabled="loading" />
                <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                  <i :class="showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
            </div>

            <!-- 忘记密码链接 -->
            <div v-if="mode === 'login'" class="forgot-link">
              <a @click.prevent="mode = 'forgot'">忘记密码？</a>
            </div>

            <!-- 提示信息 -->
            <Transition name="fade">
              <div v-if="errorMessage" class="message error">
                <i class="ri-error-warning-line"></i>{{ errorMessage }}
              </div>
              <div v-else-if="successMessage" class="message success">
                <i class="ri-checkbox-circle-line"></i>{{ successMessage }}
              </div>
            </Transition>

            <!-- 提交按钮 -->
            <button type="submit" class="submit-btn" :disabled="loading">
              <i v-if="loading" class="ri-loader-4-line spin"></i>
              {{ loading ? '处理中...' : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码' }}
            </button>
          </form>

          <!-- 底部链接 -->
          <div class="modal-footer">
            <span>{{ mode === 'login' ? '还没有账号？' : mode === 'register' ? '已有账号？' : '想起密码了？' }}</span>
            <a @click.prevent="mode === 'login' ? toggleMode() : mode = 'login'">
              {{ mode === 'login' ? '立即注册' : mode === 'register' ? '立即登录' : '返回登录' }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background-color: var(--flec-card-bg);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 580px;
  padding: 2.5rem;
  position: relative;
  animation: slideUp 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--font-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;

  &:hover {
    background-color: var(--flec-heavy-bg);
    transform: rotate(90deg);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;

  i {
    font-size: 3rem;
    color: var(--theme-color);
    margin-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--font-color);
  }

  p {
    color: var(--theme-meta-color);
    font-size: 0.95rem;
    margin: 0;
  }
}

.login-form {
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .form-group {
      flex: 1;
      margin-bottom: 0;
    }
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--font-color);
      margin-bottom: 0.5rem;

      i {
        font-size: 1rem;
      }
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--flec-border);
      border-radius: 0.5rem;
      font-size: 1rem;
      color: var(--font-color);
      background-color: var(--flec-heavy-bg);
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--theme-color);
        box-shadow: 0 0 0 3px rgba(73, 177, 245, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .password-input {
    position: relative;

    input {
      padding-right: 3rem;
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--theme-meta-color);
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.3s ease;

      &:hover {
        color: var(--theme-color);
      }

      i {
        font-size: 1.25rem;
      }
    }
  }

  .forgot-link {
    text-align: right;
    margin: -0.5rem 0 0.5rem;

    a {
      color: var(--theme-color);
      font-size: 0.9rem;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .email-input-group {
    display: flex;
    gap: 0.5rem;

    input {
      flex: 1;
    }

    .send-code-btn {
      padding: 0.75rem 1rem;
      background: var(--theme-color);
      color: var(--font-light-color);
      border: none;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      white-space: nowrap;
      cursor: pointer;

      &:hover:not(:disabled) {
        opacity: 0.85;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    margin-bottom: 1rem;

    &.error {
      background: #fef2f2;
      color: #dc2626;
    }

    &.success {
      background: #f0fdf4;
      color: #16a34a;
    }
  }

  .submit-btn {
    width: 100%;
    padding: 0.875rem;
    background: var(--theme-color);
    color: var(--font-light-color);
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    i {
      margin-right: 0.5rem;
    }
  }
}

.modal-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--theme-meta-color);

  a {
    color: var(--theme-color);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 动画
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

// 过渡动画
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: all 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.9) translateY(20px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 响应式设计
@media screen and (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
  }

  .modal-container {
    padding: 1.5rem 1.2rem;
    max-width: 420px;
    max-height: calc(100vh - 1rem);
    overflow-y: auto;
    margin-top: 0.5rem;

    // 优化滚动体验
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--flec-border, #e5e7eb);
      border-radius: 2px;
    }
  }

  .close-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.1rem;
  }

  .modal-header {
    margin-bottom: 1.25rem;

    i {
      font-size: 2.25rem;
      margin-bottom: 0.25rem;
    }

    h2 {
      font-size: 1.35rem;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.85rem;
    }
  }

  .login-form {
    .form-row {
      flex-direction: column;
      gap: 0;
      margin-bottom: 0;

      .form-group {
        margin-bottom: 1rem;
      }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        font-size: 0.85rem;
        margin-bottom: 0.4rem;
        gap: 0.35rem;

        i {
          font-size: 0.9rem;
        }
      }

      input {
        padding: 0.65rem 0.85rem;
        font-size: 0.95rem;
      }
    }

    .password-input {
      .toggle-password {
        right: 0.5rem;
        padding: 0.4rem;

        i {
          font-size: 1.1rem;
        }
      }
    }

    .forgot-link {
      margin: -0.25rem 0 0.5rem;

      a {
        font-size: 0.85rem;
      }
    }

    .email-input-group {
      gap: 0.4rem;

      .send-code-btn {
        padding: 0.65rem 0.75rem;
        font-size: 0.85rem;
      }
    }

    .message {
      padding: 0.65rem 0.85rem;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .submit-btn {
      padding: 0.75rem;
      font-size: 0.95rem;
    }
  }

  .modal-footer {
    margin-top: 1rem;
    font-size: 0.85rem;
  }
}
</style>
