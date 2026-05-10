import { toast } from 'sonner'
import { CenteredToast } from '@/components/common/centered-toast'
import { NotificationToast } from '@/components/common/notification-toast'
import type { NotificationGroupResponse } from '@/features/notification/schemas/notification.schema'

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

export const showWarningToast = (message: string, duration: number = 2000) => {
  toast.custom(() => <CenteredToast message={message} type='warning' />, {
    duration,
    className: 'sonner-toast-center'
  })
}

export const showSimpleToast = (message: string, duration: number = 1500) => {
  toast.custom(() => <CenteredToast message={message} type='none' />, {
    duration,
    className: 'sonner-toast-center'
  })
}

export const showNotificationToast = (
  data: NotificationGroupResponse,
  duration: number = 5000,
  onClick?: () => void
) => {
  toast.custom(
    (t) => (
      <div onClick={onClick} className={onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}>
        <NotificationToast t={t} data={data} />
      </div>
    ),
    {
      duration,
      className: 'sonner-toast-bottom-right',
      unstyled: true,
      id: data.id
    }
  )
}
