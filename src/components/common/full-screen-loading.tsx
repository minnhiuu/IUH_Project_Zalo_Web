import { cn } from '@/lib/utils'

interface FullScreenLoadingProps {
  message?: string
  className?: string
}

export function FullScreenLoading({ message = 'Vui lòng chờ trong giây lát...', className }: FullScreenLoadingProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white animate-in fade-in duration-300',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4'>
        <div className='relative w-12 h-12'>
          <div className='absolute inset-0 rounded-full border-[3px] border-black/5'></div>
          <div className='absolute inset-0 rounded-full border-[3px] border-t-primary animate-spin'></div>
        </div>
        <p className='text-[15px] text-foreground/60 font-normal'>{message}</p>
      </div>
    </div>
  )
}
