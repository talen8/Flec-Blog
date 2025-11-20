<script lang="ts" setup>
// 左侧联系方式
const contactsLeft = [
  { name: 'Email', url: 'mailto:talen2004@163.com', icon: 'ri-mail-line' },
  { name: 'X', url: 'https://x.com/talen8520', icon: 'ri-twitter-x-line' }
]

// 右侧联系方式
const contactsRight = [
  { name: 'GitHub', url: 'https://github.com/talen8', icon: 'ri-github-line' },
  { name: 'Bilibili', url: 'https://space.bilibili.com/479887195', icon: 'ri-bilibili-line' }
]

// 返回顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="footer-contact">
    <div v-for="contact in contactsLeft" :key="contact.name" class="contact_link">
      <a :href="contact.url" :aria-label="`访问 ${contact.name}`" target="_blank" rel="noopener noreferrer">
        <i :class="`${contact.icon}`" aria-hidden="true"></i>
      </a>
    </div>
    <button class="footer_logo" @click="scrollToTop" aria-label="返回顶部" type="button">
      <img src="@/assets/img/icon/top.svg" alt="" aria-hidden="true">
    </button>
    <div v-for="contact in contactsRight" :key="contact.name" class="contact_link">
      <a :href="contact.url" :aria-label="`访问 ${contact.name}`" target="_blank" rel="noopener noreferrer">
        <i :class="`${contact.icon}`" aria-hidden="true"></i>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-contact {
  justify-content: center;
  display: flex;
  align-items: center;

  .contact_link {
    display: flex;
    margin: 14px 27px;
    color: var(--flec-footer-icon);
    border-radius: 20%;
    width: 38px;
    height: 38px;
    background: var(--flec-card-bg);
    justify-content: center;
    align-items: center;
    transition: 0.3s;
    cursor: pointer;

    &:hover {
      background: var(--flec-footer-icon-bg-hover);
      transform: scale(1.1);

      i {
        color: var(--flec-footer-icon-hover);
      }
    }

    a {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      color: inherit;
    }

    i {
      font-size: 1.4rem;
      pointer-events: none;
    }
  }

  .footer_logo {
    width: 60px;
    height: 60px;
    margin: 0 14px;
    cursor: pointer;
    transition: cubic-bezier(0, 0, 0, 1.29) 0.5s;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background: transparent;
    padding: 0;

    &:hover {
      transform: scale(1.1);
    }

    &:focus {
      outline: 2px solid var(--flec-btn);
      outline-offset: 2px;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .footer-contact {
    flex-wrap: wrap;
    justify-content: center;
    gap: 60px;

    .contact_link {
      margin: 0;
    }

    .footer_logo {
      display: none;
    }
  }
}
</style>

