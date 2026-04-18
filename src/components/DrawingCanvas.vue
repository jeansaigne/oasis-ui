<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { DrawingState, Tool, FreeImage } from '@/composables/useDrawing'

const props = defineProps<{
  state: DrawingState
  saveSnapshot: () => void
  floodFill: (canvas: HTMLCanvasElement, x: number, y: number, color: string) => void
}>()

const emit = defineEmits<{
  eyedrop: [color: string]
  'update:zoom': [zoom: number]
  'update:panX': [panX: number]
  'update:panY': [panY: number]
  'update:freeImage': [fi: FreeImage | null]
  rasterizeFreeImage: []
}>()

const containerRef = ref<HTMLElement>()
const layerRefs = ref<Map<number, HTMLCanvasElement>>(new Map())

const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// Shape preview
const shapeStart = ref<{ x: number; y: number } | null>(null)
const previewCanvas = ref<HTMLCanvasElement>()

// Free image drag
const isDragging = ref(false)
const isResizing = ref(false)
const resizeCorner = ref('')
const dragOffset = ref({ x: 0, y: 0 })

function registerLayer(id: number, el: HTMLCanvasElement | null) {
  if (el) {
    layerRefs.value.set(id, el)
    const layer = props.state.layers.find(l => l.id === id)
    if (layer) layer.canvas = el
  }
}

function getActiveCanvas(): HTMLCanvasElement | null {
  const layer = props.state.layers.find(l => l.id === props.state.activeLayerId)
  if (!layer || layer.locked || !layer.canvas) return null
  return layer.canvas
}

function canvasCoords(e: MouseEvent | Touch): { x: number; y: number } {
  const container = containerRef.value
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  const cx = (e.clientX - rect.left - rect.width / 2) / props.state.zoom - props.state.panX + props.state.canvasWidth / 2
  const cy = (e.clientY - rect.top - rect.height / 2) / props.state.zoom - props.state.panY + props.state.canvasHeight / 2
  return { x: Math.round(cx), y: Math.round(cy) }
}

function getCtxSettings(ctx: CanvasRenderingContext2D, tool: Tool) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.lineWidth = props.state.brushSize
  } else if (tool === 'pencil') {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = props.state.color
    ctx.globalAlpha = props.state.opacity
    ctx.lineWidth = 1
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = props.state.color
    ctx.globalAlpha = props.state.opacity
    ctx.lineWidth = props.state.brushSize
  }
}

