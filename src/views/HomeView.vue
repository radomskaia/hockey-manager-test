<script setup lang="ts">
import PlayerStats from '@/components/PlayerStats.vue'
</script>

<template>
  <main class="home-view">
    <PlayerStats />
  </main>
</template>

<style scoped lang="scss">
.home-view {
  max-width: 94rem;
  margin: 0 auto;
  padding: 40px 20px;
}
</style>
