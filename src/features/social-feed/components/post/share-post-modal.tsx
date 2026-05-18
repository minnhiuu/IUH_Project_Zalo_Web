import { useState } from 'react'
import { Globe2, Lock, Users, ChevronDown, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSocialText } from '../../i18n/use-social-text'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useCreateSocialPostMutation } from '../../queries/use-mutations'
import { toast } from 'sonner'
import type { SocialPost } from './post-card'
import { MediaSection } from './media-section'

interface SharePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: SocialPost
}

type VisibilityType = 'ALL' | 'FRIEND' | 'ONLY_ME'

export function SharePostModal({ open, onOpenChange, post }: SharePostModalProps) {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()

  const profileName = myProfile?.fullName?.trim() || text.composer.me
  const profileAvatar =
    myProfile?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profileName)}`

  const visibilityOptions = [
    { value: 'ALL' as const, label: text.post.visibility.Public, icon: Globe2 },
    { value: 'FRIEND' as const, label: text.post.visibility.Friends, icon: Users },
    { value: 'ONLY_ME' as const, label: text.post.visibility.Private, icon: Lock }
  ]
  const currentVisibility = visibilityOptions.find((opt) => opt.value === visibility)!
  const VisibilityIcon = currentVisibility.icon

  // If the post is already a share, we share its original post instead.
  const isSharingAShare = post.postType === 'SHARE' && post.sharedPost
  const targetShareId = post.rootPostId || (isSharingAShare ? post.sharedPost?.postId : post.id) || post.id

  const displayAuthorName = isSharingAShare ? post.sharedPost?.authorName : post.authorName
  const displayAuthorAvatar = isSharingAShare ? post.sharedPost?.authorAvatar : post.authorAvatar
  const displayContent = isSharingAShare ? post.sharedPost?.content : post.content
  const displayMedia = isSharingAShare ? post.sharedPost?.media : post.media

  const handleShare = async () => {
    try {
      await createPost({
        postType: 'SHARE',
        sharedPostId: targetShareId,
        visibility,
        caption: caption.trim() || undefined
      })
      toast.success(text.shareModal.shareSuccess)
      setCaption('')
      onOpenChange(false)
    } catch {
      toast.error(text.shareModal.shareFailed)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!z-[10000] max-w-[500px] p-0 overflow-hidden bg-white dark:bg-zinc-950/90 dark:backdrop-blur-xl border-zinc-200 dark:border-white/10'>
        <DialogHeader className='px-6 py-4 border-b border-zinc-100 dark:border-white/5'>
          <DialogTitle className='text-[17px] font-semibold text-center text-zinc-900 dark:text-zinc-100'>
            {text.shareModal.title}
          </DialogTitle>
        </DialogHeader>

        <div className='p-5 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 shrink-0 ring-2 ring-transparent'>
              <UserAvatar
                name={profileName}
                src={profileAvatar}
                className='w-full h-full border border-background'
                fallbackClassName='bg-primary text-white'
              />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-[14.5px] font-semibold text-zinc-900 dark:text-[#ececec]'>{profileName}</p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='mt-0.5 h-7 rounded-lg border border-zinc-200 px-2.5 text-[12.5px] font-medium text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-900'
                  >
                    <VisibilityIcon className='h-3.5 w-3.5 mr-1.5' />
                    {currentVisibility.label}
                    <ChevronDown className='h-3.5 w-3.5 ml-1 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-40 z-60'>
                  {visibilityOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onSelect={() => setVisibility(opt.value)}
                      className='cursor-pointer gap-2'
                    >
                      <opt.icon className='h-4 w-4 text-zinc-500' />
                      <span>{opt.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className='rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 transition-colors focus-within:border-primary/50 focus-within:bg-white dark:border-white/10 dark:bg-zinc-900/70 dark:focus-within:bg-zinc-900'>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={text.shareModal.captionPlaceholder}
              className='min-h-16 resize-none border-none bg-transparent p-0 text-[15.5px] leading-relaxed font-medium text-zinc-900 shadow-none focus-visible:ring-0 dark:text-[#ececec] placeholder:text-zinc-500 dark:placeholder:text-zinc-500'
            />
          </div>

          <div className='rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900/40 opacity-80 pointer-events-none'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-8 w-8'>
                <UserAvatar
                  name={displayAuthorName || text.shareModal.unknownUser}
                  src={displayAuthorAvatar}
                  className='w-full h-full border border-background'
                  fallbackClassName='bg-primary text-white text-xs font-semibold'
                />
              </div>
              <span className='text-[13px] font-semibold text-zinc-800 dark:text-zinc-200'>{displayAuthorName}</span>
            </div>

            {displayContent ? (
              <p className='wrap-break-word text-[14px] leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300 line-clamp-3'>
                {displayContent}
              </p>
            ) : null}

            {displayMedia && displayMedia.length > 0 ? (
              <div className='mt-2 pointer-events-none'>
                <MediaSection
                  media={displayMedia}
                  attachmentAlt={text.post.attachmentAlt(displayAuthorName || 'Unknown user')}
                  onMediaClick={() => {}}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className='p-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20'>
          <Button
            onClick={handleShare}
            disabled={isPending}
            className='w-full h-11 rounded-xl bg-primary font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
          >
            {isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : text.shareModal.shareNow}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
