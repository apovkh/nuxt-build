<script setup lang="ts">
import { login } from '~/repositories/auth'

const { form, send, errors, pending } = useForm(
  login,
  { login: '', password: '' },
  (res) => {
    localStorage.setItem('AUTH', res.token)
    document.location.href = '/'
  },
)
</script>

<template>
  <div class="p-6 max-w-sm">
    <h1 class="text-xl font-medium mb-4">Enter to site</h1>

    <form class="space-y-4" @submit.prevent="send">
      <div>
        <label class="block mb-1">Login</label>
        <input v-model="form.login" type="text" class="border rounded px-3 py-2 w-full" />
        <p v-if="errors.login" class="text-danger text-sm">{{ errors.login }}</p>
      </div>

      <div>
        <label class="block mb-1">Password</label>
        <input v-model="form.password" type="password" class="border rounded px-3 py-2 w-full" />
        <p v-if="errors.password" class="text-danger text-sm">{{ errors.password }}</p>
      </div>

      <BaseButton :disabled="pending">Send</BaseButton>
    </form>
  </div>
</template>
