import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { useChatText } from '../../../i18n/use-chat-text'

interface JoinRequest {
  id: string
  userId: string
  fullName: string
  avatar: string
}

interface JoinRequestsSectionProps {
  requests: JoinRequest[]
  onAccept: (request: JoinRequest) => void
  onReject: (request: JoinRequest) => void
}

export function JoinRequestsSection({ requests, onAccept, onReject }: JoinRequestsSectionProps) {
  const { text } = useChatText()
  const si = text.sidebarInfo

  if (requests.length === 0) return null

  return (
    <div className='flex flex-col shrink-0'>
      <div className='px-4 py-3'>
        <h4 className='text-[14px] font-bold text-foreground mb-3'>
          {si.pendingJoinRequests.replace('{{count}}', String(requests.length))}
        </h4>
        <div className='space-y-4'>
          {requests.map((req) => (
            <div key={req.id} className='flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <UserAvatar src={req.avatar} name={req.fullName} className='w-12 h-12' />
                <span className='text-[15px] font-bold text-foreground'>{req.fullName}</span>
              </div>
              <div className='flex gap-2 pl-[60px]'>
                <Button
                  variant='secondary'
                  onClick={() => onReject(req)}
                  className='flex-1 h-9 rounded-[4px] font-bold text-[14px] bg-secondary hover:bg-secondary-hover text-secondary-foreground border-none shadow-none'
                >
                  {si.reject}
                </Button>
                <Button
                  variant='default'
                  onClick={() => onAccept(req)}
                  className='flex-1 h-9 rounded-[4px] font-bold text-[14px] bg-[var(--B10)] hover:bg-[var(--button-tertiary-primary-hover)] text-[var(--B70)] border-none shadow-none transition-colors'
                >
                  {si.accept}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='h-2 bg-secondary/40 border-y border-border/20 mt-1' />
    </div>
  )
}
