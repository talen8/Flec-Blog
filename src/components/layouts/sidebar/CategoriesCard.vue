<script setup lang="ts">
import { ref } from 'vue'
import { useCategories } from '@/composables/useStores'

const { categories } = useCategories()
const isExpanded = ref(false)
const toggleExpand = () => isExpanded.value = !isExpanded.value
</script>

<template>
    <div class="card-widget card-categories">
        <div class="item-headline" :class="{ 'is-expanded': isExpanded }">
            <i class="ri-folder-6-fill"></i>
            <span>分类</span>
            <i class="collapse-icon ri-arrow-left-s-fill" :class="{ 'is-expanded': isExpanded }" @click="toggleExpand"></i>
        </div>
        <ul class="card-list" :class="{ 'is-expanded': isExpanded }">
            <li class="card-list-item" v-for="category in categories" :key="category.id">
                <router-link class="card-list-link" :to="category.url" :aria-label="`查看分类：${category.name}，共 ${category.count} 篇文章`">
                    <span class="card-list-name">{{ category.name }}</span>
                    <span class="card-list-count" aria-hidden="true">{{ category.count }}</span>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.collapse-icon {
    display: none;
    margin-left: 8px;
    cursor: pointer;
    font-size: 1.2em;
    transition: transform 0.3s ease;

    &.is-expanded {
        transform: rotate(-90deg);
    }
}

@media (max-width: 900px) {
    .collapse-icon {
        display: inline-block;
    }

    .item-headline {
        padding-bottom: 0 !important;
        transition: padding-bottom 0.3s ease;

        &.is-expanded {
            padding-bottom: 8px !important;
        }
    }

    .card-list {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;

        &.is-expanded {
            max-height: 1000px;
        }
    }
}
</style>