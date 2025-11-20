<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useStatsStore } from "@/stores/stats";
import { useArticlesStore } from "@/stores/articles";
import { useCategoriesStore } from "@/stores/categories";
import { useTagsStore } from "@/stores/tags";
import photoImg from "@/assets/img/photo.png";
import exhibitionImg from "@/assets/img/exhibition.png";
import infjImg from "@/assets/img/infj-a.png";

const statsStore = useStatsStore();
const articlesStore = useArticlesStore();
const categoriesStore = useCategoriesStore();
const tagsStore = useTagsStore();

const { siteStats } = storeToRefs(statsStore);
const { total: articleTotal } = storeToRefs(articlesStore);
const { total: categoryTotal } = storeToRefs(categoriesStore);
const { total: tagTotal } = storeToRefs(tagsStore);

// 配置
const info = {
  author: "M.Talen",
  describe:
    "持续学习的终身践行者，用代码和文字构建小小世界。在这里记录技术洞见、思考碎片和生活灵感。保持好奇，步履不停。",
  describeTips: "前端工程师 · 业余 · 专注 · 享受生活",
  photo: photoImg,
  exhibitionImg,
  profile: [
    { label: "姓名", value: "刘明浩", color: "#43a6c6" },
    { label: "生于", value: "2004", color: "#c69043" },
    { label: "故乡", value: "山东济宁", color: "#d44040" },
    { label: "职业", value: "自由职业", color: "#b04fe6" },
    { label: "兴趣", value: "享受生活", color: "#43c66f" },
    { label: "梦想", value: "创造价值", color: "#c643b3" },
  ],
  personality: {
    type: "INFJ-A",
    name: "提倡者",
    color: "#56a178",
    image: infjImg,
    url: "https://www.16personalities.com/ch/infj-%E4%BA%BA%E6%A0%BC",
  },
  motto: {
    main: ["前景可待，", "未来可期。"],
    sub: "活在自己的热爱里，而不是别人的眼光里。",
  },
  socialize: [
    { icon: "QQ", url: "https://qm.qq.com/q/xxx" },
    { icon: "微信", url: "#wechat" },
    { icon: "Twitter", url: "https://twitter.com" },
    { icon: "Email", url: "mailto:example@example.com" },
    { icon: "GitHub", url: "https://github.com" },
  ],
  creation: [
    { icon: "腾讯云开发者社区", url: "https://cloud.tencent.com/developer" },
    { icon: "公众号", url: "#" },
    { icon: "稀土掘金", url: "https://juejin.cn" },
    { icon: "哔哩哔哩", url: "https://bilibili.com" },
  ],
  versions: [
    { name: "Vue", version: "3.5.0" },
    { name: "Go", version: "1.25.0" },
    { name: "PostgreSQL", version: "16.1" },
  ],
  union: [
    { icon: "BlogFinder", url: "https://bf.zzxworld.com" },
    { icon: "个站商店", url: "https://storeweb.cn" },
    { icon: "博友圈", url: "https://www.boyouquan.com" },
    { icon: "博客志", url: "https://www.jetli.com.cn" },
  ],
  story: `创建这个站的时候，想要就是能够有一个自己能够积累知识、积累兴趣的地方。和他人分享，会让这些成为积累和沉淀。如果能够帮助到更多的人，帮助更多人解决问题，那一定是非常棒的事情。

与大多数垂直类的技术博客不同，这里的种类会非常的繁杂，有技能的教程干货、有生活上的吐槽和妙招、有话题上的思考和想法。一般我研究什么、发现了什么都会分享在这里。

这些就是创造这个小站的本意，也是我分享生活的方式。有幸能和你相遇在这里，相信我们能共同留下一段美好记忆。`,
};

const runTime = computed(() => {
  const days = Math.floor(
    (Date.now() - new Date("2024-01-01").getTime()) / 864e5
  );
  return `已稳定运行 ${days} 天 🚀`;
});

const formatWords = (words: string) => {
  const n = +words;
  return n >= 1e4
    ? (n / 1e4).toFixed(1) + "w"
    : n >= 1e3
      ? (n / 1e3).toFixed(1) + "k"
      : words;
};

onMounted(() =>
  Promise.all([
    statsStore.fetchStats(),
    articlesStore.fetchArticles(),
    categoriesStore.fetchCategories(),
    tagsStore.fetchTags()
  ])
);
</script>

