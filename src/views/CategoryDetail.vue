<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleSort from "@/components/features/article/ArticleSort.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { getCategoryBySlug } from "../api/category";
import { getArticlesForWeb } from "../api/article";
import type { Category } from "../types/category";
import type { Article } from "../types/article";
import { SITE_TITLE } from "@/router/index";

const route = useRoute();
const router = useRouter();
const category = ref<Category | null>(null);
const articles = ref<Article[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const fetchData = async (page = 1) => {
  const slug = route.params.slug as string;
  currentPage.value = page;
  
  try {
    const [categoryData, articlesData] = await Promise.all([
      getCategoryBySlug(slug),
      getArticlesForWeb({
        category: slug,
        page,
        page_size: pageSize.value
      })
    ]);
    
    category.value = categoryData;
    articles.value = articlesData.list;
    total.value = articlesData.total;
  } catch (error: any) {
    // 如果是404错误，替换到404页面（不保留历史记录，避免循环）
    if (error.response?.status === 404) {
      router.replace('/404');
    }
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  fetchData(page);
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 监听路由参数变化
watch(() => route.params.slug, () => {
  currentPage.value = 1; // 重置页码
  fetchData(1);
}, { immediate: true });

// 监听分类数据变化，动态设置页面标题
watch(category, (newCategory) => {
  if (newCategory) {
    document.title = `分类:${newCategory.name} | ${SITE_TITLE}`
  }
});
</script>

<template>
  <div id="page">
    <ArticleSort 
      v-if="category"
      :articles="articles"
      :title="`分类 - ${category.name}`"
      :total="total"
    />
    
    <!-- 分页 -->
    <Pagination 
      v-if="category && total > pageSize"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @change="handlePageChange"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

#page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #page {
    padding: 30px;
  }
}

@media screen and (max-width: 768px) {
  #page {
    padding: 18px;
  }
}
</style>

