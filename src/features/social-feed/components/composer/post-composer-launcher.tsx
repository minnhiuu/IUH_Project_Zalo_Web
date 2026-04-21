import { useState } from 'react'
import { PenSquare } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
// Import cleaned
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { PostComposer } from './post-composer'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useSocialText } from '../../i18n/use-social-text'

export function PostComposerLauncher() {
  const { text } = useSocialText()
  const currentUserLabel = text.composer.me
  const { data: myProfile } = useMyProfile()
  const profileName = myProfile?.fullName?.trim() || currentUserLabel
  const profileAvatar = myProfile?.avatar || ''

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='group flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-white/5 dark:bg-zinc-950/50 dark:hover:border-indigo-500/30'
        >
          <div className='h-10 w-10 shrink-0'>
            <UserAvatar
              name={profileName}
              src={profileAvatar}
              className='w-full h-full border border-background'
              fallbackClassName='bg-primary text-white'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-[14.5px] font-medium text-zinc-500 transition-colors group-hover:border-indigo-300 group-hover:text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:border-indigo-500/40 dark:group-hover:text-zinc-200'>
              {text.launcher.prompt}
            </p>
          </div>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 transition-colors group-hover:bg-indigo-500/20'>
            <PenSquare className='h-4.5 w-4.5' />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        className='h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none p-0 top-0 left-0 sm:h-dvh sm:w-screen sm:max-w-none sm:rounded-none'
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>{text.launcher.dialogTitle}</DialogTitle>
          <DialogDescription>{text.launcher.dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className='h-full overflow-y-auto bg-zinc-50 px-3 py-14 sm:px-8 dark:bg-zinc-950'>
          <div className='mx-auto w-full max-w-5xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>{text.launcher.createPost}</h2>
            </div>

            <PostComposer
              inModal
              className='border-zinc-200/80 dark:border-white/10'
              onPostSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
