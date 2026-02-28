import { z } from 'zod'
import i18n from '@/lib/i18n'
import { NotificationType } from '@/constants'

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

export const NotificationGroupResponseSchema = z.object({
  id: z.string(),
  type: z.enum(NotificationType),
  referenceId: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  actorIds: z.array(z.string()),
  actorCount: z.number(),
  read: z.boolean(),
  lastModifiedAt: z.string()
})

export type NotificationGroupResponse = z.infer<typeof NotificationGroupResponseSchema>

export const NotificationHistoryResponseSchema = z.object({
  newest: z.array(NotificationGroupResponseSchema),
  today: z.array(NotificationGroupResponseSchema),
  previous: z.array(NotificationGroupResponseSchema),
  nextCursor: z.string().nullable()
})

export type NotificationHistoryResponse = z.infer<typeof NotificationHistoryResponseSchema>
