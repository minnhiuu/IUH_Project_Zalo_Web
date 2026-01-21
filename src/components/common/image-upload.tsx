import * as React from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field' // Đảm bảo bạn đã cài đặt component này theo docs

interface ImageUploadProps {
  label?: string | React.ReactNode
  description?: string | React.ReactNode
  value?: string | number
  onChange: (base64: string, file?: File) => void
  disabled?: boolean
  width?: string
  height?: string
  errorMessage?: string
  className?: string
}

export const ImageUpload = ({
  label,
  description,
  value,
  onChange,
  disabled,
  width = 'w-full',
  height = 'h-40',
  errorMessage,
  className
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (typeof value === 'string' && value.startsWith('http')) {
      setPreview(value)
    } else if (typeof value === 'string' && value.startsWith('data:image')) {
      setPreview(value)
    } else if (!value) {
      setPreview(null)
    }
  }, [value])

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result, file)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Vui lòng chọn file ảnh hợp lệ')
    }
  }

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Field className={className} data-invalid={!!errorMessage}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <div
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragging(false)
          if (disabled) return
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden bg-background cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          width,
          height,
          errorMessage
            ? 'border-destructive/50 hover:border-destructive'
            : preview
              ? 'border-primary'
              : 'border-input hover:border-primary/50',
          isDragging && 'border-primary bg-primary/5 scale-[1.01]',
          disabled && 'opacity-50 cursor-not-allowed bg-muted'
        )}
      >
        {preview ? (
          <>
            <img
              src={preview}
              className='absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
              alt='Preview'
            />
            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10'>
              <span className='text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm'>
                Nhấn để thay đổi
              </span>
            </div>
            <button
              type='button'
              onClick={onRemove}
              className='absolute top-2 right-2 bg-destructive/90 text-destructive-foreground p-1.5 rounded-full hover:bg-destructive shadow-sm z-20 transition-all hover:scale-110'
              title='Xóa ảnh'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center pointer-events-none p-4 text-center'>
            <div
              className={cn(
                'p-3 rounded-full bg-secondary mb-3 transition-transform group-hover:scale-110',
                isDragging && 'bg-primary/10'
              )}
            >
              <Upload className={cn('h-5 w-5 text-muted-foreground', isDragging && 'text-primary')} />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-sm font-medium text-foreground'>Kéo thả hoặc click để chọn ảnh</span>
              <span className='text-[11px] text-muted-foreground'>JPG, PNG, WEBP (Tối đa 5MB)</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
