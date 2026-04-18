<script setup lang="ts">
import type { Ref } from 'vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const props = defineProps<{ password: string }>()

// wrap prop in a computed ref for the composable
import { toRef } from 'vue'
const pwd = toRef(props, 'password') as Ref<string>
const { strength } = usePasswordStrength(pwd)
</script>

<template>
  <div v-if="password.length > 0" class="mt-2 space-y-2">
    <UProgress :model-value="strength.percent" :color="strength.color" size="sm" />
    <div class="flex items-center justify-between text-xs">
      <span class="text-(--ui-text-muted)">{{ $t('auth.password.strengthLabel') }}</span>
      <span :class="`text-(--ui-${strength.color})`">{{ strength.label }}</span>
    </div>
    <ul class="space-y-1 text-xs">
      <li
        v-for="rule in strength.rules"
        :key="rule.key"
        class="flex items-center gap-1.5"
        :class="rule.passed ? 'text-(--ui-success)' : 'text-(--ui-text-muted)'"
      >
        <UIcon :name="rule.passed ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" class="text-sm" />
        {{ rule.label }}
      </li>
    </ul>
  </div>
</template>

