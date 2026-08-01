<script setup lang="ts">
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'

defineProps<{
  isOpen: boolean
  hidden?: boolean
  group: any
  onToggle: () => void
}>()
</script>

<template>
  <UIBtn
    v-if="!hidden"
    icon
    variant="text"
    size="small"
    :aria-label="isOpen ? 'Collapse group' : 'Expand group'"
    @click.stop="onToggle"
  >
    <UIIcon :icon="isOpen ? mdiChevronDown : mdiChevronRight" />
  </UIBtn>
</template>
