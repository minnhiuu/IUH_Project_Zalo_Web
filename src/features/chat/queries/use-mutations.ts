import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAsRead, sendMessageApi, revokeMessageApi, deleteMessageForMeApi } from '../api/chat.api'
import { chatKeys } from './keys'
import type { ConversationResponse, ChatMessageRequest } from '../schemas/chat.schema'

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => markAsRead(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() })
      const previousConversations = queryClient.getQueryData<ConversationResponse[]>(chatKeys.conversations())

      if (previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          previousConversations.map((conv: ConversationResponse) =>
            conv.conversationId === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        )
      }

      return { previousConversations }
    },
    onError: (error, _newTodo, context) => {
      console.error('Error marking conversation as read:', error)
      if (context?.previousConversations) {
        queryClient.setQueryData(chatKeys.conversations(), context.previousConversations)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    }
  })
}

export const useSendMessageMutation = () => {
  return useMutation({
    mutationFn: (data: ChatMessageRequest) => sendMessageApi(data),
    onError: (error) => {
      console.error('Failed to send message', error)
    }
  })
}

export const useRevokeMessageMutation = () => {
  return useMutation({
    mutationFn: (messageId: string) => revokeMessageApi(messageId),
    onError: (error) => {
      console.error('Failed to revoke message', error)
    }
  })
}

export const useDeleteMessageForMeMutation = () => {
  return useMutation({
    mutationFn: (messageId: string) => deleteMessageForMeApi(messageId),
    onError: (error) => {
      console.error('Failed to delete message for me', error)
    }
  })
}
