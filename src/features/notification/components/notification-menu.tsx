import { MoreHorizontal, Check, Settings, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNotificationText } from '../locales/use-notification-text'
import { useMarkAllAsReadMutation } from '../queries/use-mutations'

export const NotificationMenu = () => {
  const { menu } = useNotificationText()
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full hover:bg-muted'>
          <MoreHorizontal className='h-5 w-5 text-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-72 rounded-xl p-2 shadow-2xl border-none ring-1 ring-black/5'>
        <DropdownMenuItem
          onClick={() => markAllAsRead()}
          className='flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer focus:bg-muted transition-colors'
        >
          <Check className='h-5 w-5' strokeWidth={2.5} />
          <span className='font-semibold text-md'>{menu.markAllAsRead}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className='flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer focus:bg-muted transition-colors'>
          <Settings className='h-5 w-5' strokeWidth={2.5} />
          <span className='font-semibold text-md'>{menu.settings}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className='flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer focus:bg-muted transition-colors'>
          <Monitor className='h-5 w-5' strokeWidth={2.5} />
          <span className='font-semibold text-md'>{menu.open}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
