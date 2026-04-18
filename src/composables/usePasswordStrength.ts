import { computed, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface PasswordRule {
  key: 'min' | 'upper' | 'digit' | 'special'
  passed: boolean
  label: string
}

export interface PasswordStrength {
  rules: PasswordRule[]
  score: number // 0..4
  percent: number // 0..100
  label: string
  color: 'error' | 'warning' | 'info' | 'success'
  valid: boolean
}

export function usePasswordStrength(password: Ref<string>) {
  const { t } = useI18n()

  const strength = computed<PasswordStrength>(() => {
    const pwd = password.value ?? ''
    const rules: PasswordRule[] = [
      { key: 'min', passed: pwd.length >= 8, label: t('auth.password.rules.min') },
      { key: 'upper', passed: /[A-Z]/.test(pwd), label: t('auth.password.rules.upper') },
      { key: 'digit', passed: /\d/.test(pwd), label: t('auth.password.rules.digit') },
      { key: 'special', passed: /[^A-Za-z0-9]/.test(pwd), label: t('auth.password.rules.special') },
    ]
    const score = rules.filter((r) => r.passed).length
    const percent = (score / rules.length) * 100

    let label = t('auth.password.strength.empty')
    let color: PasswordStrength['color'] = 'error'
    if (pwd.length === 0) {
      label = t('auth.password.strength.empty')
      color = 'error'
    } else if (score <= 1) {
      label = t('auth.password.strength.weak')
      color = 'error'
    } else if (score === 2) {
      label = t('auth.password.strength.fair')
      color = 'warning'
    } else if (score === 3) {
      label = t('auth.password.strength.good')
      color = 'info'
    } else {
      label = t('auth.password.strength.strong')
      color = 'success'
    }

    return { rules, score, percent, label, color, valid: score === rules.length }
  })

  return { strength }
}

