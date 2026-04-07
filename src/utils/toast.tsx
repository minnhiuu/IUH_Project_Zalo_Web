import { toast } from 'sonner'
import { CenteredToast } from '@/components/common/centered-toast'

export const showSuccessToast = (message: string, duration: number = 2000) => {
  toast.custom(() => <CenteredToast message={message} type='success' />, {
    duration,
    className: 'sonner-toast-center'
  })
}

export const showErrorToast = (message: string, duration: number = 2000) => {
  toast.custom(() => <CenteredToast message={message} type='error' />, {
    duration,
    className: 'sonner-toast-center'
  })
}

export const showLoadingToast = (message: string) => {
  return toast.custom(() => <CenteredToast message={message} type='loading' />, {
    duration: Infinity,
    className: 'sonner-toast-center'
  })
}
