import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { toast } from 'sonner'
import axios from 'axios'
import i18n from '@/lib/i18n'

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

export class EntityError extends Error {
  status: 422
  payload: EntityErrorPayload

  constructor({ status, payload }: { status: 422; payload: EntityErrorPayload }) {
    super('Entity Error')
    this.status = status
    this.payload = payload
  }
}

export const getErrorMessage = (code: number | string | undefined): string => {
  if (code === undefined || code === null) return i18n.t('error:unknown')
  return i18n.t(`error:${code}`, { defaultValue: i18n.t('error:unknown') })
}

export const handleErrorApi = <T extends FieldValues>({
  error,
  setError,
  duration
}: {
  error: unknown
  setError?: UseFormSetError<T>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((err) => {
      setError(err.field as Path<T>, {
        type: 'server',
        message: err.message
      })
    })
  } else if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const message = getErrorMessage(data?.code)

    toast.error(i18n.t('common:error_toast_title', { defaultValue: 'Thất bại' }), {
      description: message,
      duration: duration ?? 4000
    })
  } else {
    toast.error(i18n.t('error:unknown'), {
      description: i18n.t('error:system_error_contact_admin', {
        defaultValue: 'Đã có lỗi xảy ra, vui lòng liên hệ admin'
      }),
      duration: duration ?? 4000
    })
  }
}
