<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthCard from '@/components/AuthCard.vue'
import axios from 'axios'

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ identifier: '', password: '' })
const errorMessage = ref<string | null>(null)

const verifiedBanner = computed(() => route.query.verified === 'true')
const verificationFailed = computed(() => route.query.verified === 'false')

const canSubmit = computed(
  () => form.identifier.trim().length > 0 && form.password.length > 0 && !auth.loading,
)

async function onSubmit() {
  if (!canSubmit.value) return
  errorMessage.value = null
  try {
    await auth.login({ identifier: form.identifier.trim(), password: form.password })
    const redirect = (route.query.redirect as string | undefined) || '/'
    router.push(redirect)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const data = err.response?.data as { message?: string; details?: string[] } | undefined
      if (status === 403 && data?.details?.includes('EMAIL_NOT_VERIFIED')) {
        errorMessage.value = t('auth.errors.emailNotVerified')
      } else if (status === 401) {
        errorMessage.value = t('auth.errors.invalidCredentials')
      } else {
        errorMessage.value = data?.message ?? t('auth.errors.generic')
      }
    } else {
      errorMessage.value = t('auth.errors.generic')
    }
  }
}
</script>

<template>
  <div class="py-8">
    <AuthCard :title="$t('auth.login.title')" :subtitle="$t('auth.login.subtitle')">
      <UAlert
        v-if="verifiedBanner"
        color="success"
        variant="soft"
        :title="$t('auth.login.verifiedTitle')"
        :description="$t('auth.login.verifiedDescription')"
        icon="i-lucide-check-circle-2"
        class="mb-4"
      />
      <UAlert
        v-if="verificationFailed"
        color="warning"
        variant="soft"
        :description="$t('auth.login.verificationFailed')"
        icon="i-lucide-alert-triangle"
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

      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="$t('auth.fields.identifier')" required>
          <UInput
            v-model="form.identifier"
            icon="i-lucide-user"
            autocomplete="username"
            :placeholder="$t('auth.fields.identifierPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('auth.fields.password')" required>
          <UInput
            v-model="form.password"
            type="password"
            icon="i-lucide-lock"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <RouterLink to="/forgot-password" class="text-sm text-(--ui-primary) underline">
            {{ $t('auth.login.forgotPassword') }}
          </RouterLink>
        </div>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="auth.loading"
          :disabled="!canSubmit"
          :label="$t('auth.actions.login')"
        />

        <p class="text-center text-sm text-(--ui-text-muted)">
          {{ $t('auth.login.noAccount') }}
          <RouterLink to="/register" class="text-(--ui-primary) underline">
            {{ $t('auth.actions.register') }}
          </RouterLink>
        </p>
      </form>
    </AuthCard>
  </div>
</template>

