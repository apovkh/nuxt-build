<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'

defineProps<{
  /**
   * Tooltip body. Rendered as HTML (v-html) — only pass markup
   * authored by a developer or a trusted backend.
   * NEVER pass raw user input here: it will execute as a script.
   * Need plain text without markup — use the slot instead.
   */
  text: string
  ariaLabel?: string
  contentClass?: string
  uniformHtmlFontSize?: boolean
  openOnClick?: boolean
  /** Lets the cursor hover over the tooltip itself (select text / click a link) — the content doesn't close. */
  interactive?: boolean
}>()
</script>

<template>
  <VTooltip
    location="top"
    :aria-label="text"
    :content-props="{ 'aria-label': ariaLabel || text }"
    :open-delay="100"
    :open-on-click="openOnClick"
    :content-class="['ui-tooltip__content', contentClass]"
    :interactive="interactive"
    :close-delay="interactive ? 150 : 0"
    data-id="ui-tooltip"
  >
    <template #activator="{ props: activatorProps }">
      <slot name="activator" v-bind="{ props: activatorProps }" />
      <UIIcon
        v-if="!$slots.activator"
        size="16"
        :icon="mdiHelpCircleOutline"
        class="opacity-50"
        :aria-label="text"
        v-bind="activatorProps"
      />
    </template>
    <div
      class="max-w-[400px] py-1 whitespace-pre-wrap leading-relaxed"
      :class="[contentClass, uniformHtmlFontSize && 'ui-tooltip__html--uniform']"
      v-html="text"
    />
  </VTooltip>
</template>

<style lang="scss">
.v-tooltip > .v-overlay__content.ui-tooltip__content {
  @apply max-w-[400px] rounded-xl bg-[#012030] px-4 py-3 text-[12.5px] leading-relaxed text-white opacity-100 shadow-[0_18px_40px_-20px_rgba(2,48,71,0.7)];
}
</style>

<style scoped lang="scss">
/* Incoming markup often sets font-size on nested tags; inherit keeps
   a single size across the whole tooltip. */
.ui-tooltip__html--uniform {
  font-size: 1rem;
}

.ui-tooltip__html--uniform :deep(*) {
  font-size: inherit !important;
}
</style>
