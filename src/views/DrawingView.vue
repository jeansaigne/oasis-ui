<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDrawing } from '@/composables/useDrawing'
import DrawingToolbar from '@/components/DrawingToolbar.vue'
import DrawingCanvas from '@/components/DrawingCanvas.vue'
import DrawingLayerPanel from '@/components/DrawingLayerPanel.vue'

const { t } = useI18n()
const {
  state,
  undoStack,
  redoStack,
  initLayers,
  saveSnapshot,
  undo,
  redo,
  addLayer,
  removeLayer,
  moveLayer,
  mergeLayers,
  addColorToHistory,
  exportCanvas,
  floodFill,
} = useDrawing()

const canvasRef = ref<InstanceType<typeof DrawingCanvas>>()
const showSizeDialog = ref(true)

const presets = [
  { label: '800 × 600', w: 800, h: 600 },
  { label: '1280 × 720', w: 1280, h: 720 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
  { label: '1080 × 1080', w: 1080, h: 1080 },
  { label: '500 × 500', w: 500, h: 500 },
]

function startCanvas(w: number, h: number) {
  state.canvasWidth = w
  state.canvasHeight = h
  showSizeDialog.value = false
  nextTick(() => initLayers())
}

function onExport(transparent: boolean) {
  const url = exportCanvas(transparent)
  const a = document.createElement('a')
  a.href = url
  a.download = `oasis-drawing-${Date.now()}.png`
  a.click()
}

function onImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/png,image/jpeg,image/webp'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    showImportChoice(file)
  }
  input.click()
}

function showImportChoice(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const choice = confirm(t('drawing.importAsBgConfirm'))
      if (choice) {
        // Background mode: add locked layer at bottom
        importAsBackground(img)
      } else {
        // Free element mode
        importAsFreeElement(img)
      }
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

function importAsBackground(img: HTMLImageElement) {
  saveSnapshot()
  addLayer(t('drawing.layers.background'))
  const bgLayer = state.layers[state.layers.length - 1]!
  bgLayer.locked = true
  // Move to bottom
  const idx = state.layers.indexOf(bgLayer)
  if (idx > 0) {
    state.layers.splice(idx, 1)
    state.layers.unshift(bgLayer)
  }
  nextTick(() => {
    if (bgLayer.canvas) {
      const ctx = bgLayer.canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, state.canvasWidth, state.canvasHeight)
    }
  })
}

function importAsFreeElement(img: HTMLImageElement) {
  const scale = Math.min(state.canvasWidth * 0.5 / img.width, state.canvasHeight * 0.5 / img.height, 1)
  state.freeImage = {
    layerId: state.activeLayerId,
    img,
    x: (state.canvasWidth - img.width * scale) / 2,
    y: (state.canvasHeight - img.height * scale) / 2,
    w: img.width * scale,
    h: img.height * scale,
  }
}

function rasterizeFreeImage() {
  if (!state.freeImage) return
  const layer = state.layers.find(l => l.id === state.freeImage!.layerId)
  if (!layer?.canvas) return
  saveSnapshot()
  const ctx = layer.canvas.getContext('2d')!
  const fi = state.freeImage
  ctx.drawImage(fi.img, fi.x, fi.y, fi.w, fi.h)
  state.freeImage = null
}

function deleteFreeImage() {
  state.freeImage = null
}

function onSetColor(c: string) {
  state.color = c
  addColorToHistory(c)
}

function onMerge(id: number) {
  const idx = state.layers.findIndex(l => l.id === id)
  if (idx <= 0) return
  const below = state.layers[idx - 1]
  if (!below) return
  mergeLayers(id, below.id)
}

