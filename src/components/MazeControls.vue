<script setup lang="ts">
const emit = defineEmits<{ move: [dir: 'up' | 'down' | 'left' | 'right'] }>()

function onTouch(dir: 'up' | 'down' | 'left' | 'right', e: Event) {
  e.preventDefault()
  emit('move', dir)
}
</script>

<template>
  <div class="dpad-container">
    <div class="dpad">
      <button class="dpad-btn up" @touchstart="onTouch('up', $event)" @mousedown="emit('move', 'up')">
        <UIcon name="i-lucide-chevron-up" class="text-lg" />
      </button>
      <button class="dpad-btn left" @touchstart="onTouch('left', $event)" @mousedown="emit('move', 'left')">
        <UIcon name="i-lucide-chevron-left" class="text-lg" />
      </button>
      <div class="dpad-center" />
      <button class="dpad-btn right" @touchstart="onTouch('right', $event)" @mousedown="emit('move', 'right')">
        <UIcon name="i-lucide-chevron-right" class="text-lg" />
      </button>
      <button class="dpad-btn down" @touchstart="onTouch('down', $event)" @mousedown="emit('move', 'down')">
        <UIcon name="i-lucide-chevron-down" class="text-lg" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dpad-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.dpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  width: 140px;
  height: 140px;
}

.dpad-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(0, 207, 255, 0.08);
  border: 1px solid rgba(0, 207, 255, 0.2);
  color: rgba(0, 207, 255, 0.7);
  cursor: pointer;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.dpad-btn:active {
  background: rgba(0, 207, 255, 0.25);
  color: #00cfff;
  box-shadow: 0 0 10px rgba(0, 207, 255, 0.4);
}

.dpad-btn.up { grid-column: 2; grid-row: 1; }
.dpad-btn.left { grid-column: 1; grid-row: 2; }
.dpad-btn.right { grid-column: 3; grid-row: 2; }
.dpad-btn.down { grid-column: 2; grid-row: 3; }

.dpad-center {
  grid-column: 2;
  grid-row: 2;
  border-radius: 0.5rem;
  background: rgba(0, 207, 255, 0.03);
  border: 1px solid rgba(0, 207, 255, 0.06);
}
</style>

