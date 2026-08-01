<script setup lang="ts">
import { rules } from '~/core/utils/validation'
import { login } from '~/repositories/example/auth'

definePageMeta({
  hasCode: true, // грід 2-колонки вже на SSR (див. default.vue)
  title: 'Enter to site',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Login' },
  ],
})

const { form, send, errors, pending, validateField } = useForm(
  login,
  { login: '', password: '' },
  (res) => {
    localStorage.setItem('AUTH', res.token)
    document.location.href = '/'
  },
  {
    login: [rules.required],
    password: [rules.required, rules.minLength(8)],
  },
)

const nativeCode = `<form @submit.prevent="send">
  <input
    v-model="form.login"
    @blur="validateField('login')"
  >
  <p v-if="errors.login?.[0]">{{ errors.login[0] }}</p>

  <button type="submit" :disabled="pending">Send</button>
</form>`

const vuetifyCode = `<VForm @submit.prevent="send">
  <VTextField
    v-model="form.login"
    label="Login"
    :error-messages="errors.login"
    @blur="validateField('login')"
  />

  <VBtn type="submit" :loading="pending">Send</VBtn>
</VForm>`

usePageCode([
  { title: 'Native', code: nativeCode },
  { title: 'Vuetify', code: vuetifyCode },
])
</script>

<template>
  <form class="space-y-4" @submit.prevent="send">
    <div>
      <label class="block mb-1">Login</label>
      <input v-model="form.login" type="text" class="border rounded px-3 py-2 w-full" @blur="validateField('login')">
      <p v-if="errors.login?.[0]" class="text-error text-sm">
        {{ errors.login[0] }}
      </p>
    </div>

    <div>
      <label class="block mb-1">Password</label>
      <input v-model="form.password" type="password" class="border rounded px-3 py-2 w-full" @blur="validateField('password')">
      <p v-if="errors.password?.[0]" class="text-error text-sm">
        {{ errors.password[0] }}
      </p>
    </div>

    <button type="submit" :disabled="pending" class="bg-brand-primary text-white rounded px-4 py-2 disabled:opacity-50">
      Send
    </button>
  </form>
</template>
