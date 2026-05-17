import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { commentApi } from '../../api/comment.api'
import { REACTIONS, type ReactionType } from './reaction-picker'
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

interface ReactionPeopleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
  targetType?: 'POST' | 'COMMENT'
  initialReactionType?: ReactionType
}

export function ReactionPeopleModal({
  open,
  onOpenChange,
  targetId,
  targetType = 'POST',
  initialReactionType = 'LIKE'
}: ReactionPeopleModalProps) {
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
      <DialogContent className='w-[min(96vw,44rem)] max-h-[85vh] overflow-hidden gap-0 rounded-2xl border border-zinc-200/60 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 sm:rounded-3xl'>
        <DialogHeader className='border-b border-zinc-200/60 px-6 py-5 dark:border-white/10'>
          <DialogTitle className='text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
            {text.reactionsModal.title}
          </DialogTitle>
          <DialogDescription className='text-sm text-zinc-500 dark:text-zinc-400'>
            {text.reactionsModal.subtitle(totalReactors)}
          </DialogDescription>
        </DialogHeader>

        <div className='border-b border-zinc-200/60 bg-zinc-50/50 px-5 py-3 dark:border-white/10 dark:bg-zinc-900/40'>
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
                      ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-white/10'
                      : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
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
              <p className='mb-3 px-2 text-sm text-zinc-500 animate-pulse dark:text-zinc-400'>
                {text.reactionsModal.loading}
              </p>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className='h-[60px] animate-pulse rounded-2xl border border-transparent bg-zinc-100 dark:bg-white/5'
                />
              ))}
            </div>
          ) : error ? (
            <div className='m-2 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400'>
              {error}
            </div>
          ) : selectedReactors.length > 0 ? (
            <div className='space-y-1'>
              {selectedReactors.map((reactor, i) => (
                <div
                  key={`${selectedType}-${reactor.authorId}`}
                  className='group flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:bg-zinc-50 hover:shadow-sm dark:hover:bg-white/[0.04] dark:hover:border-white/[0.02]'
                  style={{ animationFillMode: 'both', animationDelay: `${i * 30}ms` }}
                >
                  <div className='flex min-w-0 items-center gap-3.5'>
                    <div className='h-10 w-10 ring-1 ring-zinc-200/50 transition-transform duration-200 group-hover:scale-105 dark:ring-white/10'>
                      <UserAvatar
                        name={reactor.name}
                        src={reactor.avatar}
                        className='w-full h-full border border-background'
                        fallbackClassName='bg-primary text-white text-[13px] font-semibold'
                      />
                    </div>
                    <span className='truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-primary/90 dark:group-hover:text-primary'>
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
            <div className='m-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 text-center dark:border-white/5 dark:bg-zinc-900/20'>
              <div className='opacity-80'>
                <selectedReactionOption.Icon size={64} />
              </div>
              <p className='mt-3 text-[15px] font-medium text-zinc-600 dark:text-zinc-300'>
                {text.reactionsModal.emptyByType}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
