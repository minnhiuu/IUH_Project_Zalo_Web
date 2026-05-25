import { CopyPlus, ArrowLeft } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { BaseDialog } from '@/components/common/base-dialog'
import { MediaPreview, type SelectedMedia } from './post-composer'

export function EditMediaDialog({
  open,
  onOpenChange,
  selectedMedia,
  onRemoveMedia,
  onAddMedia
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMedia: SelectedMedia[]
  onRemoveMedia: (index: number) => void
  onAddMedia: (files: FileList | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAddMedia(event.target.files)
    event.target.value = ''
  }

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Photos/Videos'
      className='w-[95vw] max-w-[95vw] sm:max-w-[1100px] h-[85vh] flex flex-col [&>div:nth-child(2)]:flex-1 [&>div:nth-child(2)]:overflow-hidden [&>div:nth-child(2)]:flex [&>div:nth-child(2)]:flex-col'
      noContentPadding
      headerLeft={
        <button
          onClick={() => onOpenChange(false)}
          className='flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors mr-2'
        >
          <ArrowLeft className='h-4 w-4 text-zinc-600 dark:text-zinc-300' />
        </button>
      }
    >
      <div className='flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-[#18191a]'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {selectedMedia.map((item, index) => (
            <div
              key={`${item.url || item.file?.name}-${index}`}
              className='relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#242526] shadow-sm'
            >
              <MediaPreview
                item={item}
                onRemove={() => onRemoveMedia(index)}
                className='w-full h-full rounded-none border-none'
              />
            </div>
          ))}
        </div>
      </div>
      <div className='p-4 border-t border-zinc-200 dark:border-white/10 flex justify-end gap-3 items-center bg-white dark:bg-[#242526] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileSelect}
          className='hidden'
          multiple
          accept='image/*,video/*'
        />
        <Button variant='ghost' className='text-primary hover:bg-primary/10 font-semibold px-4' onClick={() => fileInputRef.current?.click()}>
          <CopyPlus className='w-[18px] h-[18px] mr-2' />
          Add photos/videos
        </Button>
        <Button
          onClick={() => onOpenChange(false)}
          className='px-8 h-10 font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white'
        >
          Done
        </Button>
      </div>
    </BaseDialog>
  )
}
