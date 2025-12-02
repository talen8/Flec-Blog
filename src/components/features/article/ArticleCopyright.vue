<script lang="ts" setup>
import { computed } from 'vue'
import type { Article } from '@/types/article'
import { formatDate } from '@/utils/date'

const props = defineProps<{ article: Article }>()

const articleUrl = computed(() => window.location.origin + props.article.url)
</script>

<template>
    <div class="post-copyright">
        <div class="copyright-left">
            <div class="copyright-title">{{ article.title }}</div>
            <div class="copyright-link">{{ articleUrl }}</div>
            <div class="copyright-info">
                <div class="info-item">
                    <span class="label">作者</span>
                    <span class="value">M.Talen</span>
                </div>
                <div class="info-item">
                    <span class="label">发布于</span>
                    <span class="value">{{ formatDate(article.publish_time) }}</span>
                </div>
                <div class="info-item" v-if="article.update_time">
                    <span class="label">更新于</span>
                    <span class="value">{{ formatDate(article.update_time) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">许可协议</span>
                    <span class="value">
                        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank"
                            rel="noopener noreferrer" class="license-link">
                            CC BY-NC-SA 4.0
                        </a>
                    </span>
                </div>
            </div>
        </div>
        <div class="copyright-icon">
            <i class="ri-creative-commons-line"></i>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

.post-copyright {
    @extend .cardHover;
    margin: 40px 0;
    padding: 10px 20px;
    position: relative;
    overflow: hidden;

    .copyright-left {
        display: flex;
        flex-direction: column;
    }

    .copyright-title {
        font-size: 1.4rem;
        font-weight: 500;
    }

    .copyright-link {
        color: var(--font-color);
        opacity: 0.6;
        margin-bottom: 8px;
    }

    .copyright-info {
        display: flex;
        gap: 24px;
        align-items: flex-start;
    }

    .info-item {
        font-size: 0.9rem;
        display: flex;
        flex-direction: column;
    }

    .label {
        font-weight: 400;
        color: var(--font-color);
        opacity: 0.7;
    }

    .value {
        line-height: 1.6;
    }

    .license-link {
        color: var(--font-color);
        text-decoration: none;

        &:hover {
            opacity: 0.7;
        }
    }

    .copyright-icon {
        position: absolute;
        right: -60px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.15;

        i {
            font-size: 260px;
            color: var(--font-color);
        }
    }
}

@media screen and (max-width: 768px) {
    .post-copyright {
        margin: 30px 0;

        .copyright-title {
            font-size: 1.2rem;
            margin-bottom: 6px;
        }

        .copyright-link {
            word-break: break-all;
            margin-bottom: 6px;
        }
    }
}

@media screen and (max-width: 600px) {
    .post-copyright {
        .copyright-info {
            flex-wrap: wrap;
            gap: 4px 0;
        }

        .info-item {
            flex: 1 1 28%;
        }
    }
}
</style>
