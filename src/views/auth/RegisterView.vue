<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { toRef } from 'vue'
import AuthCard from '@/components/AuthCard.vue'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter.vue'
import axios from 'axios'

const { t } = useI18n()
const auth = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  cgu: false,
})

const submitted = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const passwordRef = toRef(form, 'password')
const { strength } = usePasswordStrength(passwordRef)

const passwordsMatch = computed(
  () => form.password.length > 0 && form.password === form.confirmPassword,
)

const canSubmit = computed(
  () =>
    form.username.trim().length >= 3 &&
    /.+@.+\..+/.test(form.email) &&
    strength.value.valid &&
    passwordsMatch.value &&
    form.cgu &&
    !auth.loading,
)

async function onSubmit() {
  if (!canSubmit.value) return
  errorMessage.value = null
  try {
    await auth.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    submitted.value = true
    successMessage.value = t('auth.register.success')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const msg = (err.response?.data as { message?: string } | undefined)?.message
      if (status === 409) errorMessage.value = msg ?? t('auth.register.conflict')
      else errorMessage.value = msg ?? t('auth.errors.generic')
    } else {
      errorMessage.value = t('auth.errors.generic')
    }
  }
}
</script>

<template>
  <div class="py-8">
    <AuthCard :title="$t('auth.register.title')" :subtitle="$t('auth.register.subtitle')">
      <UAlert
        v-if="submitted && successMessage"
        color="success"
        variant="soft"
        :title="$t('auth.register.emailSent')"
        :description="successMessage"
        icon="i-lucide-mail-check"
        class="mb-4"
      />
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :description="errorMessage"
        icon="i-lucide-alert-triangle"
        class="mb-4"
      />

      <form v-if="!submitted" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="$t('auth.fields.username')" required>
          <UInput
            v-model="form.username"
            icon="i-lucide-user"
            autocomplete="username"
            :placeholder="$t('auth.fields.usernamePlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('auth.fields.email')" required>
          <UInput
            v-model="form.email"
            type="email"
            icon="i-lucide-mail"
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('auth.fields.password')" required>
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

        <UCheckbox v-model="form.cgu">
          <template #label>
            <span class="text-sm">
              {{ $t('auth.register.cguBefore') }}
              <RouterLink to="/cgu" class="text-(--ui-primary) underline">
                {{ $t('auth.register.cguLink') }}
              </RouterLink>
            </span>
          </template>
        </UCheckbox>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="auth.loading"
          :disabled="!canSubmit"
          :label="$t('auth.actions.register')"
        />

        <p class="text-center text-sm text-(--ui-text-muted)">
          {{ $t('auth.register.haveAccount') }}
          <RouterLink to="/login" class="text-(--ui-primary) underline">
            {{ $t('auth.actions.login') }}
          </RouterLink>
        </p>
      </form>

      <div v-else class="text-center">
        <UButton to="/login" color="primary" variant="soft" :label="$t('auth.actions.backToLogin')" />
      </div>
    </AuthCard>
  </div>
</template>

