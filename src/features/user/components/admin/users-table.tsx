import { Eye, Ban, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { AdminUserListItem } from '@/features/user/schemas/admin-user.schema'
import type { PageResponse } from '@/shared/api'

type UsersTableProps = {
  data?: PageResponse<AdminUserListItem>
  isLoading: boolean
  onView: (item: AdminUserListItem) => void
  onBan: (item: AdminUserListItem) => void
  onUnban: (item: AdminUserListItem) => void
  onPageChange: (page: number) => void
}

export function UsersTable({ data, isLoading, onView, onBan, onUnban, onPageChange }: UsersTableProps) {
  if (isLoading) return <TableSkeleton />

  if (!data || data.data.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Không tìm thấy người dùng nào</p>
      </div>
    )
  }

  const fmt = (d?: string) =>
    d
      ? new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(d))
      : '—'

  return (
    <div className='space-y-4'>
      <div className='border rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10 font-bold'>#</TableHead>
                <TableHead className='font-bold'>Người dùng</TableHead>
                <TableHead className='font-bold'>Email</TableHead>
                <TableHead className='font-bold'>Số điện thoại</TableHead>
                <TableHead className='font-bold'>Vai trò</TableHead>
                <TableHead className='font-bold'>Trạng thái</TableHead>
                <TableHead className='font-bold'>Ngày tạo</TableHead>
                <TableHead className='font-bold'>Đăng nhập cuối</TableHead>
                <TableHead className='text-right font-bold'>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((item, index) => {
                const u = item.user
                const isActive = u.accountInfo?.enabled !== false
                return (
                  <TableRow key={u.id}>
                    <TableCell className='font-medium text-muted-foreground'>
                      {data.page * data.limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <UserAvatar src={u.avatar} name={u.fullName} className='w-9 h-9' />
                        <div>
                          <div className='font-medium leading-tight'>{u.fullName}</div>
                          <div className='text-xs text-muted-foreground'>{u.id.slice(0, 8)}…</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>{u.accountInfo?.email ?? '—'}</TableCell>
                    <TableCell className='text-sm'>{u.accountInfo?.phoneNumber ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-xs'>{u.accountInfo?.role ?? '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'default' : 'destructive'} className='text-xs'>
                        {isActive ? 'Hoạt động' : 'Đã cấm'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>{fmt(item.audit.createdAt)}</TableCell>
                    <TableCell className='text-sm'>{fmt(item.audit.lastLoginAt)}</TableCell>
                    <TableCell>
                      <div className='flex items-center justify-end gap-1'>
                        <Button variant='ghost' size='sm' onClick={() => onView(item)} title='Xem chi tiết'>
                          <Eye className='w-4 h-4' />
                        </Button>
                        {isActive ? (
                          <Button
                            variant='ghost' size='sm'
                            onClick={() => onBan(item)}
                            className='text-destructive hover:text-destructive'
                            title='Cấm người dùng'
                          >
                            <Ban className='w-4 h-4' />
                          </Button>
                        ) : (
                          <Button
                            variant='ghost' size='sm'
                            onClick={() => onUnban(item)}
                            className='text-green-600 hover:text-green-700'
                            title='Bỏ cấm người dùng'
                          >
                            <ShieldCheck className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>

        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={() => onPageChange(data.page - 1)} disabled={data.page === 0}>
            <ChevronLeft className='w-4 h-4' />
            Trước
          </Button>
          <span className='text-sm'>Trang {data.page + 1} / {data.totalPages}</span>
          <Button variant='outline' size='sm' onClick={() => onPageChange(data.page + 1)} disabled={data.page >= data.totalPages - 1}>
            Sau
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  const cols = 9
  return (
    <div className='border rounded-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              {['#', 'Người dùng', 'Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Đăng nhập', 'Hành động'].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className='h-4 w-5' /></TableCell>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='w-9 h-9 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-28' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </div>
                </TableCell>
                {Array.from({ length: cols - 2 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className='h-4 w-20' /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


