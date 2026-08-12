import type { Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

/**
 * Shape of a VDataTable group (Vuetify doesn't export its Group publicly).
 * Fields must match Vuetify one-to-one: isGroupOpen/toggleGroup in the slot scope
 * are typed via Group, and a narrower type wouldn't pass due to parameter contravariance.
 */
interface TableGroup {
  type: 'group'
  depth: number
  id: string
  key: string
  value: any
  items: readonly any[]
}

/** VDataTable slot scope that gives us access to the groups. */
export interface GroupSlotScope {
  groupedItems?: readonly any[]
  isGroupOpen?: (group: TableGroup) => boolean
  toggleGroup?: (group: TableGroup) => void
}

const isGroup = (node: any): node is TableGroup => node?.type === 'group'

// groupedItems is "flattened" by expansion state — a closed group arrives as a single
// node. But its .items holds the full subtree regardless of state, so recursing
// through .items finds nested groups too. Deduplicate by id: an expanded group
// appears both as a standalone entry and inside its parent's .items.
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
 * Expand/collapse all table groups. Works through the public VDataTable
 * slot scope (groupedItems / isGroupOpen / toggleGroup) — no access to Vuetify's
 * internal injects. The scope must be passed in from any slot that receives it
 * (in UITable that's #top).
 */
export function useGrouped() {
  // Keep the scope outside reactivity: setScope is called during slot render,
  // and a reactive store would create a render → change → render loop.
  let scope: GroupSlotScope | null = null
  const isAnyOpened = ref(false)

  const listGroups = () => [...collectGroups(scope?.groupedItems).values()]

  const syncOpenState = () => {
    const isGroupOpen = scope?.isGroupOpen
    // Assigning the same value triggers nothing, so the state converges
    // in a single pass — including after manually expanding an individual group.
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

    // Lock the direction before the first toggle — toggleGroup mutates state mid-iteration.
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

    // Reset both heights to '0px' when the corresponding slot is absent — otherwise
    // the dimmer would keep a stale offset on a table without top/footer.
    const topSlot = el.querySelector<HTMLElement>('.ui-table__top')
    tableHeaderHeight.value = topSlot ? `${topSlot.offsetHeight}px` : '0px'

    const footer = el.querySelector<HTMLElement>('.v-data-table-footer')
    tableFooterHeight.value = footer ? `${footer.offsetHeight}px` : '0px'
  }

  // Observers are registered at the top level of setup — inside onMounted/watch
  // VueUse has no active effect scope, so they would never be cleaned up,
  // and every $el change would add another one on a detached node.
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
