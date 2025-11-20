<script setup lang="ts">
import { ref } from 'vue'
import { useTags } from '@/composables/useStores'

const { tags } = useTags()
const isExpanded = ref(false)
const toggleExpand = () => isExpanded.value = !isExpanded.value

// 根据标签的文章数量计算字体大小
const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.value.map(t => t.count), 1)
    const ratio = count / maxCount
    return `${0.9 + (1.5 - 0.9) * ratio}em`
}
</script>

<template>
    <div class="card-widget card-tags">
        <div class="item-headline" :class="{ 'is-expanded': isExpanded }">
            <i class="ri-price-tag-3-fill"></i>
            <span>标签</span>
            <i class="collapse-icon ri-arrow-left-s-fill" :class="{ 'is-expanded': isExpanded }" @click="toggleExpand"></i>
        </div>
        <div class="card-tag-cloud" :class="{ 'is-expanded': isExpanded }">
            <router-link 
                v-for="tag in tags" 
                :key="tag.id" 
                :to="tag.url"
                :style="{ fontSize: getTagSize(tag.count) }"
                :aria-label="`查看标签：${tag.name}，共 ${tag.count} 篇文章`"
            >
                {{ tag.name }}
            </router-link>
        </div>
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

.card-tag-cloud a {
    font-size: 1.1em;
    color: #999;
    display: inline-block;
    padding: 0 4px;
    line-height: 1.8;

    &:hover {
        color: var(--flec-btn-hover);
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

    .card-tag-cloud {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;

        &.is-expanded {
            max-height: 1000px;
        }
    }
}
</style>