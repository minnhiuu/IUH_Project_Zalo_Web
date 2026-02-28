import { useEffect, useRef } from 'react'

interface FaviconBadgeOptions {
  count: number
  title?: string
}

export const useNotificationBadge = ({ count, title = 'BondHub' }: FaviconBadgeOptions) => {
  const originalTitle = useRef(title)
  const originalFavicon = useRef<string | null>(null)

  useEffect(() => {
    if (!originalFavicon.current) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      originalFavicon.current = link?.href || '/images/logo.svg'
    }

    if (count > 0) {
      const displayCount = count > 99 ? '99+' : count
      document.title = `(${displayCount}) ${originalTitle.current}`

      const img = new Image()
      img.src = originalFavicon.current!
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')

        if (ctx) {
          ctx.drawImage(img, 0, 0, 64, 64)

          ctx.beginPath()
          ctx.arc(48, 16, 14, 0, 2 * Math.PI)
          ctx.fillStyle = '#ff4d4f'
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 4
          ctx.stroke()

          const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
          if (link) {
            link.href = canvas.toDataURL('image/png')
          }
        }
      }
    } else {
      document.title = originalTitle.current

      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (link && originalFavicon.current) {
        link.href = originalFavicon.current
      }
    }
  }, [count])
}
