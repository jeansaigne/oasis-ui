<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="py-12">
    <div class="flex justify-center">
      <div class="cyber-tile-wrapper w-full max-w-2xl">
        <UCard class="cyber-tile">
          <div class="text-center space-y-6 py-6">
            <div class="inline-flex items-center justify-center rounded-full bg-(--ui-bg-accented) p-4">
              <UIcon name="i-lucide-sparkles" class="text-3xl text-(--ui-primary)" />
            </div>

            <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
              {{ $t('welcome.title') }}
            </h1>

            <p class="text-base text-(--ui-text-muted) max-w-lg mx-auto">
              {{ $t('welcome.lede') }}
            </p>

            <blockquote
              class="italic text-sm text-(--ui-text-muted) border-l-2 border-(--ui-primary) pl-4 max-w-md mx-auto text-left"
            >
              {{ $t('welcome.quote') }}
              <footer class="mt-1 text-xs opacity-70">— {{ $t('welcome.quoteAuthor') }}</footer>
            </blockquote>

            <div v-if="!auth.isAuthenticated" class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <UButton
                to="/login"
                color="primary"
                size="lg"
                icon="i-lucide-log-in"
                :label="$t('auth.actions.login')"
              />
              <UButton
                to="/register"
                color="primary"
                variant="soft"
                size="lg"
                icon="i-lucide-user-plus"
                :label="$t('auth.actions.register')"
              />
            </div>

            <div v-else class="pt-2">
              <UButton
                to="/"
                color="primary"
                size="lg"
                icon="i-lucide-arrow-right"
                :label="$t('welcome.enter')"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style>
@property --cyber-angle-welcome {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
</style>

<style scoped>
.cyber-tile-wrapper {
  --cyber-angle-welcome: 0deg;
  position: relative;
  border-radius: calc(var(--ui-radius) * 2);
  padding: 2px;
  background: conic-gradient(
    from var(--cyber-angle-welcome),
    #ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080
  );
  animation: cyber-spin-welcome 5s linear infinite;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(255, 0, 128, 0.15),
    0 0 60px rgba(0, 207, 255, 0.1);
}
.cyber-tile {
  border-radius: calc(var(--ui-radius) * 2 - 1px) !important;
  background: var(--ui-bg-elevated);
}
@keyframes cyber-spin-welcome {
  0% { --cyber-angle-welcome: 0deg; }
  100% { --cyber-angle-welcome: 360deg; }
}
</style>

