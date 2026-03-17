import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../api/chat.api'
import { chatKeys } from './keys'
import type { ConversationResponse } from '../schemas/chat.schema'

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId: string) => chatApi.markAsRead(chatId),
    onMutate: async (chatId) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() })
      const previousConversations = queryClient.getQueryData<ConversationResponse[]>(chatKeys.conversations())

      if (previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          previousConversations.map((conv: any) => (conv.chatId === chatId ? { ...conv, unreadCount: 0 } : conv))
        )
      }

      return { previousConversations }
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(chatKeys.conversations(), context.previousConversations)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    }
  })
}
