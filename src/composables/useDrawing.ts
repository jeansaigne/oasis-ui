import { reactive, ref, computed } from 'vue'

export type Tool = 'brush' | 'pencil' | 'eraser' | 'fill' | 'rect' | 'circle' | 'line' | 'eyedropper'

export interface Layer {
  id: number
  name: string
  visible: boolean
  opacity: number
  locked: boolean
  canvas: HTMLCanvasElement | null
}

export interface FreeImage {
  layerId: number
  img: HTMLImageElement
  x: number
  y: number
  w: number
  h: number
}

export interface DrawingState {
  tool: Tool
  color: string
  opacity: number
  brushSize: number
  layers: Layer[]
  activeLayerId: number
  canvasWidth: number
  canvasHeight: number
  zoom: number
  panX: number
  panY: number
  colorHistory: string[]
  freeImage: FreeImage | null
}

let nextLayerId = 1

export function createLayer(name: string): Layer {
  return {
    id: nextLayerId++,
    name,
    visible: true,
    opacity: 1,
    locked: false,
    canvas: null,
  }
}

const MAX_HISTORY = 30

export function useDrawing() {
  const state = reactive<DrawingState>({
    tool: 'brush',
    color: '#00cfff',
    opacity: 1,
    brushSize: 8,
    layers: [],
    activeLayerId: 0,
    canvasWidth: 800,
    canvasHeight: 600,
    zoom: 1,
    panX: 0,
    panY: 0,
    colorHistory: ['#00cfff', '#ff0080', '#ffef00', '#00ff88', '#8000ff', '#ff8c00', '#ffffff', '#000000'],
    freeImage: null,
  })

  const undoStack = ref<ImageData[][]>([])
  const redoStack = ref<ImageData[][]>([])

  const activeLayer = computed(() => state.layers.find(l => l.id === state.activeLayerId) ?? null)

  function initLayers() {
    const layer = createLayer('Layer 1')
    state.layers = [layer]
    state.activeLayerId = layer.id
    undoStack.value = []
    redoStack.value = []
  }

  function saveSnapshot() {
    const snap: ImageData[] = []
    for (const layer of state.layers) {
      if (layer.canvas) {
        const ctx = layer.canvas.getContext('2d')!
        snap.push(ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight))
      }
    }
    undoStack.value.push(snap)
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
    redoStack.value = []
  }

  function restoreSnapshot(snap: ImageData[]) {
    for (let i = 0; i < state.layers.length && i < snap.length; i++) {
      const layer = state.layers[i]!
      if (layer.canvas) {
        const ctx = layer.canvas.getContext('2d')!
        ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight)
        ctx.putImageData(snap[i]!, 0, 0)
      }
    }
  }

  function currentSnapshot(): ImageData[] {
    const snap: ImageData[] = []
    for (const layer of state.layers) {
      if (layer.canvas) {
        const ctx = layer.canvas.getContext('2d')!
        snap.push(ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight))
      }
    }
    return snap
  }

  function undo() {
    if (undoStack.value.length === 0) return
    redoStack.value.push(currentSnapshot())
    const snap = undoStack.value.pop()!
    restoreSnapshot(snap)
  }

  function redo() {
    if (redoStack.value.length === 0) return
    undoStack.value.push(currentSnapshot())
    const snap = redoStack.value.pop()!
    restoreSnapshot(snap)
  }

  function addLayer(name?: string) {
    const layer = createLayer(name ?? `Layer ${state.layers.length + 1}`)
    state.layers.push(layer)
    state.activeLayerId = layer.id
  }

  function removeLayer(id: number) {
    if (state.layers.length <= 1) return
    const idx = state.layers.findIndex(l => l.id === id)
    if (idx === -1) return
    state.layers.splice(idx, 1)
    if (state.activeLayerId === id) {
      state.activeLayerId = state.layers[Math.min(idx, state.layers.length - 1)]!.id
    }
  }

  function moveLayer(id: number, direction: 'up' | 'down') {
    const idx = state.layers.findIndex(l => l.id === id)
    if (idx === -1) return
    const target = direction === 'up' ? idx + 1 : idx - 1
    if (target < 0 || target >= state.layers.length) return
    const tmp = state.layers[idx]!
    state.layers[idx] = state.layers[target]!
    state.layers[target] = tmp
  }

  function mergeLayers(topId: number, bottomId: number) {
    const top = state.layers.find(l => l.id === topId)
    const bottom = state.layers.find(l => l.id === bottomId)
    if (!top?.canvas || !bottom?.canvas) return
    saveSnapshot()
    const ctx = bottom.canvas.getContext('2d')!
    ctx.globalAlpha = top.opacity
    ctx.drawImage(top.canvas, 0, 0)
    ctx.globalAlpha = 1
    removeLayer(topId)
  }

  function addColorToHistory(color: string) {
    const hist = state.colorHistory.filter(c => c !== color)
    hist.unshift(color)
    if (hist.length > 16) hist.pop()
    state.colorHistory = hist
  }

  function exportCanvas(transparentBg: boolean): string {
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = state.canvasWidth
    exportCanvas.height = state.canvasHeight
    const ctx = exportCanvas.getContext('2d')!
    if (!transparentBg) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight)
    }
    for (const layer of state.layers) {
      if (!layer.visible || !layer.canvas) continue
      ctx.globalAlpha = layer.opacity
      ctx.drawImage(layer.canvas, 0, 0)
    }
    ctx.globalAlpha = 1
    return exportCanvas.toDataURL('image/png')
  }

  function floodFill(canvas: HTMLCanvasElement, startX: number, startY: number, fillColor: string) {
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const w = canvas.width
    const h = canvas.height

    const hex = fillColor.replace('#', '')
    const fr = parseInt(hex.substring(0, 2), 16)
    const fg = parseInt(hex.substring(2, 4), 16)
    const fb = parseInt(hex.substring(4, 6), 16)
    const fa = Math.round(state.opacity * 255)

    const idx = (startY * w + startX) * 4
    const sr = data[idx]!
    const sg = data[idx + 1]!
    const sb = data[idx + 2]!
    const sa = data[idx + 3]!

    if (sr === fr && sg === fg && sb === fb && sa === fa) return

    const stack: [number, number][] = [[startX, startY]]
    const visited = new Set<number>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const i = (y * w + x) * 4
      if (visited.has(i)) continue
      if (x < 0 || x >= w || y < 0 || y >= h) continue
      if (data[i] !== sr || data[i + 1] !== sg || data[i + 2] !== sb || data[i + 3] !== sa) continue
      visited.add(i)
      data[i] = fr
      data[i + 1] = fg
      data[i + 2] = fb
      data[i + 3] = fa
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  return {
    state,
    activeLayer,
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
  }
}

