<script setup lang="ts">
// Demo/verification page for the core UI kit. Exercises every component so the build
// actually compiles them and the behaviours can be checked in a browser.
import { mdiMagnify } from '@mdi/js'

definePageMeta({ title: 'UI kit' })

const text = ref('')
const area = ref('')
const single = ref(false)
const many = ref<number[]>([])
const selected = ref<string | null>(null)
const dialog = ref(false)
const tab = ref('one')

const rows = ref([
  { id: 1, name: 'Alpha', group: 'A', qty: 3 },
  { id: 2, name: 'Beta', group: 'A', qty: 7 },
  { id: 3, name: 'Gamma', group: 'B', qty: 1 },
])

const headers = [
  { key: 'name', title: 'Name' },
  { key: 'qty', title: 'Qty' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl flex flex-col gap-8 p-6">
    <section class="flex flex-wrap items-center gap-3">
      <UIBtn :attributes="{ 'data-test': 'submit-btn' }">
        Primary
      </UIBtn>
      <UIBtn variant="outlined" color="secondary">
        Outlined
      </UIBtn>
      <UIBtn :loading="true">
        Loading
      </UIBtn>
      <UIIcon :icon="mdiMagnify" />
      <UITooltip text="Tooltip <b>body</b>" />
    </section>

    <section class="flex flex-wrap items-center gap-4">
      <UILink to="/" :query="{ page: 2 }">
        Internal with query
      </UILink>
      <UILink to="https://example.com" :query="{ ref: 'kit', page: 2 }" show-external-icon>
        External with query
      </UILink>
      <UILink wrapper :to="{ name: 'index' }">
        Wrapper object route
      </UILink>
    </section>

    <section class="flex flex-col gap-4">
      <UITextField
        v-model="text"
        label="Email"
        hint="We never share this"
        required
        :counter="20"
        :error-messages="text.length > 20 ? ['Maximum 20 characters'] : []"
      />
      <UITextarea v-model="area" label="Notes" :counter="100" />
      <UISelect
        v-model="selected"
        label="Pick one"
        :items="['One', 'Two', 'Three']"
      />
      <UICheckbox v-model="single" label="Single boolean" />
      <UICheckbox v-model="many" :value="1" label="Array item 1" />
      <UICheckbox v-model="many" :value="2" label="Array item 2" />
    </section>

    <section>
      <UITabs
        v-model="tab"
        :items="[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]"
      />
    </section>

    <section>
      <UITable :headers="headers" :items="rows" />
    </section>

    <section>
      <UITable
        :headers="headers"
        :items="rows"
        :group-by="[{ key: 'group' }]"
      />
    </section>

    <section>
      <UIScrollBox class="max-h-32">
        <p v-for="n in 12" :key="n">
          Scrollable line {{ n }}
        </p>
      </UIScrollBox>
    </section>

    <section>
      <UIBtn @click="dialog = true">
        Open dialog
      </UIBtn>
      <UIDialog v-model="dialog" title="Dialog">
        <p>Dialog body</p>
      </UIDialog>
      <UIEmptyState title="Nothing here" />
    </section>
  </div>
</template>
