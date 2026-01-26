import { queryOptions } from '@tanstack/react-query'
import { authKeys } from './keys'
import { authApi } from '../api/auth.api'
import { QrSessionStatus } from '@/constants/enum'

export const authOptions = {
  generateQr: () =>
    queryOptions({
      queryKey: authKeys.generateQr(),
      queryFn: async () => {
        const response = await authApi.generateQr()
        return response.data.data
      },
      refetchInterval: 1000 * 60 * 2,
      staleTime: 0
    }),

  checkQrStatus: (qrId: string, enabled: boolean) =>
    queryOptions({
      queryKey: authKeys.checkQrStatus(qrId),
      queryFn: async () => {
        const response = await authApi.checkQrStatus(qrId)
        return response.data.data
      },
      refetchInterval: (query) => {
        const status = query.state.data?.status
        if (status === QrSessionStatus.Confirmed || status === QrSessionStatus.Rejected) {
          return false
        }
        return 2000
      },
      enabled
    })
}
