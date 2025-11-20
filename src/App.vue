<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useLoginModal } from '@/composables/useLoginModal'
import Toast from '@/components/ui/Toast.vue'
import LoginModal from '@/components/features/modals/LoginModal.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import bgImage from '@/assets/img/bg.png'

const { toasts } = useToast()
const { showLoginModal } = useLoginModal()
</script>

<template>
    <div class="web_bg" :style="{ backgroundImage: `url(${bgImage})` }"></div>
    <router-view></router-view>
    
    <!-- 全局 Toast 消息提示 -->
    <Toast v-for="toast in toasts" :key="toast.id" v-bind="toast" />
    
    <!-- 全局登录弹窗 -->
    <LoginModal v-model="showLoginModal" />
    
    <!-- 全局右键菜单 -->
    <ContextMenu />
</template>

<style scoped>
.web_bg {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: -50;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
}

[data-theme='dark'] .web_bg::before {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #121212b0;
    content: '';
}
</style>