function startDraw(e: MouseEvent | Touch) {
  const canvas = getActiveCanvas()
  if (!canvas) return

  // Check free image interactions first
  if (props.state.freeImage) {
    const pos = canvasCoords(e as MouseEvent)
    const fi = props.state.freeImage
    const corner = getResizeCorner(pos, fi)
    if (corner) {
      isResizing.value = true
      resizeCorner.value = corner
      dragOffset.value = { x: pos.x, y: pos.y }
      return
    }
    if (pos.x >= fi.x && pos.x <= fi.x + fi.w && pos.y >= fi.y && pos.y <= fi.y + fi.h) {
      isDragging.value = true
      dragOffset.value = { x: pos.x - fi.x, y: pos.y - fi.y }
      return
    }
  }

  const tool = props.state.tool
  const pos = canvasCoords(e as MouseEvent)

  if (tool === 'eyedropper') {
    pickColor(pos.x, pos.y)
    return
  }

  if (tool === 'fill') {
    props.saveSnapshot()
    props.floodFill(canvas, pos.x, pos.y, props.state.color)
    return
  }

  if (tool === 'rect' || tool === 'circle' || tool === 'line') {
    shapeStart.value = pos
    isDrawing.value = true
    return
  }

  props.saveSnapshot()
  isDrawing.value = true
  lastX.value = pos.x
  lastY.value = pos.y

  const ctx = canvas.getContext('2d')!
  getCtxSettings(ctx, tool)
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

function moveDraw(e: MouseEvent | Touch) {
  const pos = canvasCoords(e as MouseEvent)

  if (isDragging.value && props.state.freeImage) {
    emit('update:freeImage', {
      ...props.state.freeImage,
      x: pos.x - dragOffset.value.x,
      y: pos.y - dragOffset.value.y,
    })
    return
  }

  if (isResizing.value && props.state.freeImage) {
    const fi = props.state.freeImage
    let { x, y, w, h } = fi
    const dx = pos.x - dragOffset.value.x
    const dy = pos.y - dragOffset.value.y
    if (resizeCorner.value.includes('r')) { w = Math.max(20, w + dx) }
    if (resizeCorner.value.includes('l')) { x += dx; w = Math.max(20, w - dx) }
    if (resizeCorner.value.includes('b')) { h = Math.max(20, h + dy) }
    if (resizeCorner.value.includes('t')) { y += dy; h = Math.max(20, h - dy) }
    dragOffset.value = { x: pos.x, y: pos.y }
    emit('update:freeImage', { ...fi, x, y, w, h })
    return
  }

  if (!isDrawing.value) return
  const canvas = getActiveCanvas()
  if (!canvas) return
  const tool = props.state.tool

  if (tool === 'rect' || tool === 'circle' || tool === 'line') {
    drawShapePreview(pos)
    return
  }

  const ctx = canvas.getContext('2d')!
  getCtxSettings(ctx, tool)
  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  lastX.value = pos.x
  lastY.value = pos.y
}

function endDraw() {
  if (isDragging.value || isResizing.value) {
    isDragging.value = false
    isResizing.value = false
    return
  }

  if (!isDrawing.value) return
  const canvas = getActiveCanvas()
  const tool = props.state.tool

  if ((tool === 'rect' || tool === 'circle' || tool === 'line') && shapeStart.value && canvas) {
    props.saveSnapshot()
    const ctx = canvas.getContext('2d')!
    const pCtx = previewCanvas.value?.getContext('2d')
    if (pCtx && previewCanvas.value) {
      ctx.globalAlpha = props.state.opacity
      ctx.drawImage(previewCanvas.value, 0, 0)
      ctx.globalAlpha = 1
      pCtx.clearRect(0, 0, props.state.canvasWidth, props.state.canvasHeight)
    }
    shapeStart.value = null
  }

  isDrawing.value = false
}

function drawShapePreview(pos: { x: number; y: number }) {
  if (!shapeStart.value || !previewCanvas.value) return
  const ctx = previewCanvas.value.getContext('2d')!
  ctx.clearRect(0, 0, props.state.canvasWidth, props.state.canvasHeight)
  ctx.strokeStyle = props.state.color
  ctx.lineWidth = props.state.brushSize
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const sx = shapeStart.value.x
  const sy = shapeStart.value.y
  const tool = props.state.tool

  ctx.beginPath()
  if (tool === 'line') {
    ctx.moveTo(sx, sy)
    ctx.lineTo(pos.x, pos.y)
  } else if (tool === 'rect') {
    ctx.rect(sx, sy, pos.x - sx, pos.y - sy)
  } else if (tool === 'circle') {
    const rx = Math.abs(pos.x - sx) / 2
    const ry = Math.abs(pos.y - sy) / 2
    const cx = (sx + pos.x) / 2
    const cy = (sy + pos.y) / 2
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  }
  ctx.stroke()
}

function pickColor(x: number, y: number) {
  for (let i = props.state.layers.length - 1; i >= 0; i--) {
    const layer = props.state.layers[i]!
    if (!layer.visible || !layer.canvas) continue
    const ctx = layer.canvas.getContext('2d')!
    const pixel = ctx.getImageData(x, y, 1, 1).data
    if (pixel[3]! > 0) {
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(c => (c ?? 0).toString(16).padStart(2, '0')).join('')
      emit('eyedrop', hex)
      return
    }
  }
}

function getResizeCorner(pos: { x: number; y: number }, fi: FreeImage): string {
  const margin = 10
  const corners: { key: string; x: number; y: number }[] = [
    { key: 'tl', x: fi.x, y: fi.y },
    { key: 'tr', x: fi.x + fi.w, y: fi.y },
    { key: 'bl', x: fi.x, y: fi.y + fi.h },
    { key: 'br', x: fi.x + fi.w, y: fi.y + fi.h },
  ]
  for (const c of corners) {
    if (Math.abs(pos.x - c.x) < margin && Math.abs(pos.y - c.y) < margin) return c.key
  }
  return ''
}

// Zoom
function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) {
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(10, Math.max(0.1, props.state.zoom * delta))
    emit('update:zoom', newZoom)
  } else {
    emit('update:panX', props.state.panX - e.deltaX / props.state.zoom)
    emit('update:panY', props.state.panY - e.deltaY / props.state.zoom)
  }
}

