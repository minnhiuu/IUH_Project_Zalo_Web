import { motion } from 'framer-motion'
import {
  IconMThumbsUpDefault,
  IconMRedHeart,
  IconMFaceWithTearsOfJoy,
  IconMFaceWithOpenMouth,
  IconMCryingFace,
  IconMPoutingFace
} from 'react-fluentui-emoji/lib/modern'
import React from 'react'
import { useSocialText } from '../../i18n/use-social-text'

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'

export interface EmojiProps extends React.SVGProps<SVGElement> {
  size?: number | string
}

export interface ReactionOption {
  type: ReactionType
  emoji: string
  textClass: string
  Icon: React.FunctionComponent<EmojiProps>
}

export const REACTIONS: ReactionOption[] = [
  { type: 'LIKE', emoji: '👍', textClass: 'text-primary', Icon: IconMThumbsUpDefault },
  { type: 'LOVE', emoji: '❤️', textClass: 'text-rose-500', Icon: IconMRedHeart },
  { type: 'HAHA', emoji: '😂', textClass: 'text-amber-500', Icon: IconMFaceWithTearsOfJoy },
  { type: 'WOW', emoji: '😮', textClass: 'text-orange-500', Icon: IconMFaceWithOpenMouth },
  { type: 'SAD', emoji: '😢', textClass: 'text-sky-500', Icon: IconMCryingFace },
  { type: 'ANGRY', emoji: '😡', textClass: 'text-red-500', Icon: IconMPoutingFace }
]

interface ReactionPickerProps {
  open: boolean
  onSelect: (type: ReactionType) => void
}

export function ReactionPicker({ open, onSelect }: ReactionPickerProps) {
  const { text } = useSocialText()

  if (!open) {
    return null
  }

  return (
    <div className='absolute bottom-full left-1/2 z-20 -translate-x-1/2 pb-1'>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className='flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-1.5 py-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-900'
      >
        {REACTIONS.map((reaction) => (
          <motion.button
            key={reaction.type}
            type='button'
            onClick={() => onSelect(reaction.type)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.02 * REACTIONS.indexOf(reaction), ease: 'easeOut' }}
            whileHover={{ y: -2, scale: 1.1 }}
            whileTap={{ scale: 0.94 }}
            className='flex h-14 w-14 items-center justify-center rounded-full text-[2.75rem] leading-none'
            title={text.reactions.labels[reaction.type]}
          >
            <reaction.Icon size={44} className='select-none' />
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
