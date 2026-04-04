import { useState } from 'react'
import { ImageCropper } from './image-cropper'
import { BaseDialog } from './base-dialog'

interface ImageCropperDialogProps {
  image: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  confirmText: string
  cancelText: string
  dragToMoveText: string
  onConfirm: (data: {
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  }) => void
  isPending?: boolean
}

export function ImageCropperDialog({
  image,
  open,
  onOpenChange,
  title,
  confirmText,
  cancelText,
  dragToMoveText,
  onConfirm,
  isPending
}: ImageCropperDialogProps) {
  const [cropData, setCropData] = useState<{
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  } | null>(null)

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={() => cropData && onConfirm(cropData)}
      isPending={isPending}
      className='w-[480px]'
      noContentPadding
    >
      <div className='h-[480px] flex flex-col bg-muted relative'>
        <ImageCropper
          image={image}
          aspect={1}
          dragToMoveText={dragToMoveText}
          onCropComplete={setCropData}
        />
      </div>
    </BaseDialog>
  )
}
