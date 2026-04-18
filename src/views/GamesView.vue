<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const games = computed(() => [
  {
    title: t('games.ticTacToe.title'),
    description: t('games.ticTacToe.description'),
    icon: 'i-lucide-hash',
    route: '/games/tic-tac-toe',
    disabled: false,
  },
  {
    title: t('games.connectFour.title'),
    description: t('games.connectFour.description'),
    icon: 'i-lucide-circle',
    route: '',
    disabled: true,
  },
  {
    title: t('games.battleship.title'),
    description: t('games.battleship.description'),
    icon: 'i-lucide-ship',
    route: '',
    disabled: true,
  },
])
</script>

<template>
  <div>
    <div class="mb-8 flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/" />
      <UIcon name="i-lucide-dices" class="text-2xl text-(--ui-primary)" />
      <div>
        <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">{{ $t('games.heading') }}</h2>
        <p class="text-sm text-(--ui-text-muted)">{{ $t('games.subtitle') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="game in games"
        :key="game.title"
        class="transition-all hover:shadow-lg"
        :class="{ 'opacity-50 cursor-not-allowed': game.disabled, 'hover:translate-y-[-4px]': !game.disabled }"
      >
        <div class="flex items-start gap-4">
          <div class="rounded-lg bg-(--ui-bg-accented) p-2.5">
            <UIcon :name="game.icon" class="text-xl text-(--ui-primary)" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-(--ui-text-highlighted)">{{ game.title }}</h3>
            <p class="mt-1 text-sm text-(--ui-text-muted)">{{ game.description }}</p>
          </div>
        </div>
        <template #footer v-if="!game.disabled">
          <UButton :label="$t('games.play')" color="primary" variant="soft" block :to="game.route" />
        </template>
        <template #footer v-else>
          <UBadge :label="$t('games.comingSoon')" color="neutral" variant="subtle" />
        </template>
      </UCard>
    </div>
  </div>
</template>
