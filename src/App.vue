<script setup lang="ts">
import ApiStatus from '@/components/ApiStatus.vue'
</script>

<template>
  <main>
    <h1>Oasis</h1>
    <ApiStatus />
  </main>
</template>

<style scoped>
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}
</style>
