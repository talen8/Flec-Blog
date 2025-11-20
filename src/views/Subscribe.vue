<script lang="ts" setup>
import { ref } from 'vue'

const showSubmitBox = ref(false)
const email = ref('')

const toggleSubmitBox = () => {
  showSubmitBox.value = !showSubmitBox.value
}

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (!email.value) {
    alert('请填入您的邮箱地址')
    return
  }
  // TODO: 集成邮件订阅功能
  alert('邮件订阅功能正在开发中，敬请期待！')
  email.value = ''
  showSubmitBox.value = false
}
</script>

<template>
  <div id="subscribe-page">
    <div class="page-title">订阅本站</div>
    <div class="page-subtitle">选择您喜欢的订阅方式，随时获取最新更新</div>

    <!-- 订阅方式卡片 -->
    <div class="subscribe-list">
      <!-- 公众号订阅 -->
      <a class="subscribe-item subscribe-wechat" href="#" title="公众号" @click.prevent>
        <div class="subscribe-description">
          推送精选文章<br>推送全文
        </div>
        <div class="subscribe-info-group">
          <div class="subscribe-title">公众号订阅</div>
          <div class="subscribe-info">推荐的订阅方式</div>
          <i class="ri-wechat-fill subscribe-icon"></i>
        </div>
      </a>

      <!-- 邮件订阅 -->
      <a class="subscribe-item subscribe-mail" href="#" title="邮件订阅" @click.prevent="toggleSubmitBox">
        <div class="subscribe-description">
          推送全部文章<br>更新推送简介
        </div>
        <div class="subscribe-info-group">
          <div class="subscribe-title">邮件订阅</div>
          <div class="subscribe-info">推荐的订阅方式</div>
          <i class="ri-mail-fill subscribe-icon"></i>
        </div>
      </a>

      <!-- RSS 订阅 -->
      <a class="subscribe-item subscribe-rss" href="/atom.xml" title="RSS" target="_blank">
        <div class="subscribe-description">
          推送全部文章<br>推送简介
        </div>
        <div class="subscribe-info-group">
          <div class="subscribe-title">RSS</div>
          <div class="subscribe-info">备用订阅方式</div>
          <i class="ri-rss-fill subscribe-icon"></i>
        </div>
      </a>
    </div>

    <hr class="divider">

    <!-- 邮件订阅表单 -->
    <div class="submit-box" :class="{ display: showSubmitBox }">
      <form @submit="handleSubmit">
        <div class="subscribe-form">
          <div class="heading">
            <div class="heading-title">订阅本站文章</div>
          </div>
          <div class="input-field">
            <input v-model="email" type="email" name="email" placeholder="填入您的邮箱地址" spellcheck="false" required />
          </div>
          <div class="submit-button">
            <button type="submit">确认订阅</button>
          </div>
        </div>
      </form>
    </div>

    <!-- 订阅说明 -->
    <div class="subscribe-content">
      <p>首先，对每一位来到这里的朋友们说声 "有幸遇见 很高兴认识你" 👋</p>
      <p>创立 爱吃猫的鱼BLOG 的初衷是想能够有一个让自己积累知识、积累兴趣的地方；是属于自己的温暖小窝；也是偌大的社会里的属于自己的内心避风港。</p>
      <p>和他人分享，会让这些成为积累和沉淀。如果能够帮助到更多的人，帮助更多人解决问题，那一定是非常棒的事情。</p>

      <h3>微信公众号</h3>
      <p>微信公众号将发布一些我觉得有价值，很重要，比较精彩的文章。</p>
      <p>后面也会同步将博客文章同步至公众号内，但并不是所有，建议所有用户订阅。</p>

      <h3>邮件通知</h3>
      <p>订阅邮件通知后，当本博客有新文章发布时，将会第一时间发送邮件提醒您。</p>
      <p>点击上方 <span class="highlight">邮件订阅</span> ，填入你的邮件地址订阅即可。</p>

      <h3>RSS订阅</h3>
      <p>你可以使用第三方RSS客户端接收到博客的文章摘要通知。</p>
      <p>订阅地址：<span class="highlight">https://blog.talen.top/atom.xml</span></p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

#subscribe-page {
  @extend .cardHover;
  width: 100%;
  padding: 40px;
}

.page-title {
  margin: 0 0 10px;
  font-weight: bold;
  font-size: 2rem;
}

.page-subtitle {
  margin-bottom: 30px;
  color: var(--theme-meta-color);
  font-size: 1rem;
}

// 订阅卡片列表
.subscribe-list {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.subscribe-item {
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 240px;
  height: 240px;
  overflow: hidden;
  text-decoration: none;
  width: calc(100% / 3 - 8px);
  transition: all 0.4s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;

  &:visited {
    color: white;
  }

  &.subscribe-wechat {
    background: var(--flec-subscribe-wechat);
  }

  &.subscribe-mail {
    background: var(--flec-subscribe-mail);
  }

  &.subscribe-rss {
    background: var(--flec-subscribe-rss);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);

    .subscribe-icon {
      transform: translate(-3px, -3px) scale(1.05);
      opacity: 0.6;
      filter: blur(1px);
    }
  }
}

