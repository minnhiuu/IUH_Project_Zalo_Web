import { useQuery } from '@tanstack/react-query'
import { authOptions } from './options'
import { QrSessionStatus } from '@/constants/enum'

export const useGenerateQrQuery = () => {
  return useQuery(authOptions.generateQr())
}

export const useWaitQrStatusQuery = (qrId: string, expectedStatus: QrSessionStatus, enabled: boolean) => {
  return useQuery(authOptions.waitQrStatus(qrId, expectedStatus, enabled))
}
