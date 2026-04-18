<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  opacity: number
  colorHistory: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:opacity': [value: number]
}>()

const hexInput = ref(props.modelValue)

watch(() => props.modelValue, v => { hexInput.value = v })

function onHexInput(val: string) {
  const clean = val.replace(/[^0-9a-fA-F#]/g, '')
  hexInput.value = clean
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
    emit('update:modelValue', clean)
  }
}

function onNativeChange(e: Event) {
  const v = (e.target as HTMLInputElement).value
  hexInput.value = v
  emit('update:modelValue', v)
}

const opacityPercent = computed({
  get: () => Math.round(props.opacity * 100),
  set: (v: number) => emit('update:opacity', v / 100),
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <div class="relative">
        <div
          class="w-10 h-10 rounded-lg border border-white/10 cyber-color-preview"
          :style="{ backgroundColor: modelValue, opacity: props.opacity }"
        />
        <input
          type="color"
          :value="modelValue"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          @input="onNativeChange"
        />
      </div>
      <input
        :value="hexInput"
        class="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs font-mono text-white/80 focus:outline-none focus:border-[#00cfff]/50"
        maxlength="7"
        @input="onHexInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div>
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">{{ t('drawing.opacity') }}</label>
      <div class="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          :value="opacityPercent"
          class="flex-1 cyber-range"
          @input="opacityPercent = Number(($event.target as HTMLInputElement).value)"
        />
        <span class="text-xs text-white/60 w-8 text-right font-mono">{{ opacityPercent }}%</span>
      </div>
    </div>

    <div>
      <label class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">{{ t('drawing.recentColors') }}</label>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="c in colorHistory"
          :key="c"
          class="w-5 h-5 rounded border border-white/10 hover:scale-110 transition-transform"
          :class="{ 'ring-1 ring-[#00cfff]': c === modelValue }"
          :style="{ backgroundColor: c }"
          @click="emit('update:modelValue', c)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cyber-color-preview {
  box-shadow: 0 0 8px currentColor;
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

