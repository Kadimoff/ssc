export interface OverflowFinding {
  selector: string
  left: number
  right: number
  width: number
}

declare global {
  interface Window {
    __sscLayoutAudit?: {
      viewportWidth: number
      documentWidth: number
      overflow: OverflowFinding[]
    }
  }
}

export function hasHorizontalOverflow(scrollWidth: number, clientWidth: number) {
  return scrollWidth > clientWidth
}

function selectorFor(element: Element) {
  if (element.id) return `#${CSS.escape(element.id)}`
  const classes = [...element.classList].slice(0, 3).map((name) => `.${CSS.escape(name)}`).join('')
  return `${element.tagName.toLowerCase()}${classes}`
}

export function findDocumentOverflow(documentRef: Document = document): OverflowFinding[] {
  const viewportWidth = documentRef.documentElement.clientWidth
  if (!hasHorizontalOverflow(documentRef.documentElement.scrollWidth, viewportWidth)) return []

  return [...documentRef.body.querySelectorAll<HTMLElement>('*')]
    .filter((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return style.position !== 'fixed' && rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1)
    })
    .slice(0, 20)
    .map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        selector: selectorFor(element),
        left: Math.round(rect.left * 10) / 10,
        right: Math.round(rect.right * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
      }
    })
}

export function installResponsiveAudit() {
  const run = () => {
    window.__sscLayoutAudit = {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      overflow: findDocumentOverflow(document),
    }
    // eslint-disable-next-line no-console
    if (window.__sscLayoutAudit.overflow.length) console.warn('[SSC layout audit]', window.__sscLayoutAudit)
  }
  window.requestAnimationFrame(run)
  window.addEventListener('resize', run)
  return () => window.removeEventListener('resize', run)
}