// Keyboard shortcuts
function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }
  if (e.key === 'Enter' && state.freeImage) {
    rasterizeFreeImage()
  }
  if (e.key === 'Escape' && state.freeImage) {
    deleteFreeImage()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <!-- Size selection dialog -->
  <div v-if="showSizeDialog" class="flex flex-col items-center justify-center min-h-[70vh] gap-6">
    <div class="flex items-center gap-3 mb-2">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/" />
      <UIcon name="i-lucide-brush" class="text-2xl text-(--ui-primary)" />
      <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">{{ $t('drawing.title') }}</h2>
    </div>

    <p class="text-sm text-(--ui-text-muted)">{{ $t('drawing.chooseSize') }}</p>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="p in presets"
        :key="p.label"
        class="cyber-size-btn"
        @click="startCanvas(p.w, p.h)"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="flex items-center gap-2 mt-2">
      <input
        v-model.number="state.canvasWidth"
        type="number"
        min="100"
        max="4096"
        class="cyber-input w-24"
        placeholder="W"
      />
      <span class="text-white/40">×</span>
      <input
        v-model.number="state.canvasHeight"
        type="number"
        min="100"
        max="4096"
        class="cyber-input w-24"
        placeholder="H"
      />
      <button class="cyber-size-btn px-4" @click="startCanvas(state.canvasWidth, state.canvasHeight)">
        {{ $t('drawing.create') }}
      </button>
    </div>
  </div>

  <!-- Drawing workspace -->
  <div v-else class="drawing-layout">
    <!-- Toolbar left -->
    <aside class="drawing-sidebar left">
      <DrawingToolbar
        :tool="state.tool"
        :color="state.color"
        :opacity="state.opacity"
        :brush-size="state.brushSize"
        :color-history="state.colorHistory"
        :can-undo="undoStack.length > 0"
        :can-redo="redoStack.length > 0"
        @update:tool="state.tool = $event"
        @update:color="onSetColor"
        @update:opacity="state.opacity = $event"
        @update:brush-size="state.brushSize = $event"
        @undo="undo"
        @redo="redo"
        @export="onExport"
        @import="onImport"
      />
    </aside>

    <!-- Canvas center -->
    <div class="drawing-center">
      <!-- Top bar -->
      <div class="drawing-topbar">
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="xs" to="/" />
          <span class="text-xs text-white/50 font-mono">
            {{ state.canvasWidth }}×{{ state.canvasHeight }} · {{ Math.round(state.zoom * 100) }}%
          </span>
        </div>
        <div v-if="state.freeImage" class="flex items-center gap-2">
          <button class="cyber-action-btn text-green-400" @click="rasterizeFreeImage">
            <UIcon name="i-lucide-check" class="text-sm" />
            <span class="text-xs">{{ $t('drawing.rasterize') }}</span>
          </button>
          <button class="cyber-action-btn text-red-400" @click="deleteFreeImage">
            <UIcon name="i-lucide-x" class="text-sm" />
            <span class="text-xs">{{ $t('drawing.cancel') }}</span>
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button class="text-white/40 hover:text-white/80 p-1" @click="state.zoom = Math.max(0.1, state.zoom / 1.2)">
            <UIcon name="i-lucide-zoom-out" class="text-sm" />
          </button>
          <button class="text-white/40 hover:text-white/80 p-1" @click="state.zoom = 1; state.panX = 0; state.panY = 0">
            <UIcon name="i-lucide-maximize-2" class="text-xs" />
          </button>
          <button class="text-white/40 hover:text-white/80 p-1" @click="state.zoom = Math.min(10, state.zoom * 1.2)">
            <UIcon name="i-lucide-zoom-in" class="text-sm" />
          </button>
        </div>
      </div>

      <DrawingCanvas
        ref="canvasRef"
        :state="state"
        :save-snapshot="saveSnapshot"
        :flood-fill="floodFill"
        @eyedrop="onSetColor"
        @update:zoom="state.zoom = $event"
        @update:pan-x="state.panX = $event"
        @update:pan-y="state.panY = $event"
        @update:free-image="state.freeImage = $event"
        @rasterize-free-image="rasterizeFreeImage"
      />
    </div>

    <!-- Layers right -->
    <aside class="drawing-sidebar right">
      <DrawingLayerPanel
        :layers="state.layers"
        :active-layer-id="state.activeLayerId"
        @select="state.activeLayerId = $event"
        @add="addLayer()"
        @remove="removeLayer"
        @move-up="moveLayer($event, 'up')"
        @move-down="moveLayer($event, 'down')"
        @toggle-visibility="(id) => { const l = state.layers.find(x => x.id === id); if (l) l.visible = !l.visible }"
        @rename="(id, name) => { const l = state.layers.find(x => x.id === id); if (l) l.name = name }"
        @opacity-change="(id, o) => { const l = state.layers.find(x => x.id === id); if (l) l.opacity = o }"
        @merge="onMerge"
      />
    </aside>
  </div>
</template>

<style scoped>
.drawing-layout {
  display: flex;
  height: calc(100vh - 80px);
  margin: -2.5rem -1.5rem;
  overflow: hidden;
}

.drawing-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
}
.drawing-sidebar.left {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
.drawing-sidebar.right {
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}

.drawing-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawing-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.cyber-size-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  background: rgba(0, 207, 255, 0.08);
  border: 1px solid rgba(0, 207, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cyber-size-btn:hover {
  background: rgba(0, 207, 255, 0.15);
  border-color: rgba(0, 207, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 207, 255, 0.2);
}

.cyber-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: white;
  font-family: monospace;
  font-size: 0.875rem;
  text-align: center;
}
.cyber-input:focus {
  outline: none;
  border-color: rgba(0, 207, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 207, 255, 0.2);
}

.cyber-action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.15s;
}
.cyber-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

