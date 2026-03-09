import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { UserAvatar } from '@/components/common/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAdminUserDetail } from '@/features/user/queries/admin-queries'
import type { AdminUserListItem } from '@/features/user/schemas/admin-user.schema'

type ViewUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewUserDialog({ item, open, onOpenChange }: ViewUserDialogProps) {
  const { data: detailData } = useAdminUserDetail(item?.user.id ?? '')
  const detail = detailData?.data?.data

  if (!item) return null

  const { user, audit } = item
  const isActive = user.accountInfo?.enabled !== false

  const fmt = (d?: string) =>
    d
      ? new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(d))
      : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Avatar + basic */}
          <div className='flex items-center gap-5'>
            <UserAvatar src={user.avatar} name={user.fullName} className='w-24 h-24' />
            <div className='flex-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h3 className='text-2xl font-semibold'>{user.fullName}</h3>
                <Badge variant={isActive ? 'default' : 'destructive'} className='text-sm'>
                  {isActive ? 'Hoạt động' : 'Đã cấm'}
                </Badge>
              </div>
              <Badge variant='outline' className='mt-1 text-sm'>{user.accountInfo?.role ?? '—'}</Badge>
              {user.accountInfo?.isVerified && (
                <Badge variant='secondary' className='mt-1 block w-fit text-sm'>Đã xác minh</Badge>
              )}
              {user.bio && <p className='text-base text-muted-foreground mt-2'>{user.bio}</p>}
            </div>
          </div>

          <Separator />

          {/* Contact info */}
          <div>
            <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
              Thông tin liên hệ
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <InfoItem label='Email' value={user.accountInfo?.email} />
              <InfoItem label='Số điện thoại' value={user.accountInfo?.phoneNumber} />
              <InfoItem
                label='Ngày sinh'
                value={user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : undefined}
              />
              <InfoItem
                label='Giới tính'
                value={user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : undefined}
              />
            </div>
          </div>

          {!isActive && (
            <>
              <Separator />
              <div>
                <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
                  Thông tin cấm
                </h4>
                <div className='p-3 bg-destructive/10 rounded-lg border border-destructive/20'>
                  <p className='text-sm font-medium text-destructive mb-1'>Lý do cấm</p>
                  <p className='text-base'>{detail?.banReason ?? '—'}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Audit */}
          <div>
            <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
              Lịch sử tài khoản
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <InfoItem label='Ngày tạo' value={fmt(audit.createdAt)} />
              <InfoItem label='Cập nhật lần cuối' value={fmt(audit.lastModifiedAt)} />
              <InfoItem label='Đăng nhập lần cuối' value={fmt(audit.lastLoginAt)} />
              <InfoItem label='ID người dùng' value={user.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className='text-sm font-medium text-muted-foreground mb-1'>{label}</p>
      <p className='text-base'>{value ?? '—'}</p>
    </div>
  )
}


