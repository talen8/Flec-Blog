<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { formatDate } from '../utils/date'
import { useArticles } from '../composables/useStores'
import { useWaterfall } from '../composables/useWaterfall'
import Pagination from '@/components/ui/Pagination.vue'

const { articles, total, currentPage, pageSize, fetchArticles } = useArticles()

// 简单版瀑布流
const { waterfall } = useWaterfall('#post-list', 2, 16)

// 处理分页变化
const handlePageChange = async (page: number) => {
  await fetchArticles({ page })
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // 等待DOM更新后再重新布局
  setTimeout(() => waterfall(), 100)
}

onMounted(async () => {
  await fetchArticles()
  waterfall()
})

// 监听文章列表变化，重新计算布局
watch(() => articles.value.length, () => {
  setTimeout(() => waterfall(), 50)
})
</script>

<template>
  <div>
    <div class="category-bar"></div>
    
    <!-- 文章列表 -->
    <div id="post-list">
      <div v-for="article in articles" :key="article.id" class="post-items">
        <div v-if="article.cover" class="post-cover">
          <router-link :to="article.url">
            <img :src="article.cover" :alt="article.title" loading="lazy">
          </router-link>
        </div>
        <div class="post-info">
          <router-link class="article-title" :to="article.url">{{ article.title }}</router-link>
          <div class="article-meta-wrap">
            <span class="article-date">
              <i class="ri-calendar-2-fill"></i>
              <span class="article-meta-label">发表于</span>
              <span>{{ formatDate(article.publish_time) }}</span>
            </span>
            <span class="article-meta" v-if="article.category">
              <i class="ri-inbox-2-fill"></i>
              <router-link class="article-meta__categories" :to="article.category.url">{{ article.category.name }}</router-link>
            </span>
            <span class="article-meta tags" v-if="article.tags?.length">
              <template v-for="(tag, index) in article.tags" :key="tag.id">
                <template v-if="index > 0">
                  <span class="article-meta-link">•</span>
                </template>
                <i class="ri-price-tag-3-fill"></i>
                <router-link class="article-meta__tags" :to="tag.url">{{ tag.name }}</router-link>
              </template>
            </span>
            <span class="article-meta comments">
              <i class="ri-message-3-fill"></i>
              <span>{{ article.comment_count }}条评论</span>
            </span>
          </div>
          <div class="post-desc">
            {{ article.summary }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <Pagination 
      v-if="articles.length > 0"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @change="handlePageChange"
    />
  </div>
</template>

<style lang="scss">
@use '@/assets/css/mixins' as *;

// 文章列表样式
#post-list {
  position: relative;
  width: 100%;
  
  .post-items {
    @extend .cardHover;
    position: absolute;
    overflow: hidden;

    .post-cover {
      overflow: hidden;
      width: 100%;
      aspect-ratio: 16 / 9;
      height: auto;

      img {
        @extend .imgHover
      }
    }

    .post-info {
      padding: 30px 30px 25px;

      .article-title {
        font-size: 1.55rem;
        line-height: 1.4;
        transition: all 0.2s ease-in-out;
      }

      .article-meta-wrap {
        margin: 6px 0;
        color: var(--theme-meta-color);
        font-size: 0.9rem;

        i {
          margin: 0 4px 0 0;
        }

        .article-meta-label {
          padding-right: 4px;
        }

        .article-meta {
          &::before {
            content: '|';
            margin: 0 6px;
            color: var(--theme-meta-color);
          }
        }

        .article-meta-link {
          margin: 0 4px;
        }

        .article-meta__categories,
        .article-meta__tags,
        .article-meta__comments {
          color: var(--theme-meta-color);
          text-decoration: none;
          transition: color 0.2s ease;
          
          &:hover {
            color: var(--theme-color);
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #post-list {
    .post-items {
      .post-info {
        padding: 20px 20px 18px;

        .article-title {
          font-size: 1.35rem;
        }

        .article-meta-wrap {
          font-size: 0.85rem;
        }

        .post-desc {
          font-size: 0.95rem;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  #post-list {
    .post-items {
      .post-info {
        padding: 16px 16px 14px;

        .article-title {
          font-size: 1.2rem;
          line-height: 1.3;
        }

        .article-meta-wrap {
          font-size: 0.78rem;
          flex-wrap: wrap;
        }

        .post-desc {
          font-size: 0.88rem;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
