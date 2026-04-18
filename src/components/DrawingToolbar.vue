<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DrawingColorPicker from './DrawingColorPicker.vue'
import type { Tool } from '@/composables/useDrawing'

const { t } = useI18n()

const props = defineProps<{
  tool: Tool
  color: string
  opacity: number
  brushSize: number
  colorHistory: string[]
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  'update:tool': [value: Tool]
  'update:color': [value: string]
  'update:opacity': [value: number]
  'update:brushSize': [value: number]
  undo: []
  redo: []
  export: [transparent: boolean]
  import: []
}>()

const tools: { id: Tool; icon: string; labelKey: string }[] = [
  { id: 'brush', icon: 'i-lucide-paintbrush', labelKey: 'drawing.tools.brush' },
  { id: 'pencil', icon: 'i-lucide-pencil', labelKey: 'drawing.tools.pencil' },
  { id: 'eraser', icon: 'i-lucide-eraser', labelKey: 'drawing.tools.eraser' },
  { id: 'fill', icon: 'i-lucide-paint-bucket', labelKey: 'drawing.tools.fill' },
  { id: 'line', icon: 'i-lucide-minus', labelKey: 'drawing.tools.line' },
  { id: 'rect', icon: 'i-lucide-square', labelKey: 'drawing.tools.rect' },
  { id: 'circle', icon: 'i-lucide-circle', labelKey: 'drawing.tools.circle' },
  { id: 'eyedropper', icon: 'i-lucide-pipette', labelKey: 'drawing.tools.eyedropper' },
]
</script>

<template>
  <div class="flex flex-col gap-4 p-3 h-full overflow-y-auto">
    <!-- Tools -->
    <div>
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-2 block">{{ t('drawing.tools.label') }}</label>
      <div class="grid grid-cols-2 gap-1">
        <button
          v-for="tl in tools"
          :key="tl.id"
          class="cyber-tool-btn"
          :class="{ active: tool === tl.id }"
          :title="t(tl.labelKey)"
          @click="emit('update:tool', tl.id)"
        >
          <UIcon :name="tl.icon" class="text-lg" />
        </button>
      </div>
    </div>

    <!-- Brush size -->
    <div>
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">{{ t('drawing.brushSize') }} · {{ brushSize }}px</label>
      <input
        type="range"
        min="1"
        max="100"
        :value="brushSize"
        class="w-full cyber-range"
        @input="emit('update:brushSize', Number(($event.target as HTMLInputElement).value))"
      />
    </div>

    <!-- Color -->
    <DrawingColorPicker
      :model-value="color"
      :opacity="opacity"
      :color-history="colorHistory"
      @update:model-value="emit('update:color', $event)"
      @update:opacity="emit('update:opacity', $event)"
    />

    <!-- Undo / Redo -->
    <div class="flex gap-1">
      <button
        class="cyber-tool-btn flex-1"
        :disabled="!canUndo"
        :title="t('drawing.undo')"
        @click="emit('undo')"
      >
        <UIcon name="i-lucide-undo-2" class="text-base" />
      </button>
      <button
        class="cyber-tool-btn flex-1"
        :disabled="!canRedo"
        :title="t('drawing.redo')"
        @click="emit('redo')"
      >
        <UIcon name="i-lucide-redo-2" class="text-base" />
      </button>
    </div>

    <!-- Import -->
    <button class="cyber-tool-btn w-full justify-center gap-2 py-2" @click="emit('import')">
      <UIcon name="i-lucide-image-plus" class="text-base" />
      <span class="text-xs">{{ t('drawing.importImage') }}</span>
    </button>

    <!-- Export -->
    <div class="flex flex-col gap-1 mt-auto">
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">{{ t('drawing.export') }}</label>
      <button class="cyber-tool-btn w-full justify-center gap-2 py-2" @click="emit('export', true)">
        <UIcon name="i-lucide-download" class="text-base" />
        <span class="text-xs">PNG {{ t('drawing.transparent') }}</span>
      </button>
      <button class="cyber-tool-btn w-full justify-center gap-2 py-2" @click="emit('export', false)">
        <UIcon name="i-lucide-download" class="text-base" />
        <span class="text-xs">PNG {{ t('drawing.whiteBg') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cyber-tool-btn {
  display: flex;
  align-items: center;
  padding: 0.4rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
}
.cyber-tool-btn:hover:not(:disabled) {
  background: rgba(0, 207, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 207, 255, 0.3);
}
.cyber-tool-btn.active {
  background: rgba(0, 207, 255, 0.15);
  color: #00cfff;
  border-color: rgba(0, 207, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 207, 255, 0.3), inset 0 0 8px rgba(0, 207, 255, 0.1);
}
.cyber-tool-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cyber-range {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(90deg, rgba(0, 207, 255, 0.2), rgba(0, 207, 255, 0.6));
  border-radius: 2px;
  outline: none;
}
.cyber-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00cfff;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0, 207, 255, 0.6);
}
</style>

