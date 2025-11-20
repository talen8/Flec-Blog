<script lang="ts" setup>
import { ref, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getArticleBySlug } from "../api/article";
import { useCurrentArticle } from "../composables/useStores";
import ArticleContent from "@/components/features/article/ArticleContent.vue";
import Comments from "@/components/features/comment/Comments.vue";
import type { Article } from "../types/article";
import { SITE_TITLE } from "@/router/index";
import { setCurrentArticleId, tracker } from "@/utils/tracker";
import { scrollToElement } from "@/utils/scroll";

const route = useRoute();
const router = useRouter();
const article = ref<Article | null>(null);
const { setCurrentArticle, clearCurrentArticle } = useCurrentArticle();

const fetchArticle = async () => {
  const slug = route.params.slug as string;

  try {
    article.value = await getArticleBySlug(slug);
    setCurrentArticle(article.value);

    // 设置当前文章ID用于埋点追踪
    if (article.value) {
      setCurrentArticleId(article.value.id);
      // 发送包含 article_id 的页面访问埋点
      tracker.trackPageview(undefined, article.value.id);

      // 通知路由内容已加载完成
      nextTick(() => {
        window.__articleContentReady?.();
        window.__articleContentReady = undefined;

        // 处理 URL hash 锚点跳转
        if (route.hash) {
          requestAnimationFrame(() => scrollToElement(route.hash, { block: 'start' }));
        }
      });
    }
  } catch (err: any) {
    clearCurrentArticle();
    setCurrentArticleId(undefined);

    // 如果是404错误，替换到404页面（不保留历史记录，避免循环）
    if (err.response?.status === 404) {
      router.replace('/404');
    }
  }
};

// 监听路由参数变化
watch(() => route.params.slug, fetchArticle, { immediate: true });

// 监听文章数据变化，动态设置页面标题
watch(article, (newArticle) => {
  if (newArticle) {
    document.title = `${newArticle.title} | ${SITE_TITLE}`
  }
})

// 监听 URL hash 变化，实现锚点跳转
watch(() => route.hash, (hash) => {
  if (hash) scrollToElement(hash, { block: 'start' });
})

// 组件卸载时清除文章数据
onUnmounted(() => {
  clearCurrentArticle();
  setCurrentArticleId(undefined);
});
</script>

<template>
  <div id="post" v-if="article">
    <div class="ai-summary"></div>

    <ArticleContent :content="article.content" />

    <div class="post-copyright"></div>

    <Comments target-type="article" :target-key="article.id" />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

#post {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #post {
    padding: 30px;
  }
}

@media screen and (max-width: 768px) {
  #post {
    padding: 18px;
  }
}
</style>
