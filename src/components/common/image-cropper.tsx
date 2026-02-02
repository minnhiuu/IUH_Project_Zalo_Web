import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Minus, Plus } from 'lucide-react'

interface ImageCropperProps {
  image: string
  aspect?: number
  dragToMoveText: string
  onCropComplete: (data: {
    percent: { x: number; y: number; width: number; height: number }
    pixels: { x: number; y: number; width: number; height: number }
    zoom: number
  }) => void
}

export function ImageCropper({ image, aspect = 1, dragToMoveText, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(
    (
      croppedArea: { x: number; y: number; width: number; height: number },
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      onCropComplete({ percent: croppedArea, pixels: croppedAreaPixels, zoom })
    },
    [onCropComplete, zoom]
  )

  return (
    <div className='flex flex-col flex-1 overflow-hidden'>
      <div className='relative flex-1 bg-muted overflow-hidden'>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape={aspect === 1 ? 'round' : 'rect'}
          showGrid={false}
          zoomSpeed={0.5}
          minZoom={1}
          maxZoom={5}
          classes={{
            containerClassName: 'bg-muted',
            cropAreaClassName: 'border-2 border-white'
          }}
        />

        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10'>
          <div className='flex items-center gap-2 bg-black/50 text-white px-4 py-2 rounded-sm backdrop-blur-sm'>
            <div className='w-5 h-5 flex items-center justify-center'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-4 h-4'
              >
                <path d='M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20' />
              </svg>
            </div>
            <span className='text-sm font-medium'>{dragToMoveText}</span>
          </div>
        </div>
      </div>

      <div className='px-10 py-6 bg-background border-t border-border'>
        <div className='flex items-center gap-4 max-w-md mx-auto'>
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className='p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
          >
            <Minus className='w-5 h-5' />
          </button>
          <input
            type='range'
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby='Zoom'
            onChange={(e) => setZoom(Number(e.target.value))}
            className='flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
          />
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className='p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
          >
            <Plus className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  )
}
