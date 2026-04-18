<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authService } from '@/services/auth'
import AuthCard from '@/components/AuthCard.vue'

const { t: _t } = useI18n()

const email = ref('')
const submitting = ref(false)
const submitted = ref(false)

const canSubmit = computed(() => /.+@.+\..+/.test(email.value) && !submitting.value)

async function onSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await authService.forgotPassword(email.value.trim())
  } catch {
    /* neutral response — never leak */
  } finally {
    submitting.value = false
    submitted.value = true
  }
}
</script>

<template>
  <div class="py-8">
    <AuthCard
      :title="$t('auth.forgot.title')"
      :subtitle="$t('auth.forgot.subtitle')"
    >
      <UAlert
        v-if="submitted"
        color="info"
        variant="soft"
        :title="$t('auth.forgot.neutralTitle')"
        :description="$t('auth.forgot.neutralDescription')"
        icon="i-lucide-mail"
        class="mb-4"
      />

      <form v-if="!submitted" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="$t('auth.fields.email')" required>
          <UInput
            v-model="email"
            type="email"
            icon="i-lucide-mail"
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="submitting"
          :disabled="!canSubmit"
          :label="$t('auth.forgot.submit')"
        />
      </form>

      <div class="mt-4 text-center">
        <RouterLink to="/login" class="text-sm text-(--ui-primary) underline">
          {{ $t('auth.actions.backToLogin') }}
        </RouterLink>
      </div>
    </AuthCard>
  </div>
</template>

