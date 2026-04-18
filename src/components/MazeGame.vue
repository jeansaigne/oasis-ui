<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateMaze, canMove, movePos, type MazeData } from '@/composables/useMaze'
import MazeRenderer from './MazeRenderer.vue'
import MazeHUD from './MazeHUD.vue'
import MazeControls from './MazeControls.vue'

const { t } = useI18n()

const MAZE_SIZE = 15
const CELL_SIZE = 28

const maze = ref<MazeData>(generateMaze(MAZE_SIZE, MAZE_SIZE))
const playerPos = ref({ ...maze.value.start })
const hasKey = ref(false)
const won = ref(false)
const startTime = ref(Date.now())
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const keyPos = computed(() => hasKey.value ? null : maze.value.key)

const elapsed = computed(() => {
    const ms = now.value - startTime.value
  const totalSec = Math.floor(ms / 1000)
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const sec = String(totalSec % 60).padStart(2, '0')
  return `${min}:${sec}`
})

function startTimer() {
  stopTimer()
  startTime.value = Date.now()
  now.value = Date.now()
  timer = setInterval(() => { now.value = Date.now() }, 200)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function move(dir: 'up' | 'down' | 'left' | 'right') {
  if (won.value) return
  if (!canMove(maze.value, playerPos.value, dir)) return
  playerPos.value = movePos(playerPos.value, dir)

  // Pick up key
  if (!hasKey.value && playerPos.value.x === maze.value.key.x && playerPos.value.y === maze.value.key.y) {
    hasKey.value = true
  }

  // Check exit
  if (hasKey.value && playerPos.value.x === maze.value.exit.x && playerPos.value.y === maze.value.exit.y) {
    won.value = true
    now.value = Date.now()
    stopTimer()
  }
}

function replay() {
  maze.value = generateMaze(MAZE_SIZE, MAZE_SIZE)
  playerPos.value = { ...maze.value.start }
  hasKey.value = false
  won.value = false
  startTimer()
}

function onKeyDown(e: KeyboardEvent) {
  const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  }
  const dir = map[e.key]
  if (dir) { e.preventDefault(); move(dir) }
}

onMounted(() => {
  globalThis.addEventListener('keydown', onKeyDown)
  startTimer()
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', onKeyDown)
  stopTimer()
})
</script>

<template>
  <div class="maze-game">
    <MazeHUD :has-key="hasKey" :won="won" :elapsed="elapsed" @replay="replay" />

    <div class="maze-canvas-wrapper">
      <MazeRenderer
        :maze="maze"
        :player-pos="playerPos"
        :key-pos="keyPos"
        :has-key="hasKey"
        :cell-size="CELL_SIZE"
      />
    </div>

    <MazeControls @move="move" />
  </div>
</template>

<style scoped>
.maze-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.maze-canvas-wrapper {
  overflow: auto;
  max-width: 100%;
  max-height: 60vh;
  border-radius: 0.5rem;
}
</style>

