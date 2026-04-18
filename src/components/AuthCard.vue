<script setup lang="ts">
defineProps<{ title?: string; subtitle?: string }>()
</script>

<template>
  <div class="flex justify-center">
    <div class="cyber-tile-wrapper w-full max-w-md">
      <UCard class="cyber-tile">
        <template v-if="title || subtitle" #header>
          <div>
            <h2 v-if="title" class="text-xl font-semibold text-(--ui-text-highlighted)">{{ title }}</h2>
            <p v-if="subtitle" class="mt-1 text-sm text-(--ui-text-muted)">{{ subtitle }}</p>
          </div>
        </template>
        <slot />
        <template v-if="$slots.footer" #footer>
          <slot name="footer" />
        </template>
      </UCard>
    </div>
  </div>
</template>

<style>
@property --cyber-angle-auth {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
</style>

<style scoped>
.cyber-tile-wrapper {
  --cyber-angle-auth: 0deg;
  position: relative;
  border-radius: calc(var(--ui-radius) * 2);
  padding: 2px;
  background: conic-gradient(
    from var(--cyber-angle-auth),
    #ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080
  );
  animation: cyber-spin-auth 4s linear infinite;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(255, 0, 128, 0.15),
    0 0 40px rgba(0, 207, 255, 0.1);
}
.cyber-tile {
  border-radius: calc(var(--ui-radius) * 2 - 1px) !important;
  background: var(--ui-bg-elevated);
}
@keyframes cyber-spin-auth {
  0% { --cyber-angle-auth: 0deg; }
  100% { --cyber-angle-auth: 360deg; }
}
</style>

