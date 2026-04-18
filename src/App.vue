<script setup lang="ts">
import ApiStatus from '@/components/ApiStatus.vue'

const apps = [
  {
    title: 'Jeux de société',
    description: 'Bibliothèque de jeux, soirées et statistiques de parties',
    icon: 'i-lucide-dices',
    color: 'primary' as const,
    disabled: false,
  },
  {
    title: 'Trading',
    description: 'Suivi de portefeuille, analyses et alertes de marché',
    icon: 'i-lucide-chart-candlestick',
    color: 'success' as const,
    disabled: true,
  },
  {
    title: 'Finances personnelles',
    description: 'Budget, dépenses et objectifs d\'épargne',
    icon: 'i-lucide-wallet',
    color: 'info' as const,
    disabled: true,
  },
]
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
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">Applications</h2>
          <p class="mt-1 text-(--ui-text-muted)">Bienvenue sur Oasis, votre plateforme d'applications.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="app in apps"
            :key="app.title"
            class="cyber-tile-wrapper"
            :class="{ 'opacity-50 cursor-not-allowed': app.disabled }"
          >
          <UCard
            class="cyber-tile"
          >
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
              <UButton label="Ouvrir" :color="app.color" variant="soft" block />
            </template>
            <template #footer v-else>
              <UBadge label="Bientôt disponible" color="neutral" variant="subtle" />
            </template>
          </UCard>
          </div>
        </div>
      </main>

      <ApiStatus />
    </div>
  </UApp>
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
