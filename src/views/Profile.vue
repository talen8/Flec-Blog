<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, updateUserProfile, changePassword, deactivateAccount } from '../api/user'
import { accessToken, logout } from '../utils/auth'
import { formatFriendly } from '../utils/date'
import { uploadImage } from '../utils/upload'
import { useToast } from '../composables/useToast'
import BaseDialog from '../components/ui/BaseDialog.vue'
import type { UserInfo, UserRole } from '../types/user'

const router = useRouter()
const { success: showSuccess, error: showError } = useToast()

const userInfo = ref<UserInfo | null>(null)
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showDeactivateDialog = ref(false)

// ===== 通用验证函数 =====
const validators = {
  nickname: (val: string) => {
    if (!val.trim()) return '昵称不能为空'
    if (val.length < 2 || val.length > 32) return '昵称长度需要在2-32个字符之间'
    return ''
  },
  email: (val: string) => {
    if (!val.trim()) return '邮箱不能为空'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return '请输入正确的邮箱格式'
    return ''
  },
  website: (val: string) => {
    if (val && !/^https?:\/\/.+/.test(val)) return '网站地址格式不正确，请以 http:// 或 https:// 开头'
    return ''
  },
  password: (val: string, isNew = false) => {
    if (!val) return isNew ? '请输入新密码' : '请输入密码'
    if (val.length < 6 || val.length > 32) return '密码长度需要在6-32个字符之间'
    return ''
  }
}

// ===== 基础功能 =====
const getRoleName = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户'
  }
  return roleMap[role] || role
}

const getAvatarUrl = (user: UserInfo): string => {
  if (user.avatar) return user.avatar
  return `https://cravatar.cn/avatar/${user.email_hash}?d=robohash&s=48`
}

const fetchProfile = async () => {
  const data = await getUserProfile()
  userInfo.value = data
}

const handleLogout = () => {
  logout()
  router.push('/')
}

// ===== 编辑资料对话框 =====
const editForm = ref({ nickname: '', email: '', website: '', avatar: '' })
const editLoading = ref(false)
const uploading = ref(false)
const editErrors = ref<Record<string, string>>({})

watch(showEditDialog, (val) => {
  if (val && userInfo.value) {
    editForm.value = {
      nickname: userInfo.value.nickname || '',
      email: userInfo.value.email || '',
      website: userInfo.value.website || '',
      avatar: userInfo.value.avatar || ''
    }
  }
  editErrors.value = {}
})

const handleAvatarUpload = async () => {
  if (uploading.value) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      uploading.value = true
      editErrors.value = {}
      const result = await uploadImage(file, '用户头像')
      editForm.value.avatar = result.file_url
    } catch (error: any) {
      editErrors.value.avatar = error.message || '头像上传失败'
    } finally {
      uploading.value = false
    }
  }
  input.click()
}

const handleEditSubmit = async () => {
  editErrors.value = {}
  const { nickname, email, website } = editForm.value

  const nicknameError = validators.nickname(nickname)
  if (nicknameError) return editErrors.value.nickname = nicknameError

  const emailError = validators.email(email)
  if (emailError) return editErrors.value.email = emailError

  const websiteError = validators.website(website.trim())
  if (websiteError) return editErrors.value.website = websiteError

  editLoading.value = true
  try {
    const data = await updateUserProfile({
      nickname: nickname.trim(),
      email: email.trim(),
      website: website.trim() || undefined,
      avatar: editForm.value.avatar || undefined
    })
    showSuccess('保存成功')
    setTimeout(() => {
      userInfo.value = data
      showEditDialog.value = false
    }, 1000)
  } catch (error: any) {
    showError(error.message || '保存失败')
  } finally {
    editLoading.value = false
  }
}

// ===== 修改密码对话框 =====
const passwordForm = ref({ old_password: '', new_password: '', confirm_password: '' })
const passwordLoading = ref(false)
const passwordErrors = ref<Record<string, string>>({})

watch(showPasswordDialog, (val) => {
  if (val) passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
  passwordErrors.value = {}
})

const handlePasswordSubmit = async () => {
  passwordErrors.value = {}
  const { old_password, new_password, confirm_password } = passwordForm.value

  if (!old_password) return passwordErrors.value.old_password = '请输入旧密码'

  const pwdError = validators.password(new_password, true)
  if (pwdError) return passwordErrors.value.new_password = pwdError

  if (!confirm_password) return passwordErrors.value.confirm_password = '请确认新密码'
  if (new_password !== confirm_password) return passwordErrors.value.confirm_password = '两次输入的密码不一致'
  if (old_password === new_password) return passwordErrors.value.new_password = '新密码不能与旧密码相同'

  passwordLoading.value = true
  try {
    await changePassword({ old_password, new_password })
    showSuccess('密码修改成功，请重新登录')
    showPasswordDialog.value = false
    setTimeout(() => {
      logout()
      router.push('/')
    }, 1500)
  } catch (error: any) {
    const errorMsg = error?.message || '密码修改失败'
    if (errorMsg.includes('旧密码')) {
      passwordErrors.value.old_password = '原密码错误'
    } else {
      showError(errorMsg)
    }
  } finally {
    passwordLoading.value = false
  }
}

