<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getArchiveStats } from '@/api/stats'
import type { ArchiveItem } from '@/types/stats'

const archives = ref<ArchiveItem[]>([])
const isExpanded = ref(false)
const toggleExpand = () => isExpanded.value = !isExpanded.value

// 获取归档统计数据
const fetchArchives = async () => {
    try {
        const data = await getArchiveStats()
        archives.value = data.archives
    } catch (error) {
        console.error('获取归档统计失败:', error)
    }
}

// 格式化归档数据用于显示
const recentArchives = computed(() => 
    archives.value.map(archive => ({
        year: archive.year,
        month: archive.month,
        displayText: `${archive.year} ${archive.month}`,
        count: archive.count
    }))
)

onMounted(fetchArchives)
</script>

<template>
    <div class="card-widget card-archives">
        <div class="item-headline" :class="{ 'is-expanded': isExpanded }">
            <i class="ri-archive-fill"></i>
            <span>归档</span>
            <i class="collapse-icon ri-arrow-left-s-fill" :class="{ 'is-expanded': isExpanded }" @click="toggleExpand"></i>
        </div>
        <ul class="card-list" :class="{ 'is-expanded': isExpanded }">
            <li class="card-list-item" v-for="archive in recentArchives" :key="`${archive.year}-${archive.month}`">
                <router-link class="card-list-link" :to="`/archive/${archive.year}/${archive.month}`" :aria-label="`查看 ${archive.displayText} 的归档，共 ${archive.count} 篇文章`">
                    <span class="card-list-name">{{ archive.displayText }}</span>
                    <span class="card-list-count" aria-hidden="true">{{ archive.count }}</span>
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