import { useQuery } from '@tanstack/react-query'
import { authOptions } from './options'

export const useGenerateQrQuery = () => {
  return useQuery(authOptions.generateQr())
}

export const useCheckQrStatusQuery = (qrId: string, enabled: boolean) => {
  return useQuery(authOptions.checkQrStatus(qrId, enabled))
}