// Touch support
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    e.preventDefault()
    startDraw(e.touches[0]!)
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1) {
    e.preventDefault()
    moveDraw(e.touches[0]!)
  }
}

function onTouchEnd(e: TouchEvent) {
  e.preventDefault()
  endDraw()
}

// Middle mouse pan
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

function onMouseDown(e: MouseEvent) {
  if (e.button === 1) {
    e.preventDefault()
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    return
  }
  if (e.button === 0) startDraw(e)
}

function onMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    const dx = (e.clientX - panStart.value.x) / props.state.zoom
    const dy = (e.clientY - panStart.value.y) / props.state.zoom
    emit('update:panX', props.state.panX + dx)
    emit('update:panY', props.state.panY + dy)
    panStart.value = { x: e.clientX, y: e.clientY }
    return
  }
  moveDraw(e)
}

function onMouseUp() {
  if (isPanning.value) {
    isPanning.value = false
    return
  }
  endDraw()
}

// Space bar pan
const spaceDown = ref(false)

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !spaceDown.value) {
    spaceDown.value = true
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    // handled by parent
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') spaceDown.value = false
}

// Drag & drop image
function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file && file.type.match(/^image\/(png|jpe?g|webp)$/)) {
    handleDroppedFile(file, e)
  }
}

function handleDroppedFile(file: File, e?: DragEvent) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const pos = e ? canvasCoords(e as unknown as MouseEvent) : { x: props.state.canvasWidth / 4, y: props.state.canvasHeight / 4 }
      emit('update:freeImage', {
        layerId: props.state.activeLayerId,
        img,
        x: pos.x - img.width / 4,
        y: pos.y - img.height / 4,
        w: img.width / 2,
        h: img.height / 2,
      })
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

defineExpose({ handleDroppedFile })
</script>

<template>
  <div
    ref="containerRef"
    class="drawing-container"
    @wheel.passive="false"
    @wheel="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @dragover.prevent
    @drop="onDrop"
  >
    <!-- Checkerboard background -->
    <div
      class="canvas-wrapper"
      :style="{
        width: state.canvasWidth + 'px',
        height: state.canvasHeight + 'px',
        transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`,
      }"
    >
      <!-- Layer canvases -->
      <canvas
        v-for="layer in state.layers"
        :key="layer.id"
        :ref="(el: any) => registerLayer(layer.id, el as HTMLCanvasElement)"
        :width="state.canvasWidth"
        :height="state.canvasHeight"
        class="layer-canvas"
        :style="{
          opacity: layer.visible ? layer.opacity : 0,
          zIndex: state.layers.indexOf(layer),
        }"
      />

      <!-- Shape preview canvas -->
      <canvas
        ref="previewCanvas"
        :width="state.canvasWidth"
        :height="state.canvasHeight"
        class="layer-canvas"
        :style="{ zIndex: 999 }"
      />

      <!-- Free image overlay -->
      <div
        v-if="state.freeImage"
        class="free-image-overlay"
        :style="{
          left: state.freeImage.x + 'px',
          top: state.freeImage.y + 'px',
          width: state.freeImage.w + 'px',
          height: state.freeImage.h + 'px',
          zIndex: 1000,
        }"
      >
        <img
          :src="state.freeImage.img.src"
          class="w-full h-full object-fill pointer-events-none"
          alt=""
          draggable="false"
        />
        <div class="resize-handle tl" />
        <div class="resize-handle tr" />
        <div class="resize-handle bl" />
        <div class="resize-handle br" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawing-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%)
    50% / 20px 20px;
  cursor: crosshair;
}

.canvas-wrapper {
  position: relative;
  transform-origin: center center;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.layer-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.free-image-overlay {
  position: absolute;
  border: 2px dashed #00cfff;
  box-shadow: 0 0 12px rgba(0, 207, 255, 0.3);
  cursor: move;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #00cfff;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(0, 207, 255, 0.8);
}
.resize-handle.tl { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle.tr { top: -5px; right: -5px; cursor: ne-resize; }
.resize-handle.bl { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-handle.br { bottom: -5px; right: -5px; cursor: se-resize; }
</style>

