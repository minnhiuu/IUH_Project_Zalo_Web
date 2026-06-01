import { storage, STORAGE_KEYS } from '@/utils/local-storage'
import { generateUUID } from '@/utils/uuid'

export const getDeviceId = (): string => {
  const deviceId = storage.get<string>(STORAGE_KEYS.DEVICE_ID)
  if (deviceId) return deviceId

  const newId = generateUUID()
  storage.set(STORAGE_KEYS.DEVICE_ID, newId)
  return newId
}