.subscribe-description {
  font-size: 16px;
  color: white;
  margin: 26px 0 0 30px;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.subscribe-info-group {
  position: relative;
  margin: 0 0 26px 30px;
  color: white;
  z-index: 2;
}

.subscribe-title {
  font-size: 36px;
  font-weight: 700;
  width: fit-content;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subscribe-info {
  width: fit-content;
  opacity: 0.9;
  font-size: 14px;
}

.subscribe-icon {
  position: absolute;
  bottom: -125px;
  right: -25px;
  font-size: 140px;
  user-select: none;
  transition: all 0.8s cubic-bezier(0.39, 0.575, 0.565, 1);
  transform-origin: bottom right;
  filter: blur(3px);
  opacity: 0.3;
  z-index: 1;
  color: rgba(255, 255, 255, 0.3);
}

// 分割线
.divider {
  border: none;
  border-top: 1px solid var(--flec-subscribe-card-border);
  margin: 30px 0;
}

// 邮件订阅表单
.submit-box {
  opacity: 0;
  max-height: 0;
  pointer-events: none;
  overflow: hidden;
  transition: all 0.3s ease;

  &.display {
    opacity: 1;
    max-height: 500px;
    pointer-events: auto;
    overflow: visible;
    margin-bottom: 30px;
  }
}

.subscribe-form {
  position: relative;
  display: block;
  padding: 32px;
  width: 100%;
  height: auto;
  border-radius: 12px;
  background-color: var(--flec-subscribe-background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .heading {
    width: 100%;
    margin-bottom: 1rem;
    text-align: center;

    .heading-title {
      color: var(--flec-subscribe-font);
      font-size: 20px;
      font-weight: 600;
    }
  }

  .input-field {
    margin-top: 20px;
    width: 100%;

    input {
      width: 100%;
      height: 48px;
      border-radius: 8px;
      border: 2px solid var(--flec-subscribe-card-border);
      outline: none;
      background: var(--flec-subscribe-secondbg);
      color: var(--flec-subscribe-font);
      font-size: 15px;
      text-align: center;
      transition: all 0.2s ease;
      padding: 0 15px;

      &:focus {
        border-color: var(--flec-subscribe-blue);
        box-shadow: 0 0 0 3px rgba(66, 90, 239, 0.1);
      }

      &::placeholder {
        color: var(--theme-meta-color);
      }
    }
  }

  .submit-button {
    margin-top: 20px;
    width: 100%;

    button {
      width: 100%;
      height: 48px;
      border: 0;
      border-radius: 8px;
      color: white;
      background: var(--flec-subscribe-button);
      transition: all 0.2s ease;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// 订阅说明区域
.subscribe-content {
  h3 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    scroll-margin-top: 80px; // 锚点跳转偏移
    position: relative;
  }

  .highlight {
    color: var(--theme-color);
    font-weight: 500;
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #subscribe-page {
    padding: 30px;

    .page-title {
      font-size: 1.75rem;
    }

    .page-subtitle {
      font-size: 0.95rem;
      margin-bottom: 25px;
    }
  }

  .subscribe-item {
    width: calc(50% - 6px);
    height: 220px;

    .subscribe-description {
      font-size: 15px;
      margin: 22px 0 0 25px;
    }

    .subscribe-info-group {
      margin: 0 0 22px 25px;
    }

    .subscribe-title {
      font-size: 32px;
    }

    .subscribe-icon {
      font-size: 120px;
      bottom: -110px;
    }
  }

  .subscribe-form {
    padding: 28px;
  }

  .subscribe-content {
    h3 {
      font-size: 1.35rem;
      margin-top: 1.75rem;
    }

    p {
      font-size: 0.95rem;
    }
  }
}

@media screen and (max-width: 768px) {
  #subscribe-page {
    padding: 18px;

    .page-title {
      font-size: 1.4rem;
    }

    .page-subtitle {
      font-size: 0.875rem;
      margin-bottom: 20px;
    }
  }

  .subscribe-list {
    gap: 10px;
    margin-bottom: 16px;
  }

  .subscribe-item {
    width: 100%;
    height: 200px;

    .subscribe-description {
      font-size: 14px;
      margin: 20px 0 0 20px;
    }

    .subscribe-info-group {
      margin: 0 0 20px 20px;
    }

    .subscribe-title {
      font-size: 28px;
    }

    .subscribe-info {
      font-size: 0.8rem;
    }

    .subscribe-icon {
      font-size: 100px;
      bottom: -90px;
    }
  }

  .divider {
    margin: 20px 0;
  }

  .subscribe-form {
    padding: 20px;

    .heading {
      margin-bottom: 0.75rem;

      .heading-title {
        font-size: 18px;
      }
    }

    .input-field {
      margin-top: 16px;

      input {
        height: 44px;
        font-size: 14px;
      }
    }

    .submit-button {
      margin-top: 16px;

      button {
        height: 44px;
        font-size: 15px;
      }
    }
  }

  .subscribe-content {
    h3 {
      font-size: 1.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.65rem;
    }

    p {
      font-size: 0.9rem;
      line-height: 1.7;
    }

    .highlight {
      font-size: 0.9rem;
    }
  }
}
</style>
