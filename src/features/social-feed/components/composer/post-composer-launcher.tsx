import { useState, useRef } from 'react'
import { Image, Film } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { PostComposer } from './post-composer'
import { ReelComposerModal } from '../reels/reel-composer-modal'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useSocialText } from '../../i18n/use-social-text'

export function PostComposerLauncher() {
  const { text } = useSocialText()
  const currentUserLabel = text.composer.me
  const { data: myProfile } = useMyProfile()
  const profileName = myProfile?.fullName?.trim() || currentUserLabel
  const profileAvatar = myProfile?.avatar || ''
  const lastName = profileName.split(' ').pop() || profileName

  const [open, setOpen] = useState(false)
  const [reelModalOpen, setReelModalOpen] = useState(false)
  const [initialFiles, setInitialFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setInitialFiles(Array.from(e.target.files))
      setOpen(true)
    }
    e.target.value = ''
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='group flex w-full items-center gap-3 rounded-2xl border border-white bg-white/80 backdrop-blur-xl px-4 py-3.5 text-left shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all hover:border-primary/30 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:border-white/5 dark:bg-zinc-950/50 dark:hover:border-primary/30'
      >
        <div className='h-11 w-11 shrink-0'>
          <UserAvatar
            name={profileName}
            src={profileAvatar}
            className='w-full h-full border-2 border-white dark:border-zinc-800 shadow-sm'
            fallbackClassName='bg-primary text-white'
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate rounded-full border border-zinc-200/50 bg-zinc-50/50 px-5 py-2.5 text-[15px] font-medium text-zinc-500 transition-colors group-hover:border-primary/30 group-hover:bg-white dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-400 dark:group-hover:border-primary/30 dark:group-hover:bg-zinc-900'>
            {text.launcher.prompt(lastName)}
          </p>
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className='flex items-center justify-center h-10 w-10 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-emerald-500'
            title={`${text.composer.image}/${text.composer.video}`}
          >
            <Image className='h-[22px] w-[22px]' />
          </button>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setReelModalOpen(true)
            }}
            className='flex items-center justify-center h-10 w-10 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-rose-500'
            title={text.sidebar.reels}
          >
            <Film className='h-[22px] w-[22px]' />
          </button>
        </div>
      </button>

      <input
        type='file'
        accept='image/*,video/*'
        multiple
        className='hidden'
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <PostComposer
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) setInitialFiles([])
        }}
        initialFiles={initialFiles}
        onPostSuccess={() => {
          setOpen(false)
          setInitialFiles([])
        }}
      />
      
      <ReelComposerModal open={reelModalOpen} onOpenChange={setReelModalOpen} />
    </>
  )
}

