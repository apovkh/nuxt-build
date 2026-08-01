<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ code: string, title?: string }>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
  catch {
    // clipboard недоступний (http/непідтримка) — тихо ігноруємо
  }
}
</script>

<template>
  <div class="rounded border border-border overflow-hidden">
    <div class="flex items-center justify-between bg-muted px-3 py-2">
      <span class="text-sm font-medium">{{ title }}</span>
      <button
        type="button"
        class="text-xs rounded border border-border px-2 py-1 transition hover:border-brand-primary"
        @click="copy"
      >
        {{ copied ? 'Скопійовано ✓' : 'Копіювати' }}
      </button>
    </div>
    <pre class="text-xs overflow-auto p-3 leading-relaxed"><code>{{ code }}</code></pre>
  </div>
</template>
