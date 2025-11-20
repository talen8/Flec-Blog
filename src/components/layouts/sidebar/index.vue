<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCategories, useTags, useArticles, useStats } from '@/composables/useStores'

import AuthorCard from './AuthorCard.vue'
import AnnouncementCard from './AnnouncementCard.vue'
import CategoriesCard from './CategoriesCard.vue'
import TagsCard from './TagsCard.vue'
import ArchivesCard from './ArchivesCard.vue'
import WebInfoCard from './WebInfoCard.vue'
import TocCard from './TocCard.vue'

const route = useRoute()

// 在父组件统一获取所有数据
const { fetchCategories } = useCategories()
const { fetchTags } = useTags()
const { fetchArticles } = useArticles()
const { fetchStats } = useStats()

// 判断当前页面类型
const isArticlePage = computed(() => route.meta.typeHeader === 'post')

onMounted(() => {
    fetchCategories()
    fetchTags()
    fetchArticles()
    fetchStats()
})
</script>

<template>
    <aside id="sidebar">
        <AuthorCard />
        <AnnouncementCard />
        <div class="sticky-sidebar">
            <template v-if="isArticlePage">
                <TocCard />
            </template>
            <template v-else>
                <CategoriesCard />
                <TagsCard />
                <ArchivesCard />
                <WebInfoCard />
            </template>
        </div>
    </aside>
</template>

<style lang="scss">
@use '@/assets/css/mixins' as *;

#sidebar {
    width: 26%;
    padding-left: 15px;

    .card-widget {
        position: relative;
        overflow: hidden;
        margin-bottom: 20px;
        padding: 20px 24px;
        @extend .cardHover;
    }

    .sticky-sidebar {
        position: sticky;
        top: 70px;
        transition: top 0.3s;
        display: flex;
        flex-direction: column;
    }

    .item-headline {
        padding-bottom: 6px;
        font-size: 1.2rem;
        display: flex;
        align-items: center;

        i {
            margin-right: 10px;
        }

        .more-link {
            margin-left: auto;
            color: var(--font-color);
            opacity: 0.6;
            transition: all 0.3s;
            font-size: 1.3em;

            &:hover {
                opacity: 1;
                color: var(--flec-btn-hover);
            }
        }
    }

    .card-list {
        margin: 0;
        padding: 0;

        .card-list-link {
            display: flex;
            flex-direction: row;
            margin: 2px 0;
            padding: 2px 8px;
            transition: all 0.3s;
            border-radius: 6px;

            &:hover {
                padding: 2px 12px;
                background-color: var(--flec-btn-hover);
                color: #fff;
            }

            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .card-list-name {
                flex: 1;
            }
        }
    }
}

// 响应式设计
@media screen and (max-width: 900px) {
    #sidebar {
        width: 100%;
        margin-top: 20px;
        padding-left: 0;

        .card-widget {
            margin-bottom: 12px;
            padding: 16px 18px;
        }

        .item-headline {
            padding-bottom: 8px;
            font-size: 1.1rem;

            i {
                margin-right: 8px;
            }
        }

        .sticky-sidebar {
            position: static;
        }
    }
}
</style>