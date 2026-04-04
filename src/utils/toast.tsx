import { toast } from 'sonner'
import { CenteredToast } from '@/components/common/centered-toast'

export const showSuccessToast = (message: string) => {
  toast.custom(() => <CenteredToast message={message} type='success' />, {
    duration: 2000,
    className: 'sonner-toast-center'
  })
}

export const showErrorToast = (message: string) => {
  toast.custom(() => <CenteredToast message={message} type='error' />, {
    duration: 2000,
    className: 'sonner-toast-center'
  })
}

export const showLoadingToast = (message: string) => {
  return toast.custom(() => <CenteredToast message={message} type='loading' />, {
    duration: Infinity,
    className: 'sonner-toast-center'
  })
}

