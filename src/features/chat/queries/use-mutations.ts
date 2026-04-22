import { useMutation, useQueryClient } from '@tanstack/react-query'
// test
import {
  markAsRead,
  sendMessageApi,
  revokeMessageApi,
  deleteMessageForMeApi,
  deleteGroupMemberMessageApi,
  toggleReactionApi,
  removeAllMyReactionsApi,
  createGroupConversation,
  sendGroupInvitesApi,
  updateGroupNameApi,
  updateGroupAvatarApi,
  updateGroupSettingsApi,
  deleteConversationApi,
  leaveGroupApi,
  addMembersToGroupApi,
  removeMemberFromGroupApi,
  promoteToAdminApi,
  demoteFromAdminApi,
  transferOwnerApi,
  refreshJoinLinkApi,
  generateJoinLinkApi,
  joinByLinkApi,
  pinMessageApi,
  unpinMessageApi,
  blockMemberFromGroupApi,
  unblockMemberFromGroupApi,
  approveJoinRequestApi,
  rejectJoinRequestApi,
  cancelMyJoinRequestApi,
  updateJoinQuestionApi
} from '../api/chat.api'
import { chatKeys } from './keys'
import type { ConversationResponse, ChatMessageRequest, GroupSettings, LeaveGroupRequest } from '../schemas/chat.schema'

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, lastReadMessageId }: { conversationId: string; lastReadMessageId?: string }) =>
      markAsRead(conversationId, lastReadMessageId),
    onMutate: async ({ conversationId }) => {
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
    onError: (error, _vars, context) => {
      console.error('Error marking conversation as read:', error)
      if (context?.previousConversations) {
        queryClient.setQueryData(chatKeys.conversations(), context.previousConversations)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      // Không invalidate unreadAnchor ở đây vì ta đã xử lý ẩn divider bằng local state trong ChatWindow
      // Việc invalidate sẽ làm phát sinh thêm 1 request API dư thừa mỗi lần Read
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

export const useDeleteGroupMemberMessageMutation = () => {
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      deleteGroupMemberMessageApi(conversationId, messageId),
    onError: (error) => {
      console.error('Failed to delete group member message', error)
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
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'my-groups'] })
    },
    onError: (error) => {
      console.error('Failed to create group conversation', error)
    }
  })
}

export const useSendGroupInvitesMutation = () => {
  return useMutation({
    mutationFn: ({ conversationId, userIds }: { conversationId: string; userIds: string[] }) =>
      sendGroupInvitesApi(conversationId, userIds),
    onError: (error) => {
      console.error('Failed to send group invites', error)
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
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'my-groups'] })
    },
    onError: (error) => {
      console.error('Failed to delete conversation', error)
    }
  })
}

export const useLeaveGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      ...request
    }: LeaveGroupRequest & {
      conversationId: string
      navigateDelayMs?: number
    }) => leaveGroupApi(conversationId, request),
    onSuccess: (_, { conversationId, navigateDelayMs, transferTo }) => {
      const delay = Math.max(0, Number(navigateDelayMs ?? 0))

      if (transferTo) {
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
        queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
        queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', conversationId] })
      }

      window.setTimeout(() => {
        queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
          if (!oldData) return []
          return oldData.filter((conv) => conv.id !== conversationId)
        })
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
        // Also invalidate my-groups to update the group list in the Friends tab
        queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'my-groups'] })
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
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
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
    mutationFn: ({
      conversationId,
      targetUserId,
      blockFromGroup
    }: {
      conversationId: string
      targetUserId: string
      blockFromGroup?: boolean
    }) => removeMemberFromGroupApi(conversationId, targetUserId, blockFromGroup),
    onSuccess: (updatedConv, variables) => {
      updateConversationInList(updatedConv)
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'admin-candidates'] })
      queryClient.invalidateQueries({ queryKey: chatKeys.blockedMembers(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'block-candidates'] })
    },
    onError: (error) => {
      console.error('Failed to remove member from group', error)
    }
  })
}

export const usePromoteToAdminMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      promoteToAdminApi(conversationId, targetUserId),
    onSuccess: (updatedConv, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'admin-candidates'] })
    },
    onError: (error) => {
      console.error('Failed to promote member to admin', error)
    }
  })
}

export const useDemoteFromAdminMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      demoteFromAdminApi(conversationId, targetUserId),
    onSuccess: (updatedConv, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'admin-candidates'] })
    },
    onError: (error) => {
      console.error('Failed to demote admin', error)
    }
  })
}

export const useTransferOwnerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      transferOwnerApi(conversationId, targetUserId),
    onSuccess: (updatedConv, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'admin-candidates'] })
    },
    onError: (error) => {
      console.error('Failed to transfer group owner', error)
    }
  })
}

