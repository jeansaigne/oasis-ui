<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function toggle() {
  const next = locale.value === 'fr' ? 'en' : 'fr'
  locale.value = next
  localStorage.setItem('locale', next)
}
</script>

<template>
  <UButton
    :label="locale.toUpperCase()"
    variant="ghost"
    color="neutral"
    size="sm"
    @click="toggle"
  />
</template>

