<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Layer } from '@/composables/useDrawing'

const { t } = useI18n()

defineProps<{
  layers: Layer[]
  activeLayerId: number
}>()

const emit = defineEmits<{
  select: [id: number]
  add: []
  remove: [id: number]
  moveUp: [id: number]
  moveDown: [id: number]
  toggleVisibility: [id: number]
  rename: [id: number, name: string]
  opacityChange: [id: number, opacity: number]
  merge: [id: number]
}>()

function startRename(layer: Layer) {
  const name = prompt(t('drawing.layers.renamePrompt'), layer.name)
  if (name && name.trim()) {
    emit('rename', layer.id, name.trim())
  }
}
</script>

<template>
  <div class="flex flex-col h-full p-4 gap-3">
    <div class="flex items-center justify-between">
      <label class="text-[10px] uppercase tracking-wider text-white/40">{{ t('drawing.layers.label') }}</label>
      <button
        class="text-white/50 hover:text-[#00cfff] transition-colors"
        :title="t('drawing.layers.add')"
        @click="emit('add')"
      >
        <UIcon name="i-lucide-plus" class="text-sm" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto flex flex-col-reverse gap-1.5">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="cyber-layer-item"
        :class="{ active: layer.id === activeLayerId, locked: layer.locked }"
        @click="emit('select', layer.id)"
      >
        <button
          class="shrink-0 text-white/40 hover:text-white/80 transition-colors"
          :title="layer.visible ? t('drawing.layers.hide') : t('drawing.layers.show')"
          @click.stop="emit('toggleVisibility', layer.id)"
        >
          <UIcon :name="layer.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="text-sm" />
        </button>

        <span
          class="flex-1 text-xs truncate cursor-text"
          @dblclick.stop="startRename(layer)"
        >
          {{ layer.name }}
          <span v-if="layer.locked" class="text-white/30 ml-1">🔒</span>
        </span>

        <div class="flex items-center gap-0.5 shrink-0 layer-actions">
          <button
            class="layer-action"
            :title="t('drawing.layers.moveUp')"
            @click.stop="emit('moveUp', layer.id)"
          >
            <UIcon name="i-lucide-chevron-up" class="text-xs" />
          </button>
          <button
            class="layer-action"
            :title="t('drawing.layers.moveDown')"
            @click.stop="emit('moveDown', layer.id)"
          >
            <UIcon name="i-lucide-chevron-down" class="text-xs" />
          </button>
          <button
            class="layer-action"
            :title="t('drawing.layers.merge')"
            @click.stop="emit('merge', layer.id)"
          >
            <UIcon name="i-lucide-merge" class="text-xs" />
          </button>
          <button
            class="layer-action text-red-400/60 hover:text-red-400"
            :title="t('drawing.layers.remove')"
            @click.stop="emit('remove', layer.id)"
          >
            <UIcon name="i-lucide-trash-2" class="text-xs" />
          </button>
        </div>
      </div>
    </div>

    <!-- Per-layer opacity (active layer) -->
    <div v-if="layers.find(l => l.id === activeLayerId)" class="pt-3 mt-1 border-t border-white/5">
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">
        {{ t('drawing.layers.opacity') }} · {{ Math.round((layers.find(l => l.id === activeLayerId)?.opacity ?? 1) * 100) }}%
      </label>
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round((layers.find(l => l.id === activeLayerId)?.opacity ?? 1) * 100)"
        class="w-full cyber-range"
        @input="emit('opacityChange', activeLayerId, Number(($event.target as HTMLInputElement).value) / 100)"
      />
    </div>
  </div>
</template>

<style scoped>
.cyber-layer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cyber-layer-item .layer-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.cyber-layer-item:hover .layer-actions {
  opacity: 1;
}
.cyber-layer-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.cyber-layer-item.active {
  background: rgba(0, 207, 255, 0.08);
  border-color: rgba(0, 207, 255, 0.3);
}
.cyber-layer-item.locked {
  opacity: 0.6;
}
.layer-action {
  color: rgba(255, 255, 255, 0.4);
  padding: 3px;
  border-radius: 4px;
  transition: all 0.1s;
}
.layer-action:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
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

