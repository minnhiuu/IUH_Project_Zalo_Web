import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
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
  error?: {
    message?: string
  }
  data?: Record<string, string> | { message?: string } | null
  errors?: Array<{
    message?: string
  }>
}

const pickFirstMessage = (...values: Array<unknown>): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

const getValidationFieldErrors = (error: AxiosError<BaseErrorResponse>): Array<{ field: string; message: string }> => {
  const payload = error.response?.data
  const data = payload?.data

  if (!data || Array.isArray(data) || typeof data !== 'object') {
    return []
  }

  if ('message' in data) {
    return []
  }

  return Object.entries(data)
    .filter(([field, message]) => Boolean(field) && typeof message === 'string' && message.trim().length > 0)
    .map(([field, message]) => ({ field, message: message.trim() }))
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
    const backendMessage = pickFirstMessage(
      data?.message,
      data?.error?.message,
      data?.data?.message,
      data?.errors?.[0]?.message,
      error.message
    )

    return backendMessage || i18n.t('common:errorDefault')
  }
  return i18n.t('common:errorDefault')
}

export const handleErrorApi = <T extends FieldValues>({
  error,
  setError
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
    if (setError) {
      const fieldErrors = getValidationFieldErrors(error)
      if (fieldErrors.length > 0) {
        fieldErrors.forEach((err) => {
          setError(err.field as Path<T>, {
            type: 'server',
            message: err.message
          })
        })
        return
      }
    }
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
