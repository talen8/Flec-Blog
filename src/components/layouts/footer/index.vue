<script lang="ts" setup>
import FooterContact from './FooterContact.vue'
import FooterNavigation from './FooterNavigation.vue'
import FooterCopyright from './FooterCopyright.vue'
</script>

<template>
  <footer id="footer">
    <FooterContact />
    <FooterNavigation />
    <FooterCopyright />
  </footer>
</template>

<style lang="scss" scoped>
#footer {
  position: relative;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  width: 100%;
  background: linear-gradient(to top, var(--flec-card-bg) 65%, var(--flec-page-bg) 90%);
}
</style>

