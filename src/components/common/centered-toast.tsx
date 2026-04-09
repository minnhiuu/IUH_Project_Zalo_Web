import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CenteredToastProps {
  message: string
  type?: 'success' | 'error' | 'loading'
}

export function CenteredToast({ message, type = 'success' }: CenteredToastProps) {
  const isLoader = type === 'loading'
  const Icon = type === 'success' ? Check : type === 'error' ? X : Loader2

  return (
    <div className='centered-toast-content'>
      <div className={cn('centered-toast-icon-circle', isLoader && 'border-none')}>
        <Icon className={cn('w-8 h-8 stroke-[2.5px]', isLoader && 'animate-spin opacity-90')} />
      </div>
      <p className='centered-toast-text mt-1'>{message}</p>
    </div>
  )
}