<template>
  <div id="about-page">
    <!-- 个人介绍 -->
    <div class="Personal-Introduction">
      <div class="PI-box-left">
        <div class="title">你好！</div>
        <div class="title">我是 {{ info.author }}</div>
        <div class="describe">{{ info.describe }}</div>
        <span class="describe-tips">{{ info.describeTips }}</span>
        <div class="PI-button">
          <a href="#one">博主信息</a>
          <a href="#two">本站信息</a>
        </div>
      </div>
      <div class="PI-box-right">
        <img :src="info.photo" alt="个人照片" />
      </div>
    </div>

    <!-- 博主信息 -->
    <div id="one">
      <div class="h1-box">
        <div class="box-top">
          <span>01</span>
          <div class="title-h1">博主信息</div>
        </div>
        <div class="about-layout box-bottom">{{ info.author }}</div>
      </div>
      <div class="information">
        <div class="about-layout Introduction">
          <div v-for="n in 2" :key="n" class="bar-box-row">
            <div v-for="item in info.profile.slice((n - 1) * 3, n * 3)" :key="item.label" class="bar-box">
              <span class="tips">{{ item.label }}</span>
              <div class="title" :style="{ color: item.color }">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
        <div class="about-layout Exhibition">
          <img :src="info.exhibitionImg" alt="展示图片" />
        </div>
      </div>
    </div>

    <!-- 性格与座右铭 -->
    <div class="Philosophical">
      <div class="about-layout P-box-left">
        <div class="tips">性格</div>
        <div class="title">{{ info.personality.name }}</div>
        <div class="title" :style="{ color: info.personality.color }">
          {{ info.personality.type }}
        </div>
        <img class="image" :src="info.personality.image" alt="性格类型" />
        <div class="tips-bottom">
          在
          <a href="https://www.16personalities.com/ch" target="_blank">16Personalities</a>
          了解关于
          <a :href="info.personality.url" target="_blank">{{
            info.personality.name
          }}</a>&ensp;的更多信息
        </div>
      </div>
      <div class="about-layout P-box-right">
        <div class="tips">座右铭</div>
        <span class="title" style="opacity: 0.6; margin-bottom: 8px">{{
          info.motto.main[0]
        }}</span>
        <span class="title">{{ info.motto.main[1] }}</span>
        <div class="tips-bottom">{{ info.motto.sub }}</div>
      </div>
    </div>

    <!-- 联系方式与创作平台 -->
    <div class="Platform">
      <div class="about-layout Socialize">
        <div class="tips">账号</div>
        <div class="title">联系方式</div>
        <div class="S-box">
          <a v-for="item in info.socialize" :key="item.icon" class="btn-layout" :href="item.url" target="_blank">{{
            item.icon }}</a>
        </div>
      </div>
      <div class="about-layout Creation">
        <div class="tips">订阅</div>
        <div class="title">创作平台</div>
        <div class="S-box">
          <a v-for="item in info.creation" :key="item.icon" class="btn-layout" :href="item.url" target="_blank">{{
            item.icon }}</a>
        </div>
      </div>
    </div>

    <!-- 本站信息 -->
    <div id="two">
      <div class="h1-box">
        <div class="box-top">
          <span>02</span>
          <div class="title-h1">本站信息</div>
        </div>
        <div class="about-layout box-bottom">{{ runTime }}</div>
      </div>
      <div class="information">
        <div class="about-layout Version">
          <div v-for="v in info.versions" :key="v.name" class="V-box">
            <div class="title">{{ v.name }}</div>
            <div class="tips-v">V{{ v.version }}</div>
          </div>
        </div>
        <div class="about-layout Statistics">
          <span>{{ articleTotal }}篇文章</span>
          <span>{{ categoryTotal }}个分类</span>
          <span>{{ tagTotal }}个标签</span>
          <span v-if="siteStats.total_words">{{ formatWords(siteStats.total_words) }}字</span>
        </div>
      </div>
    </div>

    <!-- 访问统计与站长联盟 -->
    <div class="data">
      <div class="about-layout statistic">
        <div class="tips">浏览</div>
        <div class="title">访问统计</div>
        <div id="statistic">
          <div>
            <span class="tips">今日访客</span><span>{{ siteStats.today_visitors || 0 }}</span>
          </div>
          <div>
            <span class="tips">今日访问</span><span>{{ siteStats.today_pageviews || 0 }}</span>
          </div>
          <div>
            <span class="tips">昨日访客</span><span>{{ siteStats.yesterday_visitors || 0 }}</span>
          </div>
          <div>
            <span class="tips">昨日访问</span><span>{{ siteStats.yesterday_pageviews || 0 }}</span>
          </div>
          <div>
            <span class="tips">本月访问</span><span>{{ siteStats.month_pageviews || 0 }}</span>
          </div>
        </div>
        <a class="T-btn" href="/archive">更多统计</a>
      </div>
      <div class="about-layout union">
        <div class="tips">共创</div>
        <div class="title">站长联盟</div>
        <div class="U-box">
          <a v-for="item in info.union" :key="item.icon" class="btn-layout" :href="item.url" target="_blank">{{
            item.icon }}</a>
        </div>
      </div>
    </div>

    <!-- 心路历程 -->
    <div class="about-layout content">
      <div class="tips">心路历程</div>
      <div class="title">关于本站的介绍</div>
      <p>{{ info.story }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/css/mixins" as *;

#about-page {
  @extend .cardHover;
  padding: 40px;

  .about-layout {
    @extend .cardHover;
    border-radius: 12px;
    position: relative;
    padding: 1rem 2rem;
    overflow: hidden;

    &:hover {
      border-color: var(--theme-color);
      transform: translateY(-2px);
    }
  }

  .title {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .tips {
    opacity: 0.8;
    font-size: 0.75rem;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }

  .tips-bottom {
    font-size: 0.875rem;
    position: absolute;
    bottom: 1rem;
    left: 2rem;

    a {
      font-weight: 600;
      text-decoration: none;
      color: var(--font-color);

      &:hover {
        color: var(--theme-color);
      }
    }
  }

  .btn-layout {
    @extend .cardHover;
    padding: 6px 18px;
    margin: 0 18px 18px 0;
    color: var(--font-color);
    text-decoration: none;
    display: inline-block;

    &:hover {
      background: var(--theme-color);
      color: #fff;
    }
  }

  .h1-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .box-top {
      margin: auto;
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        font-size: 100px;
        position: absolute;
        top: 0;
        left: -64px;
        opacity: 0.4;
      }

      .title-h1 {
        font-size: 42px;
        font-weight: 700;
        line-height: 1.1;
        margin: 0.5rem 0;
        letter-spacing: 0.2rem;
        color: var(--font-color);
      }
    }

    .box-bottom {
      padding: 1.25rem 2rem;
      display: inline-flex;
      justify-content: center;
      font-size: 18px;
    }
  }

  // 个人介绍
  .Personal-Introduction {
    display: flex;
    justify-content: space-between;
    padding: 2rem 0;

    .PI-box-left {
      margin-top: 1.5rem;
      color: var(--font-color);
      width: 60%;
      z-index: 1;

      .title {
        font-size: 42px;
        margin: 0.5rem 0;
        letter-spacing: 0.2rem;
      }

      .describe {
        font-size: 18px;
        letter-spacing: 0.2rem;
        margin-top: 2.25rem;
        opacity: 0.9;
      }

      .describe-tips {
        font-size: 16px;
        opacity: 0.4;
      }

      .PI-button {
        position: relative;
        top: 50px;
        display: flex;

        a {
          @extend .cardHover;
          padding: 6px 18px;
          margin-right: 16px;
          text-decoration: none;
          color: var(--font-color);

          &:hover {
            background: var(--theme-color);
            color: #fff;
          }
        }
      }
    }

    .PI-box-right {
      height: 550px;
      width: 40%;
      overflow: hidden;
      display: flex;
      justify-content: center;

      img {
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
      }
    }
  }

  // 博主信息
  #one {
    margin-top: 32px;
    display: flex;
    flex-direction: row-reverse;
    scroll-margin-top: 100px;

    .h1-box {
      width: 50%;
      margin-left: 16px;
      aspect-ratio: 1 / 1;
    }

    .information {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .Introduction {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 1rem;
        flex: 1;

        .bar-box-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .bar-box {
          flex: 1;
          text-align: center;
          padding: 1rem;
        }
      }

      .Exhibition {
        padding: 0;
        height: 76px;
        margin-top: 16px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        &:hover img {
          transform: scale(1.05);
        }
      }
    }
  }

  // 性格与座右铭
  .Philosophical {
    margin-top: 16px;
    min-height: 240px;
    display: flex;
    gap: 16px;

    .P-box-left {
      width: 60%;
      padding: 2.25rem 2rem;

      &:hover .image {
        transform: rotate(-10deg);
      }

      .image {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 200px;
        transition: transform 2s cubic-bezier(0.13, 0.45, 0.21, 1.02);
      }
    }

    .P-box-right {
      width: 40%;
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
    }
  }

  // 联系方式与创作平台
  .Platform {
    margin-top: 16px;
    display: flex;
    gap: 16px;

    .Socialize,
    .Creation {
      padding: 2.25rem 2rem;

      .S-box {
        margin-top: 2.25rem;
        display: flex;
        flex-wrap: wrap;
      }
    }

    .Socialize {
      width: 40%;
    }

    .Creation {
      width: 60%;
    }
  }

  // 本站信息
  #two {
    margin-top: 32px;
    display: flex;
    scroll-margin-top: 100px;

    .h1-box {
      width: 50%;
      margin-right: 16px;
      aspect-ratio: 1 / 1;
    }

    .information {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .Version {
        display: flex;
        flex: 1;
        margin-bottom: 16px;
        align-items: center;
        justify-content: space-around;

        .V-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          color: var(--font-color);
          z-index: 1;
        }

        .tips-v {
          font-size: 0.875rem;
          color: var(--theme-meta-color);
          margin-top: 0.5rem;
        }
      }

      .Statistics {
        padding: 1.25rem 2rem;
        display: inline-flex;
        justify-content: space-between;

        span {
          font-size: 18px;
        }
      }
    }
  }

  // 访问统计与站长联盟
  .data {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;

    .statistic {
      width: calc(65% - 8px);
      padding: 2.25rem 2rem;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0c1c2c 0%, #1a3a52 100%);
      color: #fff;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 30% 50%,
            rgba(73, 177, 245, 0.15) 0%,
            transparent 50%),
          radial-gradient(circle at 70% 80%,
            rgba(120, 194, 244, 0.1) 0%,
            transparent 50%);
        pointer-events: none;
      }

      &>* {
        z-index: 1;
      }

      #statistic {
        display: flex;
        justify-content: space-between;
        margin: auto 0;

        div {
          margin: 0 16px 16px 0;

          span:last-child {
            font-size: 36px;
            font-weight: 700;
            color: #fff;
            display: block;
            margin-top: 0.5rem;
          }
        }
      }

      .T-btn {
        @extend .cardHover;
        position: absolute;
        bottom: 1rem;
        right: 2rem;
        height: 40px;
        width: 160px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: var(--font-color);

        &:hover {
          background: var(--theme-color);
          color: #fff;
        }
      }
    }

    .union {
      width: calc(35% - 8px);
      padding: 2.25rem 2rem;

      .U-box {
        margin-top: 1.25rem;
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  // 心路历程
  .content {
    margin-top: 16px;
    padding: 2.25rem 2rem;

    p {
      white-space: pre-line;
      line-height: 1.8;
      margin-top: 1rem;
      color: var(--font-color);
      opacity: 0.9;
    }
  }
}

// 响应式设计
@media screen and (max-width: 1024px) {
  #about-page {
    padding: 30px;

    .about-layout {
      padding: 1rem 1.5rem;
    }

    .title {
      font-size: 2rem;
    }

    .h1-box {
      .box-top {
        span {
          font-size: 80px;
          left: -50px;
        }

        .title-h1 {
          font-size: 36px;
        }
      }
    }

    .Personal-Introduction {
      .PI-box-left {
        .title {
          font-size: 36px;
        }

        .describe {
          font-size: 16px;
        }
      }
    }

    #one,
    #two {
      .h1-box {
        margin: 0 12px;
      }
    }

    .Philosophical {
      .P-box-left {
        .image {
          width: 180px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  #about-page {
    padding: 18px;

    .h1-box .box-top span {
      display: none;
    }

    .Personal-Introduction {
      .PI-box-left {
        width: 100%;

        .describe {
          font-size: 16px;
          letter-spacing: 0;
        }

        .describe-tips {
          font-size: 12px;
        }

        .PI-button {
          position: static;
          margin-top: 10px;
        }
      }

      .PI-box-right {
        display: none;
      }
    }

    #one,
    #two {
      flex-direction: column;

      .h1-box {
        width: 100%;
        height: 220px;
        margin: 0 0 16px;
      }

      .information {
        .Introduction .bar-box-row {
          flex-direction: column;
          gap: 12px;
        }

        .Exhibition {
          margin: 16px 0;
        }

        .Version {
          flex-direction: column;

          .V-box {
            margin: 16px 0;
          }
        }

        .Statistics {
          flex-wrap: wrap;

          span {
            width: 50%;
            text-align: center;
            margin: 0;
          }
        }
      }
    }

    .Philosophical {
      flex-direction: column;
      gap: 0;
      margin-top: 0;

      .P-box-left,
      .P-box-right {
        width: 100%;
        height: 210px;
        margin-bottom: 16px;
      }

      .P-box-left .image {
        width: 120px;
        right: 18px;
        top: 40px;
      }
    }

    .Platform {
      flex-direction: column;
      gap: 0;

      .Socialize,
      .Creation {
        width: 100%;
        margin-bottom: 16px;
      }
    }

    .data {
      flex-direction: column;

      .statistic {
        width: 100%;
        margin-bottom: 16px;

        #statistic {
          flex-wrap: wrap;
          margin: 1.25rem 0;

          div {
            margin: 0 0 16px;
            width: 50%;
          }
        }

        .T-btn {
          display: none;
        }
      }

      .union {
        width: 100%;
      }
    }
  }
}
</style>
