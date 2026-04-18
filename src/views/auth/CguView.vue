<script setup lang="ts"></script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-(--ui-text-highlighted)">
        {{ $t('auth.cgu.title') }}
      </h2>
      <p class="mt-1 text-(--ui-text-muted)">{{ $t('auth.cgu.subtitle') }}</p>
    </div>

    <UCard>
      <div class="prose prose-invert max-w-none text-sm text-(--ui-text-muted) space-y-3">
        <p>{{ $t('auth.cgu.body') }}</p>
        <p>{{ $t('auth.cgu.placeholder') }}</p>
      </div>
    </UCard>

    <div class="mt-4">
      <UButton to="/register" color="primary" variant="soft" :label="$t('auth.cgu.back')" />
    </div>
  </div>
</template>

