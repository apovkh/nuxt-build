<script setup lang="ts">
import type { UITabItemProps, UITabsSize, UITabsVariant, UITabValue } from './UITabs.types'
import { useResizeObserver, useScroll } from '@vueuse/core'
import UITabItem from './UITabItem.vue'
import { UI_TABS_KEY } from './UITabs.types'

const props = withDefaults(defineProps<{
  variant?: UITabsVariant
  size?: UITabsSize
  items?: UITabItemProps[]
  isLoading?: boolean
}>(), {
  variant: 'default',
  size: 'default',
  items: undefined,
  isLoading: false,
})

const modelValue = defineModel<UITabValue>()

// Стан і колбек віддаємо через inject, щоб айтеми працювали і зі слота,
// і з items[] без прокидання пропсів на кожен таб.
provide(UI_TABS_KEY, {
  modelValue,
  variant: toRef(props, 'variant'),
  size: toRef(props, 'size'),
  updateModelValue: (value: UITabValue) => {
    modelValue.value = value
  },
})

// Скролбар схований (див. .no-scrollbar), тому єдина підказка, що таби
// скролляться на вузьких екранах, — градієнтні тіні по краях.
const scrollRef = ref<HTMLElement | null>(null)
const { arrivedState, x } = useScroll(scrollRef)

const canScroll = ref(false)

const updateCanScroll = () => {
  if (scrollRef.value) {
    canScroll.value = scrollRef.value.scrollWidth > scrollRef.value.clientWidth
  }
}

useResizeObserver(scrollRef, updateCanScroll)

// Самого resize замало: коли міняється склад табів, ширина контейнера лишається
// тією самою, а скрол з'являється/зникає — і тіні по краях застигали б.
watch(() => props.items, () => nextTick(updateCanScroll), { deep: true })

const showStartShadow = computed(() => canScroll.value && !arrivedState.left && x.value > 0)
const showEndShadow = computed(() => canScroll.value && !arrivedState.right)
</script>

<template>
  <div class="ui-tabs-wrapper relative min-w-0">
    <VProgressLinear
      v-if="isLoading"
      indeterminate
      rounded="lg"
      height="2"
      color="brand-primary"
      aria-label="Loading"
      class="ui-tabs__loader"
    />

    <div
      v-if="showStartShadow"
      class="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 rounded-md bg-gradient-to-r from-black/10 to-transparent transition-opacity duration-300"
    />

    <div
      ref="scrollRef"
      role="tablist"
      class="ui-tabs no-scrollbar relative flex gap-1 overflow-x-auto overflow-y-hidden rounded-lg p-1"
      :class="variant === 'bordered' ? 'border border-border bg-surface' : 'bg-muted'"
    >
      <template v-if="items">
        <UITabItem
          v-for="item in items"
          :key="String(item.value ?? item.label)"
          v-bind="item"
        />
      </template>
      <slot v-else />
    </div>

    <div
      v-if="showEndShadow"
      class="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 rounded-md bg-gradient-to-l from-black/10 to-transparent transition-opacity duration-300"
    />
  </div>
</template>

<style lang="scss" scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ui-tabs__loader {
  // !important — перебиває інлайн-позиціонування VProgressLinear,
  // щоб лоадер ліг усередині рамки табів, а не по зовнішньому краю.
  position: absolute;
  top: 2px !important;
  left: 4px;
  width: calc(100% - 8px);
  z-index: 1;
}
</style>
