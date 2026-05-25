import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { interactionApi } from '../../api/interaction.api'
import { useSocialText } from '../../i18n/use-social-text'
import { Eye } from 'lucide-react'

interface ViewerProfile {
  authorId: string
  name: string
  avatar: string | null
  viewedAt: string
}

interface StoryViewersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
}

export function StoryViewersModal({ open, onOpenChange, targetId }: StoryViewersModalProps) {
  const { text } = useSocialText()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewers, setViewers] = useState<ViewerProfile[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadViewers() {
      if (!open) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await interactionApi.getViewers(targetId, 0, 100)
        
        if (cancelled) {
          return
        }

        const profiles = response.data.data.data.map(
          (viewer) =>
            ({
              authorId: viewer.authorInfo?.id ?? '',
              name: viewer.authorInfo?.fullName?.trim() || text.reactionsModal.unknownUser,
              avatar: viewer.authorInfo?.avatar ?? null,
              viewedAt: viewer.viewedAt
            }) satisfies ViewerProfile
        )

        setViewers(profiles)
      } catch {
        if (cancelled) {
          return
        }

        setError(text.reactionsModal.loadError)
        setViewers([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadViewers()

    return () => {
      cancelled = true
    }
  }, [open, targetId, text.reactionsModal.loadError, text.reactionsModal.unknownUser])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[min(96vw,440px)] max-h-[85vh] overflow-hidden gap-0 rounded-2xl border border-border bg-background p-0 shadow-2xl sm:rounded-3xl' overlayClassName='bg-black/40 backdrop-blur-sm'>
        <DialogHeader className='border-b border-border px-6 py-5'>
          <DialogTitle className='text-lg font-bold tracking-tight text-foreground flex items-center gap-2'>
            <Eye className='w-5 h-5 text-primary' />
            {text.storyViewer.details}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {viewers.length} {viewers.length === 1 ? 'person' : 'people'} viewed your story
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[65vh] overflow-y-auto px-2 py-3 custom-scrollbar sm:px-4'>
          {loading ? (
            <div className='space-y-1.5 p-1'>
              <p className='mb-3 px-2 text-sm text-muted-foreground animate-pulse'>
                {text.reactionsModal.loading}
              </p>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className='h-[60px] animate-pulse rounded-xl bg-secondary/50'
                />
              ))}
            </div>
          ) : error ? (
            <div className='m-2 flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 text-sm font-medium text-destructive'>
              {error}
            </div>
          ) : viewers.length > 0 ? (
            <div className='space-y-1'>
              {viewers.map((viewer, i) => (
                <div
                  key={`${viewer.authorId}-${i}`}
                  className='group flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-secondary/60'
                  style={{ animationFillMode: 'both', animationDelay: `${i * 30}ms` }}
                >
                  <div className='flex min-w-0 items-center gap-3.5'>
                    <div className='h-10 w-10 ring-1 ring-border transition-transform duration-200 group-hover:scale-105 rounded-full overflow-hidden'>
                      <UserAvatar
                        name={viewer.name}
                        src={viewer.avatar}
                        className='w-full h-full'
                        fallbackClassName='bg-primary text-white text-[13px] font-semibold'
                      />
                    </div>
                    <span className='truncate text-[15px] font-bold text-foreground'>
                      {viewer.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='m-4 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 text-center'>
              <div className='opacity-40'>
                <Eye size={48} className='text-foreground' />
              </div>
              <p className='mt-3 text-[15px] font-medium text-muted-foreground'>
                No one has viewed your story yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