export const useUpdateGroupSettingsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, settings }: { conversationId: string; settings: Partial<GroupSettings> }) =>
      updateGroupSettingsApi(conversationId, settings),
    onSuccess: (updatedConv) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? { ...conv, ...updatedConv } : conv))
      })
    },
    onError: (error) => {
      console.error('Failed to update group settings', error)
    }
  })
}

export const useRefreshJoinLinkMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => refreshJoinLinkApi(conversationId),
    onSuccess: (newToken, conversationId) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((conv) => (conv.id === conversationId ? { ...conv, joinLinkToken: newToken } : conv))
      })
    },
    onError: (error) => {
      console.error('Failed to refresh join link', error)
    }
  })
}

export const useGenerateJoinLinkMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => generateJoinLinkApi(conversationId),
    onSuccess: (token, conversationId) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                joinLinkToken: token,
                settings: conv.settings ? { ...conv.settings, joinByLinkEnabled: true } : conv.settings
              }
            : conv
        )
      })
    },
    onError: (error) => {
      console.error('Failed to generate join link', error)
    }
  })
}

export const useJoinByLinkMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, joinAnswer }: { token: string; joinAnswer?: string }) => joinByLinkApi(token, joinAnswer),
    onSuccess: (newConv, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.joinPreview(variables.token) })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })

      if (!newConv) return
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [newConv]
        const exists = oldData.some((conv) => conv.id === newConv.id)
        return exists ? oldData.map((conv) => (conv.id === newConv.id ? newConv : conv)) : [newConv, ...oldData]
      })
    },
    onError: (error) => {
      console.error('Failed to join group by link', error)
    }
  })
}

export const useUpdateJoinQuestionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, question }: { conversationId: string; question: string }) =>
      updateJoinQuestionApi(conversationId, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      console.error('Failed to update join question', error)
    }
  })
}

export const useBlockMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      blockMemberFromGroupApi(conversationId, targetUserId),
    onSuccess: (updatedConv: ConversationResponse, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.blockedMembers(variables.conversationId) })
    },
    onError: (error) => {
      console.error('Failed to block member', error)
    }
  })
}

export const useUnblockMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      unblockMemberFromGroupApi(conversationId, targetUserId),
    onSuccess: (updatedConv: ConversationResponse, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.blockedMembers(variables.conversationId) })
    },
    onError: (error) => {
      console.error('Failed to unblock member', error)
    }
  })
}

export const useApproveJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, requestId }: { conversationId: string; requestId: string }) =>
      approveJoinRequestApi(conversationId, requestId),
    onSuccess: (updatedConv, variables) => {
      queryClient.setQueryData(chatKeys.conversations(), (oldData: ConversationResponse[] | undefined) => {
        if (!oldData) return [updatedConv]
        return oldData.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv))
      })
      queryClient.invalidateQueries({ queryKey: chatKeys.joinRequests(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'group-members', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: chatKeys.groupAdmins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'admin-candidates'] })
    },
    onError: (error) => {
      console.error('Failed to approve join request', error)
    }
  })
}

export const useRejectJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, requestId }: { conversationId: string; requestId: string }) =>
      rejectJoinRequestApi(conversationId, requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.joinRequests(variables.conversationId) })
    },
    onError: (error) => {
      console.error('Failed to reject join request', error)
    }
  })
}

export const useCancelJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => cancelMyJoinRequestApi(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidate preview queries (can't know the token easily here, so we invalidate all previews)
      queryClient.invalidateQueries({ queryKey: [...chatKeys.all(), 'join-preview'] })
      queryClient.invalidateQueries({ queryKey: chatKeys.joinRequests(conversationId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
    onError: (error) => {
      console.error('Failed to cancel join request', error)
    }
  })
}

export const useToggleReactionMutation = () => {
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => toggleReactionApi(messageId, emoji),
    onError: (error) => {
      console.error('Failed to toggle reaction', error)
    }
  })
}

export const useRemoveAllMyReactionsMutation = () => {
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) => removeAllMyReactionsApi(messageId),
    onError: (error) => {
      console.error('Failed to remove all reactions', error)
    }
  })
}

export const usePinMessageMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      pinMessageApi(conversationId, messageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.pins(conversationId) })
    },
    onError: (error) => {
      console.error('Failed to pin message', error)
    }
  })
}

export const useUnpinMessageMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      unpinMessageApi(conversationId, messageId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.pins(conversationId) })
    },
    onError: (error) => {
      console.error('Failed to unpin message', error)
    }
  })
}
