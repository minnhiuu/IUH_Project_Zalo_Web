import { Check, X, Loader2, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CenteredToastProps {
  message: string
  type?: 'success' | 'error' | 'loading' | 'warning' | 'none'
}

export function CenteredToast({ message, type = 'success' }: CenteredToastProps) {
  if (type === 'none') {
    return (
      <div className='centered-toast-content centered-toast-content--plain'>
        <p className='centered-toast-text'>{message}</p>
      </div>
    )
  }

  const isLoader = type === 'loading'
  const Icon = type === 'success' ? Check : type === 'error' ? X : type === 'warning' ? CircleAlert : Loader2

  return (
    <div
      className={cn(
        'centered-toast-content',
        type === 'error' && 'centered-toast-content--error',
        type === 'warning' && 'centered-toast-content--warning'
      )}
    >
      <div
        className={cn(
          'centered-toast-icon-circle',
          isLoader && 'border-none',
          (type === 'warning' || type === 'error') && 'border-white'
        )}
      >
        <Icon
          className={cn(
            'w-8 h-8 stroke-[2.5px]',
            isLoader && 'animate-spin opacity-90',
            type === 'warning' && 'w-12 h-12 stroke-[1.5px]',
            (type === 'error' || type === 'warning') && 'text-white'
          )}
        />
      </div>
      <p className='centered-toast-text mt-1'>{message}</p>
    </div>
  )
}