// ===== 注销账户对话框 =====
const deactivatePassword = ref('')
const deactivateConfirmed = ref(false)
const deactivateLoading = ref(false)
const deactivateErrors = ref<Record<string, string>>({})

watch(showDeactivateDialog, (val) => {
  if (val) {
    deactivatePassword.value = ''
    deactivateConfirmed.value = false
  }
  deactivateErrors.value = {}
})

// 登录方式配置
const loginMethods = [
  { icon: 'ri-lock-password-line', title: '密码登录', enabled: true },
  { icon: 'ri-github-fill', title: 'GitHub', enabled: false },
  { icon: 'ri-google-fill', title: 'Google', enabled: false },
  { icon: 'ri-wechat-fill', title: '微信', enabled: false },
  { icon: 'ri-qq-fill', title: 'QQ', enabled: false }
]

const handleDeactivateSubmit = async () => {
  deactivateErrors.value = {}
  if (!deactivateConfirmed.value) return deactivateErrors.value.confirmed = '请确认您已了解注销账户的后果'
  if (!deactivatePassword.value) return deactivateErrors.value.password = '请输入密码以确认身份'

  deactivateLoading.value = true
  try {
    await deactivateAccount({ password: deactivatePassword.value })
    showSuccess('账户注销成功')
    showDeactivateDialog.value = false
    setTimeout(() => {
      logout()
      router.push('/')
    }, 1500)
  } catch (err: any) {
    const errorMsg = err?.message || '账户注销失败'
    if (errorMsg.includes('密码') || errorMsg.includes('password')) {
      deactivateErrors.value.password = '密码错误，请重新输入'
    } else {
      showError(errorMsg)
    }
  } finally {
    deactivateLoading.value = false
  }
}

onMounted(async () => {
  if (!accessToken.value) {
    router.push('/')
    return
  }
  await fetchProfile()
})
</script>

