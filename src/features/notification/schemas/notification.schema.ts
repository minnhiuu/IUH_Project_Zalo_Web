import { z } from 'zod'
import i18n from '@/lib/i18n'

export const CreateFriendRequestNotificationRequestSchema = z.object({
  receiverId: z.string().min(1, i18n.t('notification:notification.validation.receiverIdRequired')),
  senderId: z.string().min(1, i18n.t('notification:notification.validation.senderIdRequired')),
  senderName: z.string().min(1, i18n.t('notification:notification.validation.senderNameRequired')),
  senderAvatar: z.string().optional(),
  requestId: z.string().min(1, i18n.t('notification:notification.validation.requestIdRequired'))
})

export type CreateFriendRequestNotificationRequest = z.infer<typeof CreateFriendRequestNotificationRequestSchema>

export const NotificationAcceptedResponseSchema = z.object({
  id: z.string(),
  status: z.string()
})

export type NotificationAcceptedResponse = z.infer<typeof NotificationAcceptedResponseSchema>
