import { RefreshCw, Zap, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/path'
import { useElasticsearchText } from '../i18n/use-elasticsearch-text'

interface ControlBarProps {
  activeModule: 'users' | 'messages' | 'groups'
  setActiveModule: (value: 'users' | 'messages' | 'groups') => void
  userId: string
  setUserId: (value: string) => void
  onReindexUser: (id: string) => void
  onReindexAll: () => void
  isReindexingUser: boolean
  isReindexingAll: boolean
  modulesText: Record<string, string>
  isRetryingDeadEvents: boolean
  deadEventsCount: number
}

export const ControlBar = ({
  activeModule,
  setActiveModule,
  userId,
  setUserId,
  onReindexUser,
  onReindexAll,
  isReindexingUser,
  isReindexingAll,
  modulesText,
  isRetryingDeadEvents,
  deadEventsCount
}: ControlBarProps) => {
  const { text } = useElasticsearchText()
  const navigate = useNavigate()
  return (
    <div className='flex flex-col lg:flex-row items-center justify-between gap-6'>
      <Tabs
        value={activeModule}
        onValueChange={(value) => setActiveModule(value as 'users' | 'messages' | 'groups')}
        className='w-full lg:w-auto'
      >
        <TabsList className='bg-muted p-1 h-auto rounded-lg'>
          {(['users', 'messages', 'groups'] as const).map((mod) => (
            <TabsTrigger
              key={mod}
              value={mod}
              className='rounded-md px-6 py-2 h-9 text-[13px] font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-muted-foreground hover:text-foreground'
            >
              {modulesText[mod].replace(' (SẮP TỚI)', '')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end'>
        {activeModule === 'users' && (
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 bg-card px-4 py-1.5 rounded-lg border border-border group focus-within:border-primary/50 transition-all shadow-sm'>
              <RefreshCw
                className={cn(
                  'h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary',
                  isReindexingUser && 'animate-spin'
                )}
              />
              <Input
                className='h-7 w-40 text-[13px] font-medium bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/40 shadow-none p-0'
                placeholder={text.controlBar.inputPlaceholder}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userId) onReindexUser(userId)
                }}
              />
              <div className='h-4 w-px bg-border mx-1' />
              <button
                disabled={!userId || isReindexingUser}
                onClick={() => onReindexUser(userId)}
                className='text-[12px] font-bold uppercase text-primary hover:text-primary-hover disabled:opacity-30 transition-colors tracking-wide'
              >
                {isReindexingUser ? `${text.controlBar.syncUser}...` : 'SYNC'}
              </button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className='h-10 px-4 text-sm bg-primary text-white border-none shadow-sm hover:bg-primary-hover gap-2 rounded-lg transition-all active:scale-95'
                  disabled={isReindexingAll}
                >
                  {isReindexingAll ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Zap className='h-4 w-4 fill-current' />
                  )}
                  {text.controlBar.reindexAll}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='rounded-xl border border-border shadow-2xl p-8 max-w-md'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='text-xl font-bold text-foreground'>
                    {text.controlBar.dialog.reindexAll.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-[14px] text-muted-foreground leading-relaxed mt-2'>
                    {text.controlBar.dialog.reindexAll.description}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='gap-3 mt-8'>
                  <AlertDialogCancel className='rounded-lg border border-border bg-transparent text-foreground font-bold text-[13px] h-10 px-6 hover:bg-muted transition-colors'>
                    {text.controlBar.dialog.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onReindexAll}
                    className='rounded-lg border-none bg-primary text-white font-bold text-[13px] h-10 px-8 hover:bg-primary-hover transition-all'
                  >
                    {text.controlBar.dialog.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant='outline'
              className={cn(
                'h-10 px-4 font-medium text-sm shadow-sm gap-2 transition-all duration-300 rounded-lg border-border hover:bg-muted',
                deadEventsCount > 0
                  ? 'bg-warning-bg/10 text-warning-text border-warning-border hover:bg-warning-bg/20'
                  : 'text-muted-foreground'
              )}
              disabled={isRetryingDeadEvents}
              onClick={() => navigate(PATHS.ADMIN.DEAD_EVENTS)}
            >
              {isRetryingDeadEvents ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className={cn('h-4 w-4', deadEventsCount > 0 && 'animate-spin-slow')} />
              )}
              {text.controlBar.retryDeadEvents}
              {deadEventsCount > 0 && (
                <span className='flex items-center justify-center ml-1 min-w-[20px] h-[20px] px-1.5 bg-warning-text text-white rounded-full text-[10px] font-black'>
                  {deadEventsCount}
                </span>
              )}
            </Button>
          </div>
        )}

        {activeModule === 'messages' && (
          <Button variant='outline' className='h-10 px-4 rounded-lg font-medium text-sm opacity-40 border-border'>
            <Zap className='h-4 w-4 mr-2' />
            {text.controlBar.reindexMessages}
          </Button>
        )}

        {activeModule === 'groups' && (
          <Button variant='outline' className='h-10 px-4 rounded-lg font-medium text-sm opacity-40 border-border'>
            <Zap className='h-4 w-4 mr-2' />
            {text.controlBar.reindexGroups}
          </Button>
        )}
      </div>
    </div>
  )
}
