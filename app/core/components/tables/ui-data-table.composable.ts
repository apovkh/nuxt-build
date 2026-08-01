import type { Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

/**
 * Форма VDataTable-групи (Vuetify не експортує свій Group публічно).
 * Поля мають збігатися з Vuetify один-в-один: isGroupOpen/toggleGroup у слот-скоупі
 * типізовані через Group, і вужчий тип не пройшов би за контраваріантністю параметра.
 */
interface TableGroup {
  type: 'group'
  depth: number
  id: string
  key: string
  value: any
  items: readonly any[]
}

/** Скоуп слота VDataTable, звідки беремо доступ до груп. */
export interface GroupSlotScope {
  groupedItems?: readonly any[]
  isGroupOpen?: (group: TableGroup) => boolean
  toggleGroup?: (group: TableGroup) => void
}

const isGroup = (node: any): node is TableGroup => node?.type === 'group'

// groupedItems «сплющений» за станом розгортання — закрита група приходить одним
// вузлом. Але її .items тримає повне піддерево незалежно від стану, тож рекурсія
// по .items знаходить і вкладені групи. Дедуплікуємо за id: розгорнута група
// трапляється і як окремий запис, і всередині батьківського .items.
function collectGroups(nodes: readonly any[] | undefined, acc = new Map<string, TableGroup>()) {
  nodes?.forEach((node) => {
    if (isGroup(node)) {
      acc.set(node.id, node)
      collectGroups(node.items, acc)
    }
  })

  return acc
}

/**
 * Розгортання/згортання всіх груп таблиці. Працює через публічний слот-скоуп
 * VDataTable (groupedItems / isGroupOpen / toggleGroup) — без доступу до внутрішніх
 * інжектів Vuetify. Скоуп треба передати з будь-якого слота, що його отримує
 * (у UITable це #top).
 */
export function useGrouped() {
  // Скоуп тримаємо поза реактивністю: setScope викликається під час рендера слота,
  // і реактивне сховище утворило б цикл рендер → зміна → рендер.
  let scope: GroupSlotScope | null = null
  const isAnyOpened = ref(false)

  const listGroups = () => [...collectGroups(scope?.groupedItems).values()]

  const syncOpenState = () => {
    const isGroupOpen = scope?.isGroupOpen
    // Присвоєння тим самим значенням нічого не тригерить, тож стан сходиться
    // за один прохід і після ручного розгортання окремої групи теж.
    isAnyOpened.value = !!isGroupOpen && listGroups().some(group => isGroupOpen(group))
  }

  const setScope = (value: GroupSlotScope) => {
    scope = value
    void nextTick(syncOpenState)
  }

  const toggleAll = () => {
    const isGroupOpen = scope?.isGroupOpen
    const toggleGroup = scope?.toggleGroup

    if (!isGroupOpen || !toggleGroup)
      return

    // Напрямок фіксуємо до першого перемикання — toggleGroup міняє стан під час обходу.
    const shouldOpen = !isAnyOpened.value

    listGroups().forEach((group) => {
      if (isGroupOpen(group) !== shouldOpen) {
        toggleGroup(group)
      }
    })

    isAnyOpened.value = shouldOpen
  }

  return {
    isAnyOpened,
    toggleAll,
    setScope,
  }
}

export function useTableDimmer(tableRef: Ref<any>) {
  const showScrollDimmer = ref(false)
  const tableHeaderHeight = ref('0px')
  const tableFooterHeight = ref('0px')

  const rootEl = computed<HTMLElement | null>(() => tableRef.value?.$el ?? tableRef.value ?? null)
  const wrapperEl = computed<HTMLElement | null>(
    () => rootEl.value?.querySelector('.v-table__wrapper') ?? null,
  )

  const updateDimmer = () => {
    const el = rootEl.value

    if (!el)
      return

    const wrapper = wrapperEl.value

    if (wrapper) {
      const { scrollWidth, clientWidth, scrollLeft } = wrapper
      showScrollDimmer.value = scrollWidth > clientWidth && (scrollWidth - clientWidth - scrollLeft > 1)
    }

    // Обидві висоти скидаємо в '0px', коли відповідного слота немає — інакше
    // дімер лишався б зі старим офсетом на таблиці без top/footer.
    const topSlot = el.querySelector<HTMLElement>('.ui-table__top')
    tableHeaderHeight.value = topSlot ? `${topSlot.offsetHeight}px` : '0px'

    const footer = el.querySelector<HTMLElement>('.v-data-table-footer')
    tableFooterHeight.value = footer ? `${footer.offsetHeight}px` : '0px'
  }

  // Спостерігачі реєструються на верхньому рівні setup — усередині onMounted/watch
  // у VueUse немає активного effect scope, тож вони ніколи не знімалися б,
  // а кожна зміна $el додавала б ще один на відчепленому вузлі.
  useResizeObserver(rootEl, updateDimmer)
  useResizeObserver(wrapperEl, updateDimmer)
  useEventListener(wrapperEl, 'scroll', updateDimmer)

  onMounted(() => nextTick(updateDimmer))

  return {
    showScrollDimmer,
    tableHeaderHeight,
    tableFooterHeight,
  }
}
