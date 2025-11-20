<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()

// 渲染后的HTML内容
const renderedContent = computed(() => {
  if (!props.content) return ''
  return renderMarkdown(props.content)
})
</script>

<template>
  <article class="post-content">
    <!-- 使用 v-html 渲染 Markdown，内容已经过 DOMPurify 清理 -->
    <div class="markdown-content" v-html="renderedContent"></div>
  </article>
</template>

<style lang="scss">
// 导入 Markdown 文章内容排版样式（非 scoped，因为需要应用到动态渲染的内容）
@use "@/assets/css/prose";
</style>

<style lang="scss" scoped>
.post-content {
  line-height: 1.8;
  font-size: 1rem;
  color: var(--theme-text-color);
  word-wrap: break-word;
}
</style>


