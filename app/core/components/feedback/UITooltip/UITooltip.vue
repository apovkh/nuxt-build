<script setup lang="ts">
import { mdiHelpCircleOutline } from '@mdi/js'

defineProps<{
  /**
   * Тіло тултипа. Рендериться як HTML (v-html) — сюди можна передавати лише
   * розмітку, автором якої є розробник або довірений бекенд.
   * НІКОЛИ не передавай сюди сирий користувацький ввід: він виконається як скрипт.
   * Потрібен звичайний текст без розмітки — скористайся слотом.
   */
  text: string
  ariaLabel?: string
  contentClass?: string
  uniformHtmlFontSize?: boolean
  openOnClick?: boolean
  /** Дозволяє навести курсор на сам тултип (виділити текст / клікнути посилання) — контент не закривається. */
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
/* Вхідна розмітка часто задає font-size на вкладених тегах; inherit тримає
   один розмір на весь тултип. */
.ui-tooltip__html--uniform {
  font-size: 1rem;
}

.ui-tooltip__html--uniform :deep(*) {
  font-size: inherit !important;
}
</style>
