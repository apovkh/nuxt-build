/**
 * Helpers for restoring keyboard focus after closing overlays (dialogs, menus).
 * Vuetify VDialog only restores focus when an activator slot is used; programmatic
 * dialogs need an explicit snapshot of the previously focused element.
 */

export function captureFocusRestoreTarget(): HTMLElement | null {
  if (!import.meta.client)
    return null

  const el = document.activeElement

  if (!(el instanceof HTMLElement))
    return null

  if (el === document.body || el === document.documentElement)
    return null

  return el
}

export function restoreFocusToElement(el: HTMLElement | null) {
  if (!el)
    return

  if (!document.body.contains(el))
    return

  try {
    el.focus({ preventScroll: true })
  }
  catch {
    // Element may not be focusable in edge cases
  }
}
