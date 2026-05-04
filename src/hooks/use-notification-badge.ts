import { useEffect, useRef } from 'react'

interface FaviconBadgeOptions {
  count: number
  showDot?: boolean
  title?: string
  lastMessage?: string | null
}

export const useNotificationBadge = ({ count, showDot = true, title, lastMessage }: FaviconBadgeOptions) => {
  const originalTitle = useRef(title || 'BondHub')
  const originalFavicon = useRef<string | null>(null)

  useEffect(() => {
    if (title) originalTitle.current = title
  }, [title])

  useEffect(() => {
    if (!originalFavicon.current) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      originalFavicon.current = link?.href || '/images/logo.svg'
    }

    if (count > 0) {
      const displayCount = count > 99 ? '99+' : count
      
      if (lastMessage) {
        document.title = lastMessage
      } else {
        document.title = `(${displayCount}) ${originalTitle.current}`
      }

      if (showDot) {
        const img = new Image()
        img.src = originalFavicon.current!
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 64
          canvas.height = 64
          const ctx = canvas.getContext('2d')

          if (ctx) {
            ctx.drawImage(img, 0, 0, 64, 64)

            // Vẽ chấm đỏ ở góc trên bên phải (Kiểu Facebook/Zalo)
            ctx.beginPath()
            ctx.arc(48, 16, 12, 0, 2 * Math.PI)
            ctx.fillStyle = '#ff4d4f' // Màu đỏ thông báo chuẩn
            ctx.fill()
            
            // Viền trắng cho chấm đỏ nhìn chuyên nghiệp
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
        const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (link && originalFavicon.current) {
          link.href = originalFavicon.current
        }
      }
    } else {
      document.title = originalTitle.current
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (link && originalFavicon.current) {
        link.href = originalFavicon.current
      }
    }
  }, [count, showDot, lastMessage])
}
