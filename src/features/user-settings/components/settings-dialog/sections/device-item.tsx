import type { DeviceResponse } from '@/features/user-settings/types/device.types'
import type { createUserTexts } from '@/features/user/i18n/user.texts'
import { cn } from '@/lib/utils'
import { Monitor, Smartphone, MoreVertical, LogOut, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface DeviceItemProps {
  device: DeviceResponse
  onDelete: (id: string) => void
  onLogout?: (sessionId: string) => void
  isDeleting: boolean
  isLoggingOut?: boolean
  text: ReturnType<typeof createUserTexts>
}

export function DeviceItem({ device, onDelete, onLogout, isDeleting, isLoggingOut, text }: DeviceItemProps) {
  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        device.isCurrentDevice
          ? 'bg-primary/5 border-primary shadow-xs'
          : 'bg-card border-border hover:border-primary/50 hover:shadow-xs'
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <div className='shrink-0'>
            {device.deviceType === 'WEB' ? (
              <Monitor className='w-4 h-4 text-primary' />
            ) : (
              <Smartphone className='w-4 h-4 text-primary' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h4 className='text-sm font-medium text-foreground'>{device.deviceName || 'Unknown Device'}</h4>
              {device.isActive && (
                <div className='flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-green-500/10 text-green-600'>
                  <span className='w-1.5 h-1.5 rounded-full bg-green-500' />
                  <span className='text-xs font-medium'>
                    {text.settings.accountPrivacy.deviceManagement.activeStatus}
                  </span>
                </div>
              )}
              {device.isCurrentDevice && (
                <span className='px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded'>
                  {text.settings.accountPrivacy.deviceManagement.currentDevice}
                </span>
              )}
            </div>

            <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1'>
              {device.browser && device.os && (
                <span>
                  {device.browser} • {device.os}
                </span>
              )}
              {device.ipAddress && <span>{device.ipAddress}</span>}
              {device.lastActiveTime && <span>{format(new Date(device.lastActiveTime), 'Pp')}</span>}
            </div>
          </div>
        </div>

        {!device.isCurrentDevice && (
          <>
            {device.isActive ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() => onLogout?.(device.sessionId)}
                  >
                    {isLoggingOut ? (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    ) : (
                      <LogOut className='w-4 h-4 mr-2' />
                    )}
                    {text.settings.accountPrivacy.deviceManagement.logout || 'Log out'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() => onDelete(device.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    {text.settings.accountPrivacy.deviceManagement.deleteButton || 'Remove'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onDelete(device.id)}
                disabled={isDeleting}
                className='text-muted-foreground hover:text-destructive shrink-0 h-8 w-8 p-0'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
