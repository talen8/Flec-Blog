<script lang="ts" setup>
import { onMounted } from 'vue'
import { useTags } from '../composables/useStores'

const { tags, fetchTags } = useTags()

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <!-- 内容区域 -->
  <div id="page">
      <div class="page-title">标签</div>
      <div class="tag-cloud-list">
        <router-link 
          v-for="tag in tags" 
          :key="tag.id" 
          :to="tag.url"
          :title="tag.name"
        >
          {{ tag.name }}
        </router-link>
      </div>
  </div>
</template>

<style lang="scss">
@use "@/assets/css/mixins" as *;

#page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;

  .page-title {
    margin: 0 0 10px;
    font-weight: bold;
    font-size: 2rem;
  }

  .tag-cloud-list {
    text-align: center;

    a {
      display: inline-block;
      margin: 2px;
      padding: 2px 7px;
      line-height: 1.7;
      transition: all 0.3s;
      font-size: 1.2em;
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #page {
    padding: 30px;

    .page-title {
      font-size: 1.75rem;
    }

    .tag-cloud-list {
      a {
        font-size: 1.1em;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  #page {
    padding: 18px;

    .page-title {
      font-size: 1.4rem;
    }

    .tag-cloud-list {
      a {
        font-size: 0.95em;
        padding: 2px 6px;
        margin: 1.5px;
      }
    }
  }
}
</style>
