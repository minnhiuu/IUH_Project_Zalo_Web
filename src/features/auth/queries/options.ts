import { queryOptions, keepPreviousData } from '@tanstack/react-query'
import { authKeys } from './keys'
import { authApi } from '../api/auth.api'
import { QrSessionStatus } from '@/constants/enum'
import { QUERY_POLICIES } from '@/constants/query-policies'

export const authOptions = {
  generateQr: () =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: authKeys.generateQr(),
      queryFn: async () => {
        const response = await authApi.generateQr()
        return response.data.data
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }),

  waitQrStatus: (qrId: string, expectedStatus: QrSessionStatus, enabled: boolean) =>
    queryOptions({
      ...QUERY_POLICIES.REALTIME,
      queryKey: authKeys.waitQrStatus(qrId, expectedStatus),
      queryFn: async () => {
        const response = await authApi.waitQrStatus(qrId, expectedStatus)
        return response.data.data
      },
      enabled,
      retry: false,
      placeholderData: keepPreviousData
    })
}
