import { useRef, useState } from 'react'
import { Camera, X, Upload, MoveVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useUpdateBackgroundMutation, useUpdateBackgroundPositionMutation } from '../../../queries/use-mutations'
import { toast } from 'sonner'

interface BackgroundEditorProps {
  backgroundUrl?: string
  backgroundY?: number
}

export function BackgroundEditor({ backgroundUrl, backgroundY = 50 }: BackgroundEditorProps) {
  const { text } = useUserText()
  const bgInputRef = useRef<HTMLInputElement>(null)

  const updateBackgroundMutation = useUpdateBackgroundMutation()
  const updateBackgroundPositionMutation = useUpdateBackgroundPositionMutation()

  const [isEditingBg, setIsEditingBg] = useState(false)
  const [bgPreview, setBgPreview] = useState<{ url: string; file: File } | null>(null)
  const [tempBgY, setTempBgY] = useState(backgroundY)
  const [isDraggingBg, setIsDraggingBg] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartBgY, setDragStartBgY] = useState(50)

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(text.profile.selectImageError)
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setBgPreview({ url: reader.result as string, file })
        setIsEditingBg(true)
        setTempBgY(50) // Start at center
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (!isEditingBg) return
    e.preventDefault()
    setIsDraggingBg(true)
    setDragStartY(e.clientY)
    setDragStartBgY(tempBgY)
  }

  const handleBgMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBg) return
    const deltaY = e.clientY - dragStartY
    const containerHeight = 160
    const percentChange = (deltaY / containerHeight) * 100
    const newY = Math.min(Math.max(dragStartBgY - percentChange, 0), 100)
    setTempBgY(newY)
  }

  const handleBgMouseUp = () => {
    setIsDraggingBg(false)
  }

  const handleBgSave = () => {
    if (bgPreview) {
      const formData = new FormData()
      formData.append('file', bgPreview.file)
      formData.append('y', tempBgY.toFixed(2))

      updateBackgroundMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(text.profile.updateBackgroundSuccess)
          setIsEditingBg(false)
          setBgPreview(null)
        },
        onError: () => {
          toast.error(text.profile.selectImageError)
        }
      })
    } else {
      updateBackgroundPositionMutation.mutate(tempBgY, {
        onSuccess: () => {
          toast.success(text.profile.updateBackgroundSuccess)
          setIsEditingBg(false)
        },
        onError: () => {
          toast.error(text.profile.selectImageError)
        }
      })
    }
  }

  const handleBgCancel = () => {
    setIsEditingBg(false)
    setBgPreview(null)
    setTempBgY(backgroundY)
  }

  const handleRepositionBackground = () => {
    if (!backgroundUrl) return
    setIsEditingBg(true)
    setTempBgY(backgroundY)
  }

  const displayImageUrl = isEditingBg ? bgPreview?.url || backgroundUrl : backgroundUrl
  const displayImageY = isEditingBg ? tempBgY : backgroundY

  return (
    <div
      className='relative h-[160px] w-full bg-muted overflow-hidden group'
      onMouseDown={handleBgMouseDown}
      onMouseMove={handleBgMouseMove}
      onMouseUp={handleBgMouseUp}
      onMouseLeave={handleBgMouseUp}
      style={{ cursor: isEditingBg ? (isDraggingBg ? 'grabbing' : 'grab') : 'default' }}
    >
      {displayImageUrl && (
        <img
          src={displayImageUrl}
          alt='Cover'
          className='w-full h-full object-cover select-none'
          style={{
            objectPosition: `center ${displayImageY}%`,
            pointerEvents: 'none'
          }}
        />
      )}
      {!displayImageUrl && (
        <div className='w-full h-full bg-linear-to-r from-primary to-primary-hover flex items-center justify-center'></div>
      )}

      {isEditingBg && (
        <div className='absolute bottom-3 right-3 flex gap-2 z-10'>
          <Button size='sm' variant='outline' className='bg-background/80 backdrop-blur-sm' onClick={handleBgCancel}>
            <X className='w-4 h-4 mr-1' />
            {text.profile.cancel}
          </Button>
          <Button
            size='sm'
            className='bg-primary/90 backdrop-blur-sm'
            onClick={handleBgSave}
            disabled={updateBackgroundMutation.isPending || updateBackgroundPositionMutation.isPending}
          >
            {updateBackgroundMutation.isPending || updateBackgroundPositionMutation.isPending
              ? text.profile.updating
              : text.profile.confirm}
          </Button>
        </div>
      )}

      <input
        type='file'
        ref={bgInputRef}
        className='hidden'
        accept='image/png, image/jpeg, image/jpg, image/webp'
        onChange={handleBackgroundChange}
      />

      {!isEditingBg && (
        <>
          {!backgroundUrl ? (
            <button
              onClick={() => bgInputRef.current?.click()}
              className='absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background shadow-md hover:bg-muted transition-colors cursor-pointer border-none outline-none'
            >
              <Camera className='h-5 w-5 text-foreground' />
              <span className='text-sm font-medium text-foreground'>{text.profile.addPhoto}</span>
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm shadow-md hover:bg-background transition-colors'>
                  <Camera className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-foreground'>{text.profile.editCover}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' sideOffset={8} className='w-48 z-9999 bg-background'>
                <DropdownMenuItem onClick={() => bgInputRef.current?.click()}>
                  <Upload className='mr-2 h-4 w-4' />
                  {text.profile.uploadPhoto}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRepositionBackground}>
                  <MoveVertical className='mr-2 h-4 w-4' />
                  {text.profile.repositionPhoto}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  )
}
