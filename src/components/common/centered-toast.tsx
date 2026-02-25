import { Check, X } from 'lucide-react'

interface CenteredToastProps {
  message: string
  type?: 'success' | 'error'
}

export function CenteredToast({ message, type = 'success' }: CenteredToastProps) {
  const Icon = type === 'success' ? Check : X

  return (
    <div className='centered-toast-content'>
      <div className='centered-toast-icon-circle'>
        <Icon className='w-8 h-8 stroke-[3.5px]' />
      </div>
      <p className='centered-toast-text'>{message}</p>
    </div>
  )
}
