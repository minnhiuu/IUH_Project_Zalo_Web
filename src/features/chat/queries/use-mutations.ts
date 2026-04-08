import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markAsRead,
  sendMessageApi,
  revokeMessageApi,
  deleteMessageForMeApi,
  createGroupConversation,
  updateGroupNameApi,
  updateGroupAvatarApi,
  deleteConversationApi,
  leaveGroupApi,
  addMembersToGroupApi,
  removeMemberFromGroupApi
} from '../api/chat.api'
import { chatKeys } from './keys'
import type { ConversationResponse, ChatMessageRequest } from '../schemas/chat.schema'

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => markAsRead(conversationId),
    onMutate: async (conversationId) => {
      // Vì hook này k nhận context user, ta lấy từ query cache or pass từ ngoài
      // Tuy nhiên ta có thể update lastReadMessageId dựa trên lastMessage.id của conv đó
      await queryClient.cancelQueries({ queryKey: chatKeys.conversations() })
      const previousConversations = queryClient.getQueryData<ConversationResponse[]>(chatKeys.conversations())

      if (previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations(),
          previousConversations.map((conv: ConversationResponse) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0,
                // Cập nhật optimistic lastReadMessageId cho tất cả members (hoặc ít nhất là chính mình)
                // Phía FE detect unread dựa trên lastReadMessageId của chính mình
                members: conv.members?.map((m) => ({
                  ...m,
                  lastReadMessageId: conv.lastMessage?.id || m.lastReadMessageId
                }))
              }
            }
            return conv
          })
        )
      }

      return { previousConversations }
    },
    onError: (error, _conversationId, context) => {
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

export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroupConversation,
    onSuccess: (newConversation) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [newConversation]
        return [newConversation, ...oldData]
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      console.error('Failed to create group conversation', error)
    }
  })
}

export const useUpdateGroupNameMutation = () => {
  const queryClient = useQueryClient()

  const updateConversationInList = (updatedConv: ConversationResponse) => {
    queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
      if (!oldData) return [updatedConv]
      const newData = oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      if (!newData.some((c) => c.id === updatedConv.id)) newData.unshift(updatedConv)
      return newData.sort(
        (a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
      )
    })
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
  }

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateGroupNameApi(id, name),
    onSuccess: (updatedConv) => {
      updateConversationInList(updatedConv)
    },
    onError: (error) => {
      console.error('Failed to update group name', error)
    }
  })
}

export const useUpdateGroupAvatarMutation = () => {
  const queryClient = useQueryClient()

  const updateConversationInList = (updatedConv: ConversationResponse) => {
    queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
      if (!oldData) return [updatedConv]
      const newData = oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      if (!newData.some((c) => c.id === updatedConv.id)) newData.unshift(updatedConv)
      return newData.sort(
        (a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
      )
    })
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
  }

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => updateGroupAvatarApi(id, file),
    onSuccess: (updatedConv) => {
      updateConversationInList(updatedConv)
    },
    onError: (error) => {
      console.error('Failed to update group avatar', error)
    }
  })
}

export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversationApi(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return []
        return oldData.filter((conv) => conv.id !== conversationId)
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      console.error('Failed to delete conversation', error)
    }
  })
}

export const useLeaveGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, silent }: { conversationId: string; silent?: boolean; navigateDelayMs?: number }) =>
      leaveGroupApi(conversationId, Boolean(silent)),
    onSuccess: (_, { conversationId, navigateDelayMs }) => {
      const delay = Math.max(0, Number(navigateDelayMs ?? 0))

      window.setTimeout(() => {
        queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
          if (!oldData) return []
          return oldData.filter((conv) => conv.id !== conversationId)
        })
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
        queryClient.removeQueries({ queryKey: chatKeys.messages(conversationId) })
      }, delay)
    },
    onError: (error) => {
      console.error('Failed to leave group', error)
    }
  })
}

export const useAddMembersMutation = () => {
  const queryClient = useQueryClient()

  const updateConversationInList = (updatedConv: ConversationResponse) => {
    queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
      if (!oldData) return [updatedConv]
      const newData = oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      if (!newData.some((c) => c.id === updatedConv.id)) newData.unshift(updatedConv)
      return newData.sort(
        (a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
      )
    })
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
  }

  return useMutation({
    mutationFn: ({ conversationId, memberIds }: { conversationId: string; memberIds: string[] }) =>
      addMembersToGroupApi(conversationId, memberIds),
    onSuccess: (updatedConv, variables) => {
      updateConversationInList(updatedConv)
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.friendsDirectory(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'search-members'] })
    },
    onError: (error) => {
      console.error('Failed to add members to group', error)
    }
  })
}

export const useRemoveMemberFromGroupMutation = () => {
  const queryClient = useQueryClient()

  const updateConversationInList = (updatedConv: ConversationResponse) => {
    queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
      if (!oldData) return [updatedConv]
      const newData = oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      if (!newData.some((c) => c.id === updatedConv.id)) newData.unshift(updatedConv)
      return newData.sort(
        (a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
      )
    })
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
  }

  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      removeMemberFromGroupApi(conversationId, targetUserId),
    onSuccess: (updatedConv, variables) => {
      updateConversationInList(updatedConv)
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
    },
    onError: (error) => {
      console.error('Failed to remove member from group', error)
    }
  })
}
