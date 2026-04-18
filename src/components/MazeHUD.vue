<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  hasKey: boolean
  won: boolean
  elapsed: string
}>()

const emit = defineEmits<{ replay: [] }>()
</script>

<template>
  <div class="maze-hud">
    <!-- Timer -->
    <div class="hud-timer">
      <UIcon name="i-lucide-timer" class="text-sm" />
      <span class="font-mono text-sm">{{ elapsed }}</span>
    </div>

    <!-- Objective -->
    <div class="hud-objective">
      <template v-if="won">
        <div class="hud-win">
          <span class="win-text">🎉 {{ t('maze.winMessage', { time: elapsed }) }}</span>
          <button class="cyber-replay-btn" @click="emit('replay')">
            <UIcon name="i-lucide-rotate-ccw" class="text-sm" />
            {{ t('maze.replay') }}
          </button>
        </div>
      </template>
      <template v-else>
        <span class="objective-icon">{{ hasKey ? '🚪' : '🔑' }}</span>
        <span class="text-xs">{{ hasKey ? t('maze.objectiveExit') : t('maze.objectiveKey') }}</span>
      </template>
    </div>

    <!-- Instructions -->
    <div v-if="!won" class="hud-instructions">
      {{ t('maze.instructions') }}
    </div>
  </div>
</template>

<style scoped>
.maze-hud {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hud-timer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #00cfff;
  text-shadow: 0 0 6px rgba(0, 207, 255, 0.5);
}

.hud-objective {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 0.5rem;
  background: rgba(0, 207, 255, 0.06);
  border: 1px solid rgba(0, 207, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.objective-icon {
  font-size: 1rem;
}

.hud-win {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.win-text {
  color: #ffef00;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 239, 0, 0.5);
}

.cyber-replay-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  border-radius: 0.5rem;
  background: rgba(0, 207, 255, 0.1);
  border: 1px solid rgba(0, 207, 255, 0.3);
  color: #00cfff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cyber-replay-btn:hover {
  background: rgba(0, 207, 255, 0.2);
  box-shadow: 0 0 12px rgba(0, 207, 255, 0.3);
}

.hud-instructions {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}
</style>

