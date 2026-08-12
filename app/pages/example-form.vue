<script setup lang="ts">
import { rules } from '~/core/utils/validation'

definePageMeta({
  hasCode: true, // 2-column grid already on SSR (see default.vue)
  title: 'Demo: жива валідація',
  subtitle: 'Помилки зʼявляються/зникають на blur і на submit. Той самий errors згодиться для Vuetify.',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Форма валідації' },
  ],
})

// Mock API without a backend — just simulates a successful request after 600ms.
function fakeRegister(_data: { name: string, email: string, password: string, agree: boolean }) {
  return new Promise<{ id: number }>((resolve) => {
    setTimeout(resolve, 600, { id: 1 })
  })
}

const { form, errors, pending, success, send, validateField } = useForm(
  fakeRegister,
  { name: '', email: '', password: '', agree: false },
  () => {
    // onSuccess — this is where navigateTo / token storage would go
  },
  {
    name: [rules.required, rules.minLength(2), rules.maxLength(40)],
    email: [rules.required, rules.email],
    password: [rules.required, rules.minLength(8)],
    agree: [rules.agree],
  },
)

const nativeCode = `<script setup lang="ts">
import { rules } from '~/core/utils/validation'

const { form, errors, pending, send, validateField } = useForm(
  register,
  { email: '', password: '' },
  onSuccess,
  {
    email: [rules.required, rules.email],
    password: [rules.required, rules.minLength(8)],
  },
)
<\/script>

<template>
  <form @submit.prevent="send">
    <input
      v-model="form.email"
      @blur="validateField('email')"
    >
    <p v-if="errors.email?.[0]">{{ errors.email[0] }}</p>

    <button type="submit" :disabled="pending">Send</button>
  </form>
</template>`

const vuetifyCode = `<script setup lang="ts">
import { rules } from '~/core/utils/validation'

// useForm does NOT change — the same errors feeds Vuetify
const { form, errors, pending, send, validateField } = useForm(
  register,
  { email: '', password: '' },
  onSuccess,
  {
    email: [rules.required, rules.email],
    password: [rules.required, rules.minLength(8)],
  },
)
<\/script>

<template>
  <VForm @submit.prevent="send">
    <VTextField
      v-model="form.email"
      label="Email"
      :error-messages="errors.email"
      @blur="validateField('email')"
    />

    <VBtn type="submit" :loading="pending">Send</VBtn>
  </VForm>
</template>`

usePageCode([
  { title: 'Native', code: nativeCode },
  { title: 'Vuetify', code: vuetifyCode },
])
</script>

<template>
  <form class="space-y-4" @submit.prevent="send">
    <div>
      <label class="block mb-1">Імʼя</label>
      <input v-model="form.name" type="text" class="border rounded px-3 py-2 w-full" @blur="validateField('name')">
      <p v-if="errors.name?.[0]" class="text-error text-sm mt-1">
        {{ errors.name[0] }}
      </p>
    </div>

    <div>
      <label class="block mb-1">Email</label>
      <input v-model="form.email" type="text" class="border rounded px-3 py-2 w-full" @blur="validateField('email')">
      <p v-if="errors.email?.[0]" class="text-error text-sm mt-1">
        {{ errors.email[0] }}
      </p>
    </div>

    <div>
      <label class="block mb-1">Пароль</label>
      <input v-model="form.password" type="password" class="border rounded px-3 py-2 w-full" @blur="validateField('password')">
      <p v-if="errors.password?.[0]" class="text-error text-sm mt-1">
        {{ errors.password[0] }}
      </p>
    </div>

    <div>
      <label class="inline-flex items-center gap-2">
        <input v-model="form.agree" type="checkbox" @change="validateField('agree')">
        Погоджуюсь з умовами
      </label>
      <p v-if="errors.agree?.[0]" class="text-error text-sm mt-1">
        {{ errors.agree[0] }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button type="submit" :disabled="pending" class="bg-brand-primary text-white rounded px-4 py-2 disabled:opacity-50">
        {{ pending ? 'Надсилаю…' : 'Зареєструватись' }}
      </button>
      <button type="reset" class="bg-muted text-secondary rounded px-4 py-2">
        Скинути
      </button>
    </div>

    <p v-if="success" class="text-success">
      Успішно надіслано ✓
    </p>
  </form>
</template>
