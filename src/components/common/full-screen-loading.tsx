import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface FullScreenLoadingProps {
  message?: string
  className?: string
}

export function FullScreenLoading({ message, className }: FullScreenLoadingProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background animate-in fade-in duration-500',
        className
      )}
    >
      <div className='flex flex-col items-center gap-12'>
        <h1 className='text-5xl font-bold tracking-tighter text-vibrant-blue animate-pulse'>Bondhub</h1>

        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-vibrant-blue opacity-80' />

          {message && (
            <p className='text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300'>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
