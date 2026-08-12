import type { ComputedRef, Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'

const isCloseTo = (a: number, b: number, threshold = 5) => {
  return Math.abs(a - b) <= threshold
}

const checkScrollExistence = (el: HTMLElement): { x: boolean, y: boolean } => {
  const { scrollWidth, clientWidth, scrollHeight, clientHeight } = el

  return {
    x: scrollWidth > clientWidth,
    y: scrollHeight > clientHeight,
  }
}

const checkArrivedState = (
  el: HTMLElement,
): {
  arrivedRight: boolean
  arrivedBottom: boolean
  arrivedLeft: boolean
  arrivedTop: boolean
} => {
  const { scrollLeft, clientWidth, scrollWidth, scrollTop, clientHeight, scrollHeight } = el

  return {
    arrivedRight: isCloseTo(scrollLeft + clientWidth, scrollWidth),
    arrivedBottom: isCloseTo(scrollTop + clientHeight, scrollHeight),
    arrivedLeft: isCloseTo(scrollLeft, 0),
    arrivedTop: isCloseTo(scrollTop, 0),
  }
}

type ComputedOrRef<T> = Ref<T> | ComputedRef<T>
export const useScrollExtended = (elRef: ComputedOrRef<HTMLElement | undefined | null>) => {
  const xState = reactive({
    hasScrollbar: false,
    arrivedLeft: true,
    arrivedRight: true,
  })

  const yState = reactive({
    hasScrollbar: false,
    arrivedTop: true,
    arrivedBottom: true,
  })

  // The edge position updates on every scroll; scrollbar presence — only when
  // the dimensions could have changed (element, resize, content re-render).
  const syncArrived = () => {
    const el = elRef.value

    if (!el) {
      return
    }

    const state = checkArrivedState(el)
    xState.arrivedRight = state.arrivedRight
    xState.arrivedLeft = state.arrivedLeft
    yState.arrivedBottom = state.arrivedBottom
    yState.arrivedTop = state.arrivedTop
  }

  const sync = () => {
    const el = elRef.value

    if (!el) {
      return
    }

    const { x, y } = checkScrollExistence(el)
    xState.hasScrollbar = x
    yState.hasScrollbar = y

    syncArrived()
  }

  useEventListener(elRef, 'scroll', syncArrived)
  watch(elRef, sync, { immediate: true })
  useResizeObserver(elRef, sync)

  // A content re-render (rows added/removed) changes scrollHeight without touching the
  // container's own size — resize never fires there, and the shadow state would go stale.
  onUpdated(sync)

  const scrollToEnd = (direction: 'x' | 'y') => {
    const el = elRef.value

    if (!el) {
      return
    }

    if (direction === 'x') {
      el.scroll({ left: el.scrollWidth, behavior: 'smooth' })
    }
    else {
      el.scroll({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }

  return {
    scrollToEnd,
    xState,
    yState,
  }
}
