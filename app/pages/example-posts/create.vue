<script setup lang="ts">
import { addPost } from '~/repositories/example/posts'
import { rules } from '~/core/utils/validation'

definePageMeta({
  title: 'Create post',
  maxWidth: 'max-w-[1600px]',
  breadcrumbs: [
    { title: 'Головна', to: '/' },
    { title: 'Posts', to: '/example-posts' },
    { title: 'Create' },
  ],
})

const titles = {
  '11111': 'Some',
  '22222': 'Other',
  '33333': 'Tired to select',
}

const { form, send, errors, pending, validateField } = useForm(
  addPost,
  { url: '', title: '11111', content: '' },
  (post) => navigateTo({ name: 'example-posts-id', params: { id: post.id } }),
  {
    url: [rules.required, rules.maxLength(255)],
    title: [rules.required],
    content: [rules.required, rules.minLength(3)],
  },
)

const nativeCode = `<form @submit.prevent="send">
  <input
    v-model="form.url"
    @blur="validateField('url')"
  >
  <p v-if="errors.url?.[0]">{{ errors.url[0] }}</p>

  <button type="submit" :disabled="pending">Send</button>
</form>`

const vuetifyCode = `<VForm @submit.prevent="send">
  <VTextField
    v-model="form.url"
    label="Url"
    :error-messages="errors.url"
    @blur="validateField('url')"
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
      <label class="block mb-1">Url</label>
      <input v-model="form.url" type="text" class="border rounded px-3 py-2 w-full" @blur="validateField('url')">
      <p v-if="errors.url?.[0]" class="text-error text-sm">{{ errors.url[0] }}</p>
    </div>

    <div>
      <label class="block mb-1">Title</label>
      <select v-model="form.title" class="border rounded px-3 py-2 w-full">
        <option v-for="(label, key) in titles" :key="key" :value="key">{{ label }}</option>
      </select>
      <p v-if="errors.title?.[0]" class="text-error text-sm">{{ errors.title[0] }}</p>
    </div>

    <div>
      <label class="block mb-1">Content</label>
      <input v-model="form.content" type="text" class="border rounded px-3 py-2 w-full" @blur="validateField('content')">
      <p v-if="errors.content?.[0]" class="text-error text-sm">{{ errors.content[0] }}</p>
    </div>

    <button type="submit" :disabled="pending" class="bg-primary text-white rounded px-4 py-2 disabled:opacity-50">Send</button>
  </form>
</template>
