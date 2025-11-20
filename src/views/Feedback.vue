<script setup lang="ts">
import FeedbackForm from '@/components/features/feedback/FeedbackForm.vue'

const handleSuccess = () => {
  // 提交成功后的处理
  console.log('Feedback submitted successfully')
}
</script>

<template>
  <div id="page">
    <div class="page-title">反馈投诉</div>

    <div class="feedback-content">
      <FeedbackForm @success="handleSuccess" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/mixins' as *;

#page {
  @extend .cardHover;
  align-self: flex-start;
  padding: 40px;

  .page-title {
    margin: 0 0 30px;
    font-weight: bold;
    font-size: 2rem;
    color: var(--font-color);
  }
}

.feedback-content {
  max-width: 100%;
}

@media (max-width: 768px) {
  #page {
    padding: 20px;

    .page-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
  }
}
</style>
