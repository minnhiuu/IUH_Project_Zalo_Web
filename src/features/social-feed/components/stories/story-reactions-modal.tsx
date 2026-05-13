import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { commentApi } from '../../api/comment.api'
import { REACTIONS, type ReactionType } from '../post/reaction-picker'
import { useSocialText } from '../../i18n/use-social-text'

type ReactorProfile = {
  authorId: string
  name: string
  avatar: string | null
}

type ReactorMap = Record<ReactionType, ReactorProfile[]>

const REACTION_TYPES = REACTIONS.map((reaction) => reaction.type)

const createEmptyReactorMap = (): ReactorMap => ({
  LIKE: [],
  LOVE: [],
  HAHA: [],
  WOW: [],
  SAD: [],
  ANGRY: []
})

interface StoryReactionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
  targetType?: 'POST' | 'COMMENT'
  initialReactionType?: ReactionType
}

export function StoryReactionsModal({
  open,
  onOpenChange,
  targetId,
  targetType = 'POST',
  initialReactionType = 'LIKE'
}: StoryReactionsModalProps) {
  const { text } = useSocialText()
  const [selectedType, setSelectedType] = useState<ReactionType>(initialReactionType)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reactorsByType, setReactorsByType] = useState<ReactorMap>(createEmptyReactorMap)

  useEffect(() => {
    setSelectedType(initialReactionType)
  }, [initialReactionType])

  useEffect(() => {
    let cancelled = false

    async function loadReactionPeople() {
      if (!open) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const entries = await Promise.all(
          REACTION_TYPES.map(async (reactionType) => {
            const response = await commentApi.searchReactions(targetType, reactionType)
            const postReactions = response.data.data.filter((reaction) => reaction.targetId === targetId)

            const profiles = postReactions.map(
              (reaction) =>
                ({
                  authorId: reaction.authorInfo?.id ?? '',
                  name: reaction.authorInfo?.fullName?.trim() || text.reactionsModal.unknownUser,
                  avatar: reaction.authorInfo?.avatar ?? null
                }) satisfies ReactorProfile
            )

            return [reactionType, profiles] as const
          })
        )

        if (cancelled) {
          return
        }

        const nextState = createEmptyReactorMap()
        for (const [reactionType, profiles] of entries) {
          nextState[reactionType] = profiles
        }

        setReactorsByType(nextState)
      } catch {
        if (cancelled) {
          return
        }

        setError(text.reactionsModal.loadError)
        setReactorsByType(createEmptyReactorMap())
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadReactionPeople()

    return () => {
      cancelled = true
    }
  }, [open, targetId, targetType, text.reactionsModal.loadError, text.reactionsModal.unknownUser])

  const selectedReactionOption = useMemo(
    () => REACTIONS.find((reaction) => reaction.type === selectedType) ?? REACTIONS[0],
    [selectedType]
  )

  const selectedReactors = reactorsByType[selectedType]
  const totalReactors = useMemo(
    () => Object.values(reactorsByType).reduce((sum, reactors) => sum + reactors.length, 0),
    [reactorsByType]
  )
  const visibleReactions = useMemo(
    () => REACTIONS.filter((reaction) => reactorsByType[reaction.type].length > 0),
    [reactorsByType]
  )

  useEffect(() => {
    if (loading || error) {
      return
    }

    if (reactorsByType[selectedType].length > 0) {
      return
    }

    const fallbackType = visibleReactions[0]?.type
    if (fallbackType) {
      setSelectedType(fallbackType)
    }
  }, [selectedType, visibleReactions, reactorsByType, loading, error])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[min(96vw,44rem)] max-h-[85vh] overflow-hidden gap-0 rounded-2xl border border-white/10 bg-black/80 p-0 shadow-2xl backdrop-blur-2xl sm:rounded-3xl' overlayClassName='bg-black/60 backdrop-blur-sm'>
        <DialogHeader className='border-b border-white/10 px-6 py-5'>
          <DialogTitle className='text-lg font-semibold tracking-tight text-white'>
            {text.reactionsModal.title}
          </DialogTitle>
          <DialogDescription className='text-sm text-white/60'>
            {text.reactionsModal.subtitle(totalReactors)}
          </DialogDescription>
        </DialogHeader>

        <div className='border-b border-white/10 bg-white/5 px-5 py-3'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {visibleReactions.map((reaction) => {
              const isActive = selectedType === reaction.type
              const count = reactorsByType[reaction.type].length

              return (
                <button
                  key={reaction.type}
                  type='button'
                  onClick={() => setSelectedType(reaction.type)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                    isActive
                      ? 'bg-white text-black shadow-sm ring-1 ring-white/20'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <reaction.Icon size={20} className='drop-shadow-sm' />
                  <span>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className='max-h-[56vh] overflow-y-auto px-3 py-3 custom-scrollbar sm:px-4'>
          {loading ? (
            <div className='space-y-1.5 p-1'>
              <p className='mb-3 px-2 text-sm text-white/50 animate-pulse'>
                {text.reactionsModal.loading}
              </p>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className='h-[60px] animate-pulse rounded-2xl border border-transparent bg-white/10'
                />
              ))}
            </div>
          ) : error ? (
            <div className='m-2 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-red-500/30 bg-red-950/20 text-sm font-medium text-red-400'>
              {error}
            </div>
          ) : selectedReactors.length > 0 ? (
            <div className='space-y-1'>
              {selectedReactors.map((reactor, i) => (
                <div
                  key={`${selectedType}-${reactor.authorId}`}
                  className='group flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:bg-white/10 hover:shadow-sm'
                  style={{ animationFillMode: 'both', animationDelay: `${i * 30}ms` }}
                >
                  <div className='flex min-w-0 items-center gap-3.5'>
                    <div className='h-10 w-10 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105 rounded-full overflow-hidden'>
                      <UserAvatar
                        name={reactor.name}
                        src={reactor.avatar}
                        className='w-full h-full border border-black/20'
                        fallbackClassName='bg-white/20 text-white text-[13px] font-semibold'
                      />
                    </div>
                    <span className='truncate text-[15px] font-medium text-white transition-colors'>
                      {reactor.name}
                    </span>
                  </div>
                  <div
                    className='transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3'
                    title={selectedReactionOption.type}
                  >
                    <selectedReactionOption.Icon size={32} className='drop-shadow-sm' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='m-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 text-center'>
              <div className='opacity-80'>
                <selectedReactionOption.Icon size={64} />
              </div>
              <p className='mt-3 text-[15px] font-medium text-white/60'>
                {text.reactionsModal.emptyByType}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
