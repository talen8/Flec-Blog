<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import ArticleSort from "@/components/features/article/ArticleSort.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { useArticles } from "../composables/useStores";

const route = useRoute();
const { articles, total, currentPage, pageSize, fetchArticles } = useArticles();

// 判断是否为月份详情页
const isMonthDetail = computed(() => {
  return !!(route.params.year && route.params.month);
});

// 页面标题
const pageTitle = computed(() => {
  return isMonthDetail.value
    ? `归档 - ${route.params.year}年${route.params.month}月`
    : "归档";
});

// 加载数据
const loadData = async (page: number = 1) => {
  if (isMonthDetail.value) {
    // 月份详情页：使用后端筛选 + 分页
    await fetchArticles({
      year: route.params.year as string,
      month: route.params.month as string,
      page
    });
  } else {
    // 总览页：分页显示，每页20篇（前端会按年分组）
    await fetchArticles({
      page,
      page_size: 20
    });
  }
};

// 处理分页变化
const handlePageChange = async (page: number) => {
  await loadData(page);
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 监听路由参数变化
watch(() => [route.params.year, route.params.month], () => {
  loadData(1);
}, { deep: true });

onMounted(() => {
  loadData();
});
</script>

<template>
  <div id="page">
    <ArticleSort 
      :articles="articles" 
      :group-by-year="!isMonthDetail"
      :title="pageTitle"
      :total="total"
    />
    
    <!-- 分页 -->
    <Pagination 
      v-if="total > (isMonthDetail ? pageSize : 20)"
      :total="total"
      :current-page="currentPage"
      :page-size="isMonthDetail ? pageSize : 20"
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
