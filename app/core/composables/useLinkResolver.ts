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

// Базa для розбору відносних шляхів через URL(). Ніколи не потрапляє у вивід:
// для внутрішніх посилань повертаємо лише pathname+search+hash.
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

    // Фіктивний origin, а не window.location — buildHref викликається з computed у UILink,
    // тобто і на сервері. Для внутрішніх шляхів origin усе одно відкидається нижче,
    // а для зовнішніх URL baseUrl несе власний origin і base ігнорується.
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
