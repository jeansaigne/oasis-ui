<script setup lang="ts">
import TicTacToe from '@/components/TicTacToe.vue'
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/games" />
      <UIcon name="i-lucide-hash" class="text-2xl text-(--ui-primary)" />
      <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">{{ $t('ticTacToe.title') }}</h2>
    </div>
    <TicTacToe />
  </div>
</template>
