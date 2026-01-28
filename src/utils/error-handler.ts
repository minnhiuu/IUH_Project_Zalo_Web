import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import i18n from '@/lib/i18n'

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

type BaseErrorResponse = {
  code?: string | number
  message?: string
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

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BaseErrorResponse | undefined
    return data?.message || 'Đã có lỗi xảy ra'
  }
  return 'Đã có lỗi xảy ra'
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
    const message = getErrorMessage(error)

    toast.error(i18n.t('common:error_toast_title', { defaultValue: 'Thất bại' }), {
      description: message,
      duration: duration ?? 4000
    })
  } else {
    toast.error(i18n.t('common:error_toast_title', { defaultValue: 'Thất bại' }), {
      description: 'Đã có lỗi xảy ra, vui lòng liên hệ admin',
      duration: duration ?? 4000
    })
  }
}

export const getErrorCode = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    const code = (error.response?.data as BaseErrorResponse)?.code
    return code?.toString()
  }
  return undefined
}

export const isAxiosError = (error: unknown): error is AxiosError<BaseErrorResponse> => {
  return axios.isAxiosError(error)
}
