import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import App from '../App.vue'
import fr from '../locales/fr.json'

// Mock the axios plugin used by ApiStatus / auth store to avoid real HTTP
vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('offline')),
    post: vi.fn().mockRejectedValue(new Error('offline')),
    interceptors: { response: { use: vi.fn() } },
  },
  API_BASE_URL: 'http://localhost:8080',
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts and renders the app title', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div>home</div>' } }],
    })
    const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

    const wrapper = mount(App, {
      global: {
        plugins: [router, i18n],
        stubs: {
          UApp: { template: '<div><slot /></div>' },
          UIcon: true,
          UButton: true,
          UColorModeButton: true,
          LangSwitcher: true,
          ApiStatus: true,
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: true,
        },
      },
    })

    await router.isReady()
    expect(wrapper.text()).toContain('Oasis')
  })
})
