<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ApiStatus from '@/components/ApiStatus.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'

const route = useRoute()
const isFullWidth = computed(() => route.meta.fullWidth === true)
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-(--ui-bg)">
      <header v-if="!isFullWidth" class="border-b border-(--ui-border) bg-(--ui-bg-elevated)">
        <div class="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-layout-grid" class="text-2xl text-(--ui-primary)" />
            <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ $t('app.title') }}</h1>
          </div>
          <div class="flex items-center gap-2">
            <LangSwitcher />
            <UColorModeButton />
          </div>
        </div>
      </header>

      <main :class="isFullWidth ? 'px-0 py-0' : 'mx-auto max-w-5xl px-6 py-10'">
        <router-view />
      </main>

      <ApiStatus />
    </div>
  </UApp>
</template>
