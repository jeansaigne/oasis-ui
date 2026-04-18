<script setup lang="ts">
import { ref, computed } from 'vue'

type CellValue = 'X' | 'O' | null
type Board = CellValue[]

const board = ref<Board>(new Array(9).fill(null))
const currentPlayer = ref<'X' | 'O'>('X')
const score = ref({ X: 0, O: 0, draw: 0 })

function checkLine(a: number, b: number, c: number): boolean {
  return !!board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]
}

const winningCombo = computed<[number, number, number] | null>(() => {
  if (checkLine(0, 1, 2)) return [0, 1, 2]
  if (checkLine(3, 4, 5)) return [3, 4, 5]
  if (checkLine(6, 7, 8)) return [6, 7, 8]
  if (checkLine(0, 3, 6)) return [0, 3, 6]
  if (checkLine(1, 4, 7)) return [1, 4, 7]
  if (checkLine(2, 5, 8)) return [2, 5, 8]
  if (checkLine(0, 4, 8)) return [0, 4, 8]
  if (checkLine(2, 4, 6)) return [2, 4, 6]
  return null
})

const winner = computed<CellValue>(() => {
  const combo = winningCombo.value
  if (!combo) return null
  return board.value[combo[0]] ?? null
})

const isDraw = computed(() => !winner.value && board.value.every((c) => c !== null))
const gameOver = computed(() => !!winner.value || isDraw.value)

const statusText = computed(() => {
  if (winner.value) return `Joueur ${winner.value} remporte la manche !`
  if (isDraw.value) return 'Match nul !'
  return `Tour du joueur ${currentPlayer.value}`
})

function play(index: number) {
  if (board.value[index] || gameOver.value) return
  board.value[index] = currentPlayer.value
  if (winner.value) {
    score.value[winner.value]++
  } else if (isDraw.value) {
    score.value.draw++
  } else {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
  }
}

function reset() {
  board.value = new Array(9).fill(null)
  currentPlayer.value = 'X'
}

function isWinningCell(index: number) {
  return winningCombo.value?.includes(index) ?? false
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Status -->
    <div class="text-lg font-bold tracking-wide cyber-status" :class="{ 'cyber-win': !!winner, 'cyber-draw': isDraw }">
      {{ statusText }}
    </div>

    <!-- Board -->
    <div class="ttt-board">
      <button
        v-for="(cell, i) in board"
        :key="i"
        class="ttt-cell"
        :class="{
          'ttt-cell--x': cell === 'X',
          'ttt-cell--o': cell === 'O',
          'ttt-cell--win': isWinningCell(i),
          'ttt-cell--playable': !cell && !gameOver,
        }"
        :disabled="!!cell || gameOver"
        @click="play(i)"
      >
        {{ cell }}
      </button>
    </div>

    <!-- New game -->
    <UButton label="Nouvelle partie" icon="i-lucide-rotate-ccw" color="primary" variant="soft" @click="reset" />

    <!-- Scoreboard -->
    <div class="flex gap-6 text-sm font-mono">
      <div class="flex flex-col items-center">
        <span class="text-(--ui-primary) font-bold text-lg">{{ score.X }}</span>
        <span class="text-(--ui-text-muted)">Joueur X</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-(--ui-text-dimmed) font-bold text-lg">{{ score.draw }}</span>
        <span class="text-(--ui-text-muted)">Nuls</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-(--ui-success) font-bold text-lg">{{ score.O }}</span>
        <span class="text-(--ui-text-muted)">Joueur O</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cyber-status {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 8px rgba(0, 207, 255, 0.4);
}
.cyber-win {
  color: #ffef00;
  text-shadow: 0 0 12px rgba(255, 239, 0, 0.6), 0 0 24px rgba(255, 239, 0, 0.3);
}
.cyber-draw {
  color: #8000ff;
  text-shadow: 0 0 12px rgba(128, 0, 255, 0.5);
}

.ttt-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  border-radius: calc(var(--ui-radius) * 2);
  background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(0, 207, 255, 0.15));
}

.ttt-cell {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  font-family: monospace;
  border-radius: var(--ui-radius);
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: default;
}

.ttt-cell--playable {
  cursor: pointer;
}
.ttt-cell--playable:hover {
  background: var(--ui-bg-accented);
  border-color: rgba(0, 207, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 207, 255, 0.2);
}

.ttt-cell--x {
  color: #00cfff;
  text-shadow: 0 0 10px rgba(0, 207, 255, 0.6);
}
.ttt-cell--o {
  color: #ff0080;
  text-shadow: 0 0 10px rgba(255, 0, 128, 0.6);
}
.ttt-cell--win {
  background: rgba(255, 239, 0, 0.1);
  border-color: rgba(255, 239, 0, 0.5);
  box-shadow: 0 0 16px rgba(255, 239, 0, 0.3);
}
</style>

