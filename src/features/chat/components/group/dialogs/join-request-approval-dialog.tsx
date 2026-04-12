import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { cn } from '@/lib/utils'
import { useJoinRequestsQuery } from '../../../queries/use-queries'
import { useApproveJoinRequestMutation, useRejectJoinRequestMutation } from '../../../queries/use-mutations'
import { useChatText } from '../../../i18n/use-chat-text'

interface JoinRequestApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
}

export function JoinRequestApprovalDialog({ open, onOpenChange, conversationId }: JoinRequestApprovalDialogProps) {
  const { t } = useChatText()
  const { data: requests = [], isLoading } = useJoinRequestsQuery(conversationId, open)
  const { mutate: approve, isPending: isApproving } = useApproveJoinRequestMutation()
  const { mutate: reject, isPending: isRejecting } = useRejectJoinRequestMutation()

  const isPending = isApproving || isRejecting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <DialogContent
          showCloseButton={false}
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-100 max-w-[95vw] p-0 gap-0 rounded-md overflow-hidden border border-border shadow-2xl bg-background outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
            <DialogTitle className='text-[15px] font-bold text-foreground'>
              {t('chat.joinRequestDialog.title')}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 rounded-sm hover:bg-muted transition-colors cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar'>
            {isLoading ? (
              <div className='px-4 py-8 text-center text-sm text-muted-foreground'>{t('chat.loading')}</div>
            ) : requests.length === 0 ? (
              <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
                {t('chat.joinRequestDialog.empty')}
              </div>
            ) : (
              <div className='py-0'>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className='px-4 py-4 flex items-start gap-3 border-b border-border/30 last:border-none'
                  >
                    <UserAvatar src={req.avatar} name={req.fullName} className='w-12 h-12 shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-[15px] font-bold text-foreground mb-1 leading-none'>{req.fullName}</p>
                      {req.joinAnswer && (
                        <div className='bg-muted/40 p-2.5 rounded-lg border border-border/40 mb-3'>
                          <p className='text-[13px] text-foreground/80 leading-relaxed font-medium'>
                            {req.joinAnswer}
                          </p>
                        </div>
                      )}
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='secondary'
                          disabled={isPending}
                          onClick={() => reject({ conversationId, requestId: req.id })}
                          className='flex-1 h-9 rounded-md font-bold text-[14px] transition-colors'
                        >
                          {t('chat.joinRequestDialog.reject')}
                        </Button>
                        <Button
                          variant='secondary-blue'
                          disabled={isPending}
                          onClick={() => approve({ conversationId, requestId: req.id })}
                          className='flex-1 h-9 rounded-md font-bold text-[14px] transition-colors'
                        >
                          {t('chat.joinRequestDialog.accept')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
