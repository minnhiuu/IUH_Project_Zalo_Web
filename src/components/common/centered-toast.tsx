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
        <Icon className='w-7 h-7 stroke-[2.5px]' />
      </div>
      <p className='centered-toast-text'>{message}</p>
    </div>
  )
}
