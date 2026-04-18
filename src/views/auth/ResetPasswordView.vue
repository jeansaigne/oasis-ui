<script setup lang="ts">
import { computed, reactive, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import AuthCard from '@/components/AuthCard.vue'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter.vue'
import axios from 'axios'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const token = computed(() => (route.query.token as string | undefined) ?? '')

const form = reactive({ password: '', confirmPassword: '' })
const submitting = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const tokenInvalid = ref(false)

const passwordRef = toRef(form, 'password')
const { strength } = usePasswordStrength(passwordRef)

const passwordsMatch = computed(
  () => form.password.length > 0 && form.password === form.confirmPassword,
)
const canSubmit = computed(
  () => !!token.value && strength.value.valid && passwordsMatch.value && !submitting.value,
)

async function onSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  errorMessage.value = null
  try {
    await authService.resetPassword(token.value, form.password)
    successMessage.value = t('auth.reset.success')
    setTimeout(() => router.push({ name: 'login' }), 3000)
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      tokenInvalid.value = true
      errorMessage.value = t('auth.reset.tokenInvalid')
    } else {
      errorMessage.value = t('auth.errors.generic')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="py-8">
    <AuthCard :title="$t('auth.reset.title')" :subtitle="$t('auth.reset.subtitle')">
      <UAlert
        v-if="!token"
        color="error"
        variant="soft"
        :title="$t('auth.reset.missingTokenTitle')"
        :description="$t('auth.reset.missingTokenDescription')"
        icon="i-lucide-alert-triangle"
        class="mb-4"
      />

      <UAlert
        v-if="successMessage"
        color="success"
        variant="soft"
        :description="successMessage"
        icon="i-lucide-check-circle-2"
        class="mb-4"
      />

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :description="errorMessage"
        icon="i-lucide-x-circle"
        class="mb-4"
      />

      <form
        v-if="token && !successMessage && !tokenInvalid"
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <UFormField :label="$t('auth.reset.newPassword')" required>
          <UInput
            v-model="form.password"
            type="password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            class="w-full"
          />
          <PasswordStrengthMeter :password="form.password" />
        </UFormField>

        <UFormField
          :label="$t('auth.fields.confirmPassword')"
          required
          :error="
            form.confirmPassword.length > 0 && !passwordsMatch
              ? $t('auth.errors.mismatch')
              : undefined
          "
        >
          <UInput
            v-model="form.confirmPassword"
            type="password"
            icon="i-lucide-lock"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="submitting"
          :disabled="!canSubmit"
          :label="$t('auth.reset.submit')"
        />
      </form>

      <div v-if="tokenInvalid || !token" class="mt-4 text-center">
        <UButton
          to="/forgot-password"
          color="primary"
          variant="soft"
          :label="$t('auth.reset.requestNew')"
        />
      </div>
    </AuthCard>
  </div>
</template>

