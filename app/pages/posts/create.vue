<script setup lang="ts">
import { addPost } from '~/repositories/posts'

const titles = {
  '11111': 'Some',
  '22222': 'Other',
  '33333': 'Tired to select',
}

const { form, send, errors, pending } = useForm(
  addPost, // ← пряма функція з репозиторію
  { url: '', title: '11111', content: '' },
  (post) => navigateTo({ name: 'posts-id', params: { id: post.id } }),
)
</script>

<template>
  <div class="p-6 max-w-md">
    <h1 class="text-xl font-medium mb-4">Create post</h1>

    <form class="space-y-4" @submit.prevent="send">
      <div>
        <label class="block mb-1">Url</label>
        <input v-model="form.url" type="text" class="border rounded px-3 py-2 w-full" />
        <p v-if="errors.url" class="text-danger text-sm">{{ errors.url }}</p>
      </div>

      <div>
        <label class="block mb-1">Title</label>
        <select v-model="form.title" class="border rounded px-3 py-2 w-full">
          <option v-for="(label, key) in titles" :key="key" :value="key">{{ label }}</option>
        </select>
        <p v-if="errors.title" class="text-danger text-sm">{{ errors.title }}</p>
      </div>

      <div>
        <label class="block mb-1">Content</label>
        <input v-model="form.content" type="text" class="border rounded px-3 py-2 w-full" />
        <p v-if="errors.content" class="text-danger text-sm">{{ errors.content }}</p>
      </div>

      <BaseButton :disabled="pending">Send</BaseButton>
    </form>
  </div>
</template>
