import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageCropper } from '@/components/common/image-cropper'

interface UpdateImageDialogProps {
  image: string
  type: 'avatar' | 'background'
  title: string
  confirmText: string
  cancelText: string
  dragToMoveText: string
  onConfirm: (data: {
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  }) => void
  onCancel: () => void
}

export function UpdateImageDialog({
  image,
  type,
  title,
  confirmText,
  cancelText,
  dragToMoveText,
  onConfirm,
  onCancel
}: UpdateImageDialogProps) {
  const [cropData, setCropData] = useState<{
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  } | null>(null)

  const handleConfirm = async () => {
    if (!cropData) return
    onConfirm(cropData)
  }

  return (
    <div className='fixed inset-0 z-100 flex flex-col bg-background animate-in fade-in duration-200'>
      <div className='flex items-center justify-between px-4 h-11 border-b border-border bg-background'>
        <div className='flex items-center gap-2'>
          <button
            onClick={onCancel}
            className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
          >
            <ChevronLeft className='w-6 h-6 text-foreground' />
          </button>
          <h2 className='text-base font-bold text-foreground'>{title}</h2>
        </div>
        <button
          onClick={onCancel}
          className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
        >
          <X className='w-6 h-6 text-foreground' />
        </button>
      </div>
      <ImageCropper
        image={image}
        aspect={type === 'avatar' ? 1 : 2.5}
        dragToMoveText={dragToMoveText}
        onCropComplete={setCropData}
      />

      <div className='px-4 py-3 flex justify-end gap-3 bg-background border-t border-border'>
        <Button
          variant='secondary'
          onClick={onCancel}
          className='min-w-[80px] h-10 bg-accent hover:bg-accent/80 text-foreground font-bold rounded-sm'
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          className='min-w-[100px] h-10 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-sm'
        >
          {confirmText}
        </Button>
      </div>
    </div>
  )
}
