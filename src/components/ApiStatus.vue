<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkApiConnection, API_BASE_URL } from '@/services/api'

const { t } = useI18n()

const isOpen = ref(false)
const status = ref<'loading' | 'connected' | 'error'>('loading')
const message = ref('')

async function checkConnection() {
  status.value = 'loading'
  const result = await checkApiConnection()
  status.value = result.connected ? 'connected' : 'error'
  message.value = result.message
}

function toggle() {
  isOpen.value = !isOpen.value
}

onMounted(checkConnection)
</script>

<template>
  <div class="api-status-panel" :class="{ open: isOpen }">
    <button class="toggle-tab" @click="toggle" :title="isOpen ? t('apiStatus.closePanel') : t('apiStatus.openPanel')">
      <span class="tab-dot" :class="status"></span>
    </button>
    <div class="panel-content">
      <div class="panel-header">
        <h3>{{ t('apiStatus.heading') }}</h3>
        <button class="close-btn" @click="toggle">&times;</button>
      </div>
      <div class="status-indicator" :class="status">
        <span class="dot"></span>
        <span class="label">
          <template v-if="status === 'loading'">{{ t('apiStatus.loading') }}</template>
          <template v-else-if="status === 'connected'">{{ t('apiStatus.connected') }}</template>
          <template v-else>{{ t('apiStatus.disconnected') }}</template>
        </span>
      </div>
      <p class="details">
        <span class="url">{{ API_BASE_URL }}</span>
        <span v-if="message" class="message">{{ message }}</span>
      </p>
      <button v-if="status !== 'loading'" class="retry-btn" @click="checkConnection">
        {{ t('apiStatus.retry') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.api-status-panel {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%) translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 9999;
  display: flex;
  align-items: center;
}

.api-status-panel.open {
  transform: translateY(-50%) translateX(0);
}

.toggle-tab {
  position: absolute;
  left: 100%;
  width: 24px;
  height: 60px;
  background: #1f2937;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

.toggle-tab:hover {
  background: #374151;
}

.tab-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.tab-dot.loading {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

.tab-dot.connected {
  background: #10b981;
}

.tab-dot.error {
  background: #ef4444;
}

.panel-content {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  min-width: 280px;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #374151;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #f3f4f6;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.loading .dot {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

.connected .dot {
  background: #10b981;
}

.error .dot {
  background: #ef4444;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.details {
  margin-top: 0.75rem;
  font-size: 0.813rem;
  color: #9ca3af;
}

.url {
  font-family: monospace;
  background: #374151;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.message {
  display: block;
  margin-top: 0.375rem;
  color: #d1d5db;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  width: 100%;
}

.retry-btn:hover {
  background: #2563eb;
}
</style>
