import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface UserAvatarProps {
  name: string
  src?: string | null
  className?: string
  fallbackClassName?: string
}

export const getInitials = (fullName: string) => {
  if (!fullName) return ''
  const words = fullName.trim().split(/\s+/)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

/**
 * Generates a vibrant HSL color based on the hash of a string.
 */
export const getNameColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Hue: 0-360, Saturation: 65-80%, Lightness: 45-55% for vivid but readable colors
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

export const UserAvatar = ({ name, src, className, fallbackClassName }: UserAvatarProps) => {
  const bgColor = getNameColor(name)

  // 1. Determine if the image is already cached synchronously
  const isCurrentlyCached = useMemo(() => {
    if (typeof window === 'undefined' || !src) return false
    const img = new Image()
    img.src = src
    return img.complete
  }, [src])

  const [isLoaded, setIsLoaded] = useState(isCurrentlyCached)
  const [prevSrc, setPrevSrc] = useState(src)

  // 2. Sync state when src changes during render phase
  if (src !== prevSrc) {
    setPrevSrc(src)
    setIsLoaded(isCurrentlyCached)
  }

  return (
    <Avatar className={cn('h-8 w-8', className)}>
      {src && (
        <AvatarImage
          src={src}
          alt={name}
          className={cn('object-cover transition-opacity duration-200', isLoaded ? 'opacity-100' : 'opacity-0')}
          onLoadingStatusChange={(status) => {
            if (status === 'loaded') setIsLoaded(true)
          }}
        />
      )}
      <AvatarFallback
        delayMs={isLoaded ? 0 : 800}
        className={cn('!text-white font-bold text-[11px]', fallbackClassName)}
        style={{ backgroundColor: bgColor }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
