  <script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { MazeData } from '@/composables/useMaze'

const props = defineProps<{
  maze: MazeData
  playerPos: { x: number; y: number }
  keyPos: { x: number; y: number } | null
  hasKey: boolean
  cellSize: number
}>()

const canvasRef = ref<HTMLCanvasElement>()

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { maze, cellSize: cs } = props
  const w = maze.width * cs
  const h = maze.height * cs

  canvas.width = w
  canvas.height = h
  ctx.clearRect(0, 0, w, h)

  // Floor
  ctx.fillStyle = '#0a0e17'
  ctx.fillRect(0, 0, w, h)

  // Subtle grid
  ctx.strokeStyle = 'rgba(0, 207, 255, 0.03)'
  ctx.lineWidth = 1
  for (let y = 0; y <= maze.height; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(w, y * cs); ctx.stroke()
  }
  for (let x = 0; x <= maze.width; x++) {
    ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, h); ctx.stroke()
  }

  // Walls
  ctx.strokeStyle = '#00cfff'
  ctx.lineWidth = 2
  ctx.shadowColor = '#00cfff'
  ctx.shadowBlur = 6

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y]![x]!
      const cx = x * cs
      const cy = y * cs
      if (cell.walls.top) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + cs, cy); ctx.stroke() }
      if (cell.walls.right) { ctx.beginPath(); ctx.moveTo(cx + cs, cy); ctx.lineTo(cx + cs, cy + cs); ctx.stroke() }
      if (cell.walls.bottom) { ctx.beginPath(); ctx.moveTo(cx, cy + cs); ctx.lineTo(cx + cs, cy + cs); ctx.stroke() }
      if (cell.walls.left) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cs); ctx.stroke() }
    }
  }
  ctx.shadowBlur = 0

  // Exit portal
  const ex = maze.exit.x * cs + cs / 2
  const ey = maze.exit.y * cs + cs / 2
  const portalColor = props.hasKey ? '#00ff88' : '#ff0080'
  ctx.shadowColor = portalColor
  ctx.shadowBlur = 14
  ctx.strokeStyle = portalColor
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(ex, ey, cs * 0.32, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(ex, ey, cs * 0.18, 0, Math.PI * 2)
  ctx.stroke()
  // Inner glow
  ctx.fillStyle = props.hasKey ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 0, 128, 0.1)'
  ctx.beginPath()
  ctx.arc(ex, ey, cs * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Key
  if (props.keyPos) {
    const kx = props.keyPos.x * cs + cs / 2
    const ky = props.keyPos.y * cs + cs / 2
    ctx.shadowColor = '#ffef00'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#ffef00'
    ctx.font = `${cs * 0.5}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🔑', kx, ky)
    ctx.shadowBlur = 0
  }

  // Player
  const px = props.playerPos.x * cs + cs / 2
  const py = props.playerPos.y * cs + cs / 2
  const pr = cs * 0.28

  // Glow
  ctx.shadowColor = '#00cfff'
  ctx.shadowBlur = 16

  // Body diamond
  ctx.fillStyle = '#00cfff'
  ctx.beginPath()
  ctx.moveTo(px, py - pr)
  ctx.lineTo(px + pr * 0.7, py)
  ctx.lineTo(px, py + pr * 0.7)
  ctx.lineTo(px - pr * 0.7, py)
  ctx.closePath()
  ctx.fill()

  // Inner
  ctx.fillStyle = '#0a0e17'
  ctx.beginPath()
  ctx.arc(px, py - pr * 0.15, pr * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // Key indicator on player
  if (props.hasKey) {
    ctx.shadowColor = '#ffef00'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ffef00'
    ctx.beginPath()
    ctx.arc(px + pr * 0.6, py - pr * 0.6, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.shadowBlur = 0
}

watch(() => [props.playerPos, props.keyPos, props.hasKey, props.maze], draw, { deep: true })
onMounted(draw)
</script>

<template>
  <canvas ref="canvasRef" class="maze-canvas" />
</template>

<style scoped>
.maze-canvas {
  display: block;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 207, 255, 0.15);
  box-shadow: 0 0 24px rgba(0, 207, 255, 0.08);
}
</style>

