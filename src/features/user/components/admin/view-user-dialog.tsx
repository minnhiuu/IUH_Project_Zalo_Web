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
import { useAdminText } from '@/features/user/i18n/use-admin-text'
import { formatDateTimeLong } from '@/utils/date'

type ViewUserDialogProps = {
  item: AdminUserListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewUserDialog({ item, open, onOpenChange }: ViewUserDialogProps) {
  const { data: detailData } = useAdminUserDetail(item?.user.id ?? '')
  const detail = detailData?.data?.data
  const { text } = useAdminText()
  const t = text.userManagement

  if (!item) return null

  const { user, audit } = item
  const isActive = detail?.active ?? audit.active

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-xl! max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>{t.viewDialog.title}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Avatar + basic */}
          <div className='flex items-center gap-5'>
            <UserAvatar src={user.avatar} name={user.fullName} className='w-24 h-24' />
            <div className='flex-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h3 className='text-2xl font-semibold'>{user.fullName}</h3>
                <Badge variant={isActive ? 'default' : 'destructive'} className='text-sm'>
                  {isActive ? t.active : t.banned}
                </Badge>
              </div>
              <Badge variant='outline' className='mt-1 text-sm'>{user.accountInfo?.role ?? '—'}</Badge>
              {user.accountInfo?.isVerified && (
                <Badge variant='secondary' className='mt-1 block w-fit text-sm'>{t.viewDialog.verified}</Badge>
              )}
              {user.bio && <p className='text-base text-muted-foreground mt-2'>{user.bio}</p>}
            </div>
          </div>

          <Separator />

          {/* Contact info */}
          <div>
            <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
              {t.viewDialog.contactInfo}
            </h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
              <InfoItem label={t.viewDialog.email} value={user.accountInfo?.email} />
              <InfoItem label={t.viewDialog.phone} value={user.accountInfo?.phoneNumber} />
              <InfoItem
                label={t.viewDialog.dob}
                value={user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : undefined}
              />
              <InfoItem
                label={t.viewDialog.gender}
                value={user.gender === 'MALE' ? t.viewDialog.male : user.gender === 'FEMALE' ? t.viewDialog.female : undefined}
              />
            </div>
          </div>

          {!isActive && (
            <>
              <Separator />
              <div>
                <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
                  {t.viewDialog.banInfo}
                </h4>
                <div className='p-3 bg-destructive/10 rounded-lg border border-destructive/20'>
                  <p className='text-sm font-medium text-destructive mb-1'>{t.viewDialog.banReason}</p>
                  <p className='text-base'>{detail?.banReason ?? '—'}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Audit */}
          <div>
            <h4 className='text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider'>
              {t.viewDialog.accountHistory}
            </h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
              <InfoItem label={t.viewDialog.createdAt} value={formatDateTimeLong(audit.createdAt)} />
              <InfoItem label={t.viewDialog.updatedAt} value={formatDateTimeLong(audit.lastModifiedAt)} />
              <InfoItem label={t.viewDialog.lastLogin} value={formatDateTimeLong(audit.lastLoginAt)} />
              <InfoItem label={t.viewDialog.userId} value={user.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className='min-w-0'>
      <p className='text-sm font-medium text-muted-foreground mb-1'>{label}</p>
      <p className='text-sm break-all'>{value ?? '—'}</p>
    </div>
  )
}


