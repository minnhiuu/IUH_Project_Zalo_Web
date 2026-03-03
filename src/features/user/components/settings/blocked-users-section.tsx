import { Ban, MessageSquare, Phone, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { useMyBlockedUsers } from '@/features/user/queries/use-queries'
import { useUnblockUserMutation } from '@/features/user/queries/use-mutations'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import type { BlockedUserDetailResponse } from '@/features/user/schemas/block.schema'

export function BlockedUsersSection() {
  const { data: blockedUsers, isLoading } = useMyBlockedUsers()
  const unblockMutation = useUnblockUserMutation()

  const handleUnblock = (user: BlockedUserDetailResponse) => {
    if (window.confirm(`Bạn có chắc muốn bỏ chặn ${user.fullName}?`)) {
      unblockMutation.mutate(user.blockedUserId, {
        onSuccess: () => {
          toast.success(`Đã bỏ chặn ${user.fullName}`)
        },
        onError: () => {
          toast.error('Không thể bỏ chặn người dùng này')
        }
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getBlockTypeIcons = (preference: BlockedUserDetailResponse['preference']) => {
    const icons = []
    if (preference.message) {
      icons.push({ icon: MessageSquare, label: 'Tin nhắn' })
    }
    if (preference.call) {
      icons.push({ icon: Phone, label: 'Cuộc gọi' })
    }
    if (preference.story) {
      icons.push({ icon: Camera, label: 'Nhật ký' })
    }
    return icons
  }

  return (
    <div>
      {isLoading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center gap-4 p-4 border border-border rounded-lg'>
              <Skeleton className='w-12 h-12 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-48' />
              </div>
              <Skeleton className='h-9 w-24' />
            </div>
          ))}
        </div>
      ) : blockedUsers && blockedUsers.length > 0 ? (
        <div className='space-y-3'>
            {blockedUsers.map((user) => {
              const blockTypeIcons = getBlockTypeIcons(user.preference)
              return (
                <div
                  key={user.id}
                  className='flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors'
                >
                  <UserAvatar
                    src={user.avatar}
                    name={user.fullName}
                    className='w-12 h-12'
                    fallbackClassName='bg-muted text-foreground'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-foreground truncate'>{user.fullName}</h3>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                      <span>Đã chặn: {formatDate(user.blockedAt)}</span>
                      {blockTypeIcons.length > 0 && (
                        <>
                          <span className='text-muted-foreground/50'>•</span>
                          <div className='flex items-center gap-2'>
                            {blockTypeIcons.map(({ icon: Icon, label }, idx) => (
                              <div key={idx} title={label}>
                                <Icon className='w-4 h-4 text-muted-foreground' />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleUnblock(user)}
                    disabled={unblockMutation.isPending}
                  >
                    {unblockMutation.isPending ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Đang bỏ chặn...
                      </>
                    ) : (
                      'Bỏ chặn'
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='text-center py-12'>
            <Ban className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Bạn chưa chặn ai</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Khi bạn chặn người dùng, họ sẽ xuất hiện ở đây
            </p>
          </div>
        )}
    </div>
  )
}
