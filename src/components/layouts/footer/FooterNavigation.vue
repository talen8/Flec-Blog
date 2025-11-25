<script lang="ts" setup>
import { useMenus } from '@/composables/useStores'

const { footerMenus } = useMenus()

// 判断链接是否为外部链接
const isExternalLink = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://')
}
</script>

<template>
  <div v-if="footerMenus.length > 0" class="footer-group">
    <div 
      v-for="menu in footerMenus" 
      :key="menu.id" 
      class="group-item"
    >
      <div class="item-title" role="heading" aria-level="2">{{ menu.title }}</div>
      <nav class="item-content" :aria-label="`${menu.title}导航`">
        <a 
          v-for="child in menu.children" 
          :key="child.id"
          class="content_link" 
          :href="child.url" 
          :target="isExternalLink(child.url) ? '_blank' : '_self'"
          :rel="isExternalLink(child.url) ? 'noopener noreferrer' : undefined"
          :aria-label="child.title"
        >
          {{ child.title }}
        </a>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-group {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0 1rem;
  gap: 16px;
  margin-top: 24px;

  .group-item {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .item-title {
      color: var(--flec-footer-font);
      margin-left: 8px;
      margin-top: 0;
      margin-bottom: 0;
      width: fit-content;
    }

    .item-content {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .content_link {
        color: var(--flec-footer-font);
        line-height: 0.6rem;
        margin-right: auto;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 100px;
        cursor: pointer;
        padding: 8px;
        border-radius: 12px;

        &:hover {
          color: var(--flec-footer-font-hover);
          background: var(--flec-footer-font-bg-hover);
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .footer-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 0 12px;
  }
}
</style>

