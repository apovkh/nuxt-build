import type { RouteLocationRaw } from 'vue-router'

export interface LinkResolverOptions {
  /**
   * Offset in pixels for scroll (useful for fixed headers)
   */
  scrollOffset?: number
  /**
   * Smooth scroll behavior
   */
  smoothScroll?: boolean
}

export interface LinkInfo {
  isExternal: boolean
  isAnchor: boolean
  isMailTo: boolean
  isTel: boolean
  isDownload: boolean
  href: string
}

const EXTERNAL_URL_REGEX = /^(?:https?:\/\/|\/\/)/i

// Base for parsing relative paths via URL(). Never makes it into the output:
// for internal links we return only pathname+search+hash.
const PLACEHOLDER_ORIGIN = 'http://localhost'

export const useLinkResolver = (options: LinkResolverOptions = {}) => {
  const { scrollOffset = 0, smoothScroll = true } = options

  const analyzeLinkType = (to: string | RouteLocationRaw | undefined): LinkInfo => {
    const href = typeof to === 'string' ? to : (to as { path?: string })?.path || ''

    return {
      isExternal: EXTERNAL_URL_REGEX.test(href),
      isAnchor: href.startsWith('#'),
      isMailTo: href.startsWith('mailto:'),
      isTel: href.startsWith('tel:'),
      isDownload: false, // This is determined by prop, not URL
      href,
    }
  }

  const isExternalUrl = (url: string): boolean => {
    return EXTERNAL_URL_REGEX.test(url)
  }

  const scrollToElement = (elementId: string): boolean => {
    if (!import.meta.client) {
      return false
    }

    const id = elementId.startsWith('#') ? elementId.slice(1) : elementId
    const element = document.getElementById(id)

    if (!element) {
      return false
    }

    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - scrollOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: smoothScroll ? 'smooth' : 'auto',
    })

    if (history.pushState) {
      history.pushState(null, '', `#${id}`)
    }

    return true
  }

  const buildHref = (
    baseUrl: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): string => {
    if (!query || Object.keys(query).length === 0) {
      return baseUrl
    }

    // A placeholder origin, not window.location — buildHref is called from a computed in UILink,
    // i.e. on the server too. For internal paths the origin is dropped below anyway,
    // and for external URLs baseUrl carries its own origin and the base is ignored.
    const url = new URL(baseUrl, PLACEHOLDER_ORIGIN)

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })

    if (isExternalUrl(baseUrl)) {
      return url.toString()
    }

    return `${url.pathname}${url.search}${url.hash}`
  }

  const getSecurityAttrs = (target?: string): Record<string, string> => {
    if (target === '_blank') {
      return {
        rel: 'noopener noreferrer',
      }
    }

    return {}
  }

  return {
    analyzeLinkType,
    isExternalUrl,
    scrollToElement,
    buildHref,
    getSecurityAttrs,
  }
}
