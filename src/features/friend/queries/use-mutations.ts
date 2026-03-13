import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { friendApi } from '../api/friend.api'
import { friendKeys } from './keys'
import type { FriendRequestSendRequest } from '../schemas/friend.schema'

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: friendKeys.sendRequest(),
    mutationFn: (request: FriendRequestSendRequest) => friendApi.sendFriendRequest(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })
      queryClient.refetchQueries({ queryKey: friendKeys.status(variables.receiverId) })
      toast.success('Friend request sent')
    },
    onError: () => {
      toast.error('Failed to send friend request')
    }
  })
}

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: friendKeys.acceptRequest(),
    mutationFn: (friendshipId: string) => friendApi.acceptFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.receivedRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })
      toast.success('Friend request accepted')
    },
    onError: () => {
      toast.error('Failed to accept friend request')
    }
  })
}

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: friendKeys.declineRequest(),
    mutationFn: (friendshipId: string) => friendApi.declineFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.receivedRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })
      toast.success('Friend request declined')
    },
    onError: () => {
      toast.error('Failed to decline friend request')
    }
  })
}

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: friendKeys.cancelRequest(),
    mutationFn: ({ friendshipId }: { friendshipId: string; userId?: string }) =>
      friendApi.cancelFriendRequest(friendshipId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })
      if (variables.userId) {
        queryClient.refetchQueries({ queryKey: friendKeys.status(variables.userId) })
      }
      toast.success('Friend request cancelled')
    },
    onError: () => {
      toast.error('Failed to cancel friend request')
    }
  })
}

export const useUnfriend = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: friendKeys.unfriend(),
    mutationFn: (friendId: string) => friendApi.unfriend(friendId),
    onSuccess: (_data, friendId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
      queryClient.invalidateQueries({ queryKey: friendKeys.status(friendId) })
      toast.success('Unfriended successfully')
    },
    onError: () => {
      toast.error('Failed to unfriend')
    }
  })
}
