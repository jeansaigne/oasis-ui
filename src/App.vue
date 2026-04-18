<script setup lang="ts">
import ApiStatus from '@/components/ApiStatus.vue'
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-(--ui-bg)">
      <header class="border-b border-(--ui-border) bg-(--ui-bg-elevated)">
        <div class="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-layout-grid" class="text-2xl text-(--ui-primary)" />
            <h1 class="text-xl font-bold text-(--ui-text-highlighted)">Oasis</h1>
          </div>
          <UColorModeButton />
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-6 py-10">
        <router-view />
      </main>

      <ApiStatus />
    </div>
  </UApp>
</template>
