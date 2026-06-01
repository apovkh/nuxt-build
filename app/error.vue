<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

function handleClear() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <VApp>
    <VContainer class="d-flex flex-column align-center justify-center text-center" style="min-height: 100vh">
      <h1 class="text-h2 font-weight-bold mb-2">
        {{ props.error.statusCode }}
      </h1>
      <p class="text-font2 mb-6">
        {{ props.error.statusMessage || 'Something went wrong' }}
      </p>
      <VBtn color="primary" @click="handleClear">
        Go home
      </VBtn>
    </VContainer>
  </VApp>
</template>
