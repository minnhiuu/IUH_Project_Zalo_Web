import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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
  const hasExplicitFallbackBg = Boolean(fallbackClassName && /\b(?:dark:)?bg-[^\s]+/.test(fallbackClassName))
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(src ?? undefined)

  useEffect(() => {
    if (!src || src === loadedSrc) return

    let active = true
    const img = new Image()

    // Keep showing the current avatar until the new one is fully loaded.
    img.onload = () => {
      if (active) setLoadedSrc(src)
    }

    img.src = src

    return () => {
      active = false
    }
  }, [src, loadedSrc])

  const displaySrc = src ? (loadedSrc ?? src) : undefined

  return (
    <Avatar className={cn('h-8 w-8', className)}>
      {displaySrc && <AvatarImage src={displaySrc} alt={name} className='object-cover' />}
      <AvatarFallback
        delayMs={300}
        className={cn('text-center leading-none text-white font-bold text-[11px]', fallbackClassName)}
        style={hasExplicitFallbackBg ? undefined : { backgroundColor: bgColor }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
