import { useMutation, useQueryClient } from '@tanstack/react-query'
import { friendApi } from '../api/friend.api'
import { friendKeys } from './keys'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useFriendText } from '../i18n/use-friend-text'
import type { FriendRequestSendRequest } from '../schemas/friend.schema'

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient()
  const { toast } = useFriendText()

  return useMutation({
    mutationKey: friendKeys.sendRequest(),
    mutationFn: (request: FriendRequestSendRequest) => friendApi.sendFriendRequest(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })
      queryClient.refetchQueries({ queryKey: friendKeys.status(variables.receiverId) })
      showSuccessToast(toast.sendSuccess)
    },
    onError: () => {
      showErrorToast(toast.sendError)
    }
  })
}

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient()
  const { toast } = useFriendText()

  return useMutation({
    mutationKey: friendKeys.acceptRequest(),
    mutationFn: (args: { requestId: string; requesterId?: string }) => friendApi.acceptFriendRequest(args.requestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })

      if (variables.requesterId) {
        queryClient.invalidateQueries({ queryKey: friendKeys.status(variables.requesterId) })
      }

      showSuccessToast(toast.acceptSuccess)
    },
    onError: () => {
      showErrorToast(toast.acceptError)
    }
  })
}

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient()
  const { toast } = useFriendText()

  return useMutation({
    mutationKey: friendKeys.declineRequest(),
    mutationFn: (args: { requestId: string; requesterId?: string }) => friendApi.declineFriendRequest(args.requestId),
    onSuccess: (_data, variables) => {
      // Centralized invalidation
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })

      if (variables.requesterId) {
        queryClient.invalidateQueries({ queryKey: friendKeys.status(variables.requesterId) })
      }

      showSuccessToast(toast.declineSuccess)
    },
    onError: () => {
      showErrorToast(toast.declineError)
    }
  })
}

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient()
  const { toast } = useFriendText()

  return useMutation({
    mutationKey: friendKeys.cancelRequest(),
    mutationFn: (friendshipId: string) => friendApi.cancelFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all() })
      showSuccessToast(toast.cancelSuccess)
    },
    onError: () => {
      showErrorToast(toast.cancelError)
    }
  })
}

export const useUnfriend = () => {
  const queryClient = useQueryClient()
  const { toast } = useFriendText()

  return useMutation({
    mutationKey: friendKeys.unfriend(),
    mutationFn: (friendId: string) => friendApi.unfriend(friendId),
    onSuccess: (_data, friendId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
      queryClient.invalidateQueries({ queryKey: friendKeys.status(friendId) })
      showSuccessToast(toast.unfriendSuccess)
    },
    onError: () => {
      showErrorToast(toast.unfriendError)
    }
  })
}
