<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const apps = computed(() => [
  {
    title: t('apps.games.title'),
    description: t('apps.games.description'),
    icon: 'i-lucide-dices',
    color: 'primary' as const,
    disabled: false,
    route: '/games',
  },
  {
    title: t('apps.drawing.title'),
    description: t('apps.drawing.description'),
    icon: 'i-lucide-brush',
    color: 'primary' as const,
    disabled: false,
    route: '/dessin',
  },
  {
    title: t('apps.trading.title'),
    description: t('apps.trading.description'),
    icon: 'i-lucide-chart-candlestick',
    color: 'success' as const,
    disabled: true,
    route: '',
  },
  {
    title: t('apps.finances.title'),
    description: t('apps.finances.description'),
    icon: 'i-lucide-wallet',
    color: 'info' as const,
    disabled: true,
    route: '',
  },
])
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">{{ $t('home.heading') }}</h2>
      <p class="mt-1 text-(--ui-text-muted)">{{ $t('home.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="app in apps"
        :key="app.title"
        class="cyber-tile-wrapper"
        :class="{ 'opacity-50 cursor-not-allowed': app.disabled }"
      >
        <UCard class="cyber-tile">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-(--ui-bg-accented) p-2.5">
              <UIcon :name="app.icon" class="text-xl" :class="`text-(--ui-${app.color})`" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-(--ui-text-highlighted)">{{ app.title }}</h3>
              <p class="mt-1 text-sm text-(--ui-text-muted)">{{ app.description }}</p>
            </div>
          </div>
          <template #footer v-if="!app.disabled">
            <UButton :label="$t('home.open')" :color="app.color" variant="soft" block :to="app.route" />
          </template>
          <template #footer v-else>
            <UBadge :label="$t('home.comingSoon')" color="neutral" variant="subtle" />
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style>
@property --cyber-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
</style>

<style scoped>
.cyber-tile-wrapper {
  --cyber-angle: 0deg;
  position: relative;
  border-radius: calc(var(--ui-radius) * 2);
  padding: 2px;
  background: conic-gradient(
    from var(--cyber-angle),
    #ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080
  );
  animation: cyber-spin 3s linear infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.06);
}

.cyber-tile-wrapper:hover {
  transform: translateY(-6px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(255, 0, 128, 0.3),
    0 0 40px rgba(0, 207, 255, 0.2);
}

.cyber-tile {
  border-radius: calc(var(--ui-radius) * 2 - 1px) !important;
  background: var(--ui-bg-elevated);
  height: 100%;
}

@keyframes cyber-spin {
  0% { --cyber-angle: 0deg; }
  100% { --cyber-angle: 360deg; }
}
</style>