<template>
  <div id="page">
    <div class="page-title">个人信息</div>

    <div v-if="userInfo" class="profile-content">
      <!-- 基础信息 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">基础信息</h3>
          <button @click="showEditDialog = true" class="btn-primary">
            <i class="ri-edit-line"></i> 编辑资料
          </button>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">头像</span>
            <span class="value">
              <img :src="getAvatarUrl(userInfo)" alt="头像" class="avatar-preview" />
            </span>
          </div>
          <div class="info-item">
            <span class="label">昵称</span>
            <span class="value">{{ userInfo.nickname || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">个人网站</span>
            <span class="value">
              <span v-if="userInfo.website">{{ userInfo.website }}</span>
              <span v-else class="empty">未设置</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="info-card">
        <h3 class="card-title">账户信息</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="label">用户身份</span>
            <span class="value">
              <button class="btn-link">申请身份</button>
            </span>
          </div>
          <div class="info-item">
            <span class="label">登录方式</span>
            <span class="value">
              <div class="login-methods">
                <div v-for="method in loginMethods" :key="method.icon"
                  :class="['method-icon', method.enabled ? 'enabled' : 'disabled']" :title="method.title">
                  <i :class="method.icon"></i>
                </div>
              </div>
            </span>
          </div>
          <div class="info-item">
            <span class="label">角色权限</span>
            <span class="value">{{ getRoleName(userInfo.role) }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间</span>
            <span class="value">{{ formatFriendly(userInfo.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后登录</span>
            <span class="value">{{ formatFriendly(userInfo.last_login) }}</span>
          </div>
        </div>
      </div>

      <!-- 账户管理 -->
      <div class="info-card danger-zone">
        <h3 class="card-title">账户管理</h3>
        <div class="info-list">
          <div class="info-item">
            <div class="action-item">
              <div class="action-info">
                <span class="action-title">退出登录</span>
                <span class="action-desc">退出当前账户，需要重新登录</span>
              </div>
              <button @click="handleLogout" class="btn-secondary">
                <i class="ri-logout-box-line"></i> 退出
              </button>
            </div>
          </div>
          <div class="info-item">
            <div class="action-item">
              <div class="action-info">
                <span class="action-title">修改密码</span>
                <span class="action-desc">修改账户登录密码</span>
              </div>
              <button @click="showPasswordDialog = true" class="btn-secondary">
                <i class="ri-lock-password-line"></i> 修改密码
              </button>
            </div>
          </div>
          <div class="info-item">
            <div class="action-item">
              <div class="action-info">
                <span class="action-title">注销账户</span>
                <span class="action-desc">永久删除账户及所有数据，此操作不可恢复</span>
              </div>
              <button @click="showDeactivateDialog = true" class="btn-danger">
                <i class="ri-delete-bin-line"></i> 注销账户
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <BaseDialog v-model="showEditDialog" @confirm="handleEditSubmit" title="编辑个人信息" style="--dialog-width: 500px"
      :loading="editLoading" confirm-text="保存">
      <form @submit.prevent="handleEditSubmit" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="form-group">
          <label>头像</label>
          <div class="avatar-section">
            <img :src="editForm.avatar || (userInfo ? getAvatarUrl(userInfo) : '')" alt="头像" />
            <button type="button" @click="handleAvatarUpload" :disabled="uploading || editLoading">
              {{ uploading ? '上传中...' : '更换头像' }}
            </button>
          </div>
          <p v-if="editErrors.avatar" class="error-message">{{ editErrors.avatar }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">昵称</label>
          <input v-model="editForm.nickname" type="text" class="form-input" :class="{ error: editErrors.nickname }"
            placeholder="请输入昵称（2-32个字符）" :disabled="editLoading" />
          <p v-if="editErrors.nickname" class="error-message">{{ editErrors.nickname }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input v-model="editForm.email" type="email" class="form-input" :class="{ error: editErrors.email }"
            placeholder="请输入邮箱" :disabled="editLoading" />
          <p v-if="editErrors.email" class="error-message">{{ editErrors.email }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">网站</label>
          <input v-model="editForm.website" type="url" class="form-input" :class="{ error: editErrors.website }"
            placeholder="https://example.com（选填）" :disabled="editLoading" />
          <p v-if="editErrors.website" class="error-message">{{ editErrors.website }}</p>
        </div>
      </form>
    </BaseDialog>

    <!-- 修改密码对话框 -->
    <BaseDialog v-model="showPasswordDialog" @confirm="handlePasswordSubmit" title="修改密码" :loading="passwordLoading"
      confirm-text="确认修改">
      <form @submit.prevent="handlePasswordSubmit" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="form-group">
          <label class="form-label">旧密码</label>
          <input v-model="passwordForm.old_password" type="password" class="form-input"
            :class="{ error: passwordErrors.old_password }" placeholder="请输入旧密码" :disabled="passwordLoading"
            autocomplete="current-password" />
          <p v-if="passwordErrors.old_password" class="error-message">{{ passwordErrors.old_password }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">新密码</label>
          <input v-model="passwordForm.new_password" type="password" class="form-input"
            :class="{ error: passwordErrors.new_password }" placeholder="请输入新密码（6-32个字符）" :disabled="passwordLoading"
            autocomplete="new-password" />
          <p v-if="passwordErrors.new_password" class="error-message">{{ passwordErrors.new_password }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <input v-model="passwordForm.confirm_password" type="password" class="form-input"
            :class="{ error: passwordErrors.confirm_password }" placeholder="请再次输入新密码" :disabled="passwordLoading"
            autocomplete="new-password" />
          <p v-if="passwordErrors.confirm_password" class="error-message">{{ passwordErrors.confirm_password }}</p>
        </div>

        <div class="tip">
          <i class="ri-information-line"></i>
          <span>密码修改成功后，系统将自动退出登录，请使用新密码重新登录</span>
        </div>
      </form>
    </BaseDialog>

    <!-- 注销账户对话框 -->
    <BaseDialog v-model="showDeactivateDialog" @confirm="handleDeactivateSubmit" title="注销账户"
      style="--dialog-width: 520px" :loading="deactivateLoading" confirm-text="确认注销">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="warning">
          <p class="warning-title">⚠️ 请谨慎操作，此操作不可恢复！</p>
          <p>注销账户后，您将无法再登录此账户，您的个人信息将被永久删除。</p>
        </div>

        <form @submit.prevent="handleDeactivateSubmit" style="display: flex; flex-direction: column; gap: 20px;">
          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="deactivateConfirmed" type="checkbox" :disabled="deactivateLoading" />
              <span>我已充分了解注销账户的后果，并确认要注销我的账户</span>
            </label>
            <p v-if="deactivateErrors.confirmed" class="error-message">{{ deactivateErrors.confirmed }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">输入密码以确认</label>
            <input v-model="deactivatePassword" type="password" class="form-input"
              :class="{ error: deactivateErrors.password }" placeholder="请输入您的账户密码" :disabled="deactivateLoading"
              autocomplete="current-password" />
            <p v-if="deactivateErrors.password" class="error-message">{{ deactivateErrors.password }}</p>
          </div>
        </form>
      </div>
    </BaseDialog>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/mixins' as *;

// 按钮基础样式
@mixin btn-base {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

// 页面容器
#page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;

  .page-title {
    margin: 0 0 30px;
    font-weight: bold;
    font-size: 2rem;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 信息卡片
.info-card {
  padding: 25px;
  background: var(--flec-card-bg);
  border-radius: 8px;


  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--flec-border);

    .card-title {
      margin: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .card-title {
    margin: 0 0 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--flec-border);
    font-weight: 600;
    color: var(--font-color);
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 48px;
    padding: 8px 0;
    border-bottom: 1px solid #8080800d;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: var(--theme-meta-color);
    }

    .value {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--font-color);
      text-align: right;

      .avatar-preview {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--flec-border);
      }

      .empty {
        color: var(--theme-meta-color);
        font-size: 0.9rem;
      }
    }

    .action-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 20px;

      .action-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .action-title {
          font-weight: 500;
          color: var(--font-color);
          font-size: 0.95rem;
        }

        .action-desc {
          color: var(--theme-meta-color);
          font-size: 0.85rem;
          line-height: 1.4;
        }
      }
    }
  }

  .login-methods {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .method-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: #8080800a;
      cursor: pointer;
      transition: background 0.2s;

      i {
        font-size: 20px;
        color: var(--theme-meta-color);
      }

      &.enabled i {
        color: var(--theme-color);
      }

      &:hover {
        background: #80808014;
      }
    }
  }
}

// 按钮
.btn-primary {
  @include btn-base;
  border: none;
  background: var(--theme-color);
  color: white;

  &:hover {
    opacity: 0.9;
  }
}

.btn-secondary {
  @include btn-base;
  border: 1px solid var(--flec-border);
  background: var(--flec-card-bg);
  color: var(--font-color);

  &:hover {
    background: #80808014;
  }
}

.btn-danger {
  @include btn-base;
  border: 1px solid #e57373;
  background: transparent;
  color: #e57373;

  &:hover {
    background: #e57373;
    color: white;
  }
}

.btn-link {
  color: var(--theme-color);
  font-size: 1rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}

// ===== 对话框表单样式 =====
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--font-color);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--flec-border);
  border-radius: 8px;
  background: var(--flec-card-bg);
  color: var(--font-color);
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--theme-color);
    box-shadow: 0 0 0 3px #49b1f526;
  }

  &.error {
    border-color: #e57373;

    &:focus {
      box-shadow: 0 0 0 3px #e5737326;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--theme-meta-color);
  }
}

.error-message {
  margin: 0;
  font-size: 0.85rem;
  color: #e57373;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 15px;

  img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--flec-border);
  }

  button {
    padding: 8px 16px;
    border: 1px solid var(--flec-border);
    border-radius: 8px;
    background: var(--flec-card-bg);
    color: var(--font-color);
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      border-color: var(--theme-color);
      color: var(--theme-color);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.tip {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #49b1f50d;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--theme-meta-color);
  line-height: 1.5;

  i {
    font-size: 16px;
    color: var(--theme-color);
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.warning {
  padding: 16px;
  background: #8080800d;
  border: 1px solid var(--flec-border);
  border-radius: 8px;

  .warning-title {
    margin: 0 0 12px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--font-color);
  }

  p {
    margin: 0 0 8px;
    font-size: 0.9rem;
    color: var(--font-color);
  }

  ul {
    margin: 8px 0 0;
    padding-left: 20px;
    font-size: 0.9rem;
    color: var(--theme-meta-color);
    line-height: 1.8;

    li {
      margin: 4px 0;
    }
  }
}

.checkbox-label {
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #8080800d;
  }

  input[type="checkbox"] {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    flex-shrink: 0;
    accent-color: var(--theme-color);
  }

  span {
    font-size: 0.95rem;
    color: var(--font-color);
    line-height: 1.5;
  }
}

// 响应式
@media (max-width: 768px) {
  #page {
    padding: 20px;

    .page-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
  }

  .info-card {
    padding: 20px;

    .card-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .card-title {
        padding-bottom: 0;
        border-bottom: none;
      }
    }

    .info-item {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      min-height: auto;

      .value {
        width: 100%;
        text-align: left;
        flex-wrap: wrap;
      }

      .action-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .action-info .action-title {
          font-size: 1rem;
        }

        .action-info .action-desc {
          font-size: 0.8rem;
        }

        button {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .login-methods {
      justify-content: flex-start;
      gap: 10px;

      .method-icon {
        width: 32px;
        height: 32px;

        i {
          font-size: 18px;
        }
      }
    }
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .btn-link {
    padding: 6px 12px;
  }
}
</style>
