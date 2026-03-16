import { type AuditLog, AuditAction } from '@/features/user/schemas/audit-log.schema'
import { cn } from '@/lib/utils'
import {
  User,
  Lock,
  Unlock,
  Image,
  UserCircle,
  LogIn,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface AuditTimelineProps {
  logs: AuditLog[]
  className?: string
}

const actionIcons: Record<AuditAction, React.ReactNode> = {
  [AuditAction.USER_CREATED]: <User className='size-4' />,
  [AuditAction.USER_UPDATED]: <Edit className='size-4' />,
  [AuditAction.PROFILE_UPDATED]: <UserCircle className='size-4' />,
  [AuditAction.AVATAR_UPDATED]: <Image className='size-4' />,
  [AuditAction.BACKGROUND_UPDATED]: <Image className='size-4' />,
  [AuditAction.PASSWORD_CHANGED]: <Lock className='size-4' />,
  [AuditAction.EMAIL_VERIFIED]: <CheckCircle className='size-4' />,
  [AuditAction.PHONE_VERIFIED]: <CheckCircle className='size-4' />,
  [AuditAction.ACCOUNT_LOCKED]: <Lock className='size-4' />,
  [AuditAction.ACCOUNT_UNLOCKED]: <Unlock className='size-4' />,
  [AuditAction.LOGIN_SUCCESS]: <LogIn className='size-4' />,
  [AuditAction.LOGIN_FAILED]: <XCircle className='size-4' />,
  [AuditAction.LOGOUT]: <LogOut className='size-4' />
}

const actionColors: Record<AuditAction, string> = {
  [AuditAction.USER_CREATED]: 'text-green-600 bg-green-50 border-green-200',
  [AuditAction.USER_UPDATED]: 'text-blue-600 bg-blue-50 border-blue-200',
  [AuditAction.PROFILE_UPDATED]: 'text-blue-600 bg-blue-50 border-blue-200',
  [AuditAction.AVATAR_UPDATED]: 'text-purple-600 bg-purple-50 border-purple-200',
  [AuditAction.BACKGROUND_UPDATED]: 'text-purple-600 bg-purple-50 border-purple-200',
  [AuditAction.PASSWORD_CHANGED]: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  [AuditAction.EMAIL_VERIFIED]: 'text-green-600 bg-green-50 border-green-200',
  [AuditAction.PHONE_VERIFIED]: 'text-green-600 bg-green-50 border-green-200',
  [AuditAction.ACCOUNT_LOCKED]: 'text-red-600 bg-red-50 border-red-200',
  [AuditAction.ACCOUNT_UNLOCKED]: 'text-green-600 bg-green-50 border-green-200',
  [AuditAction.LOGIN_SUCCESS]: 'text-green-600 bg-green-50 border-green-200',
  [AuditAction.LOGIN_FAILED]: 'text-red-600 bg-red-50 border-red-200',
  [AuditAction.LOGOUT]: 'text-gray-600 bg-gray-50 border-gray-200'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function AuditTimeline({ logs, className }: AuditTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Activity className='size-12 text-muted-foreground/50 mb-4' />
        <p className='text-muted-foreground text-sm'>No activity history yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-[400px] pr-4', className)}>
      <div className='relative space-y-4 pb-4'>
        {/* Timeline line */}
        <div className='absolute left-4 top-2 bottom-2 w-px bg-border' />

        {logs.map((log) => (
          <div key={log.id} className='relative flex gap-4 group'>
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                actionColors[log.action]
              )}
            >
              {actionIcons[log.action]}
            </div>

            {/* Content */}
            <div className='flex-1 space-y-1 pb-4'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none'>{log.description}</p>
                  <p className='text-xs text-muted-foreground'>{formatDate(log.createdAt)}</p>
                </div>
                <Badge variant='outline' className='text-xs'>
                  {log.action.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              </div>

              {/* Metadata */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className='mt-2 rounded-md bg-muted p-2 text-xs space-y-1'>
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <div key={key} className='flex justify-between'>
                      <span className='text-muted-foreground capitalize'>{key}:</span>
                      <span className='font-mono'>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* IP Address & User Agent */}
              {(log.ipAddress || log.userAgent) && (
                <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
                  {log.ipAddress && <p className='font-mono'>IP: {log.ipAddress}</p>}
                  {log.userAgent && <p className='truncate'>Device: {log.userAgent}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
