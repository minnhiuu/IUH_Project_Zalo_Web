import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api/user.api'
import { userKeys } from './keys'
import { useAuthContext } from '@/features/auth/context/auth-context'

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient()
    const { updateUser } = useAuthContext()

    return useMutation({
        mutationFn: userApi.updateMyProfile,
        onSuccess: (response) => {
            const updatedUser = response.data.data
            if (updatedUser) {
                updateUser(updatedUser)
            }
            queryClient.invalidateQueries({ queryKey: userKeys.profile() })
        }
    })
}
