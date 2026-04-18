<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApiStatus from '@/components/ApiStatus.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isFullWidth = computed(() => route.meta.fullWidth === true)
const isAuthRoute = computed(() =>
  ['login', 'register', 'forgot-password', 'reset-password'].includes(String(route.name)),
)

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-(--ui-bg)">
      <header v-if="!isFullWidth" class="border-b border-(--ui-border) bg-(--ui-bg-elevated)">
        <div class="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <RouterLink :to="auth.isAuthenticated ? '/' : '/login'" class="flex items-center gap-3">
            <UIcon name="i-lucide-layout-grid" class="text-2xl text-(--ui-primary)" />
            <h1 class="text-xl font-bold text-(--ui-text-highlighted)">{{ $t('app.title') }}</h1>
          </RouterLink>
          <div class="flex items-center gap-2">
            <template v-if="auth.isAuthenticated">
              <span class="hidden sm:inline text-sm text-(--ui-text-muted)">
                {{ auth.user?.username }}
              </span>
              <UButton
                icon="i-lucide-log-out"
                size="sm"
                variant="ghost"
                color="neutral"
                :label="$t('auth.actions.logout')"
                @click="onLogout"
              />
            </template>
            <template v-else-if="!isAuthRoute">
              <UButton to="/login" size="sm" variant="ghost" :label="$t('auth.actions.login')" />
              <UButton to="/register" size="sm" color="primary" :label="$t('auth.actions.register')" />
            </template>
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
