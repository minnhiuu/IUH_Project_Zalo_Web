import { useState } from 'react'
import { Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAdminUsers } from '@/features/user/queries/admin-queries'
import { UserFilters } from '@/features/user/components/admin/user-filters'
import { UsersTable } from '@/features/user/components/admin/users-table'
import { BanUserDialog } from '@/features/user/components/admin/ban-user-dialog'
import { UnbanUserDialog } from '@/features/user/components/admin/unban-user-dialog'
import { ViewUserDialog } from '@/features/user/components/admin/view-user-dialog'
import type { UserFilterParams, AdminUserListItem } from '@/features/user/schemas/admin-user.schema'

export default function UserManagementPage() {
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 0,
    size: 10,
    status: 'ALL'
  })

  const [selected, setSelected] = useState<AdminUserListItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)

  const { data, isLoading } = useAdminUsers(filters)

  const handleView = (item: AdminUserListItem) => {
    setSelected(item)
    setViewDialogOpen(true)
  }

  const handleBan = (item: AdminUserListItem) => {
    setSelected(item)
    setBanDialogOpen(true)
  }

  const handleUnban = (item: AdminUserListItem) => {
    setSelected(item)
    setUnbanDialogOpen(true)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const pageData = data?.data?.data

  return (
    <div className='container mx-auto py-8 px-4 max-w-7xl'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Users className='w-6 h-6 text-primary' />
          </div>
          <h1 className='text-3xl font-bold'>Quản lý người dùng</h1>
        </div>
        <p className='text-muted-foreground'>Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      {/* Filters */}
      <UserFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats */}
      {pageData && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground mb-1'>Tổng số người dùng</div>
            <div className='text-2xl font-bold'>{pageData.totalItems}</div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground mb-1'>Đang hoạt động</div>
            <div className='text-2xl font-bold text-green-600'>
              {pageData.data.filter((i) => i.user.accountInfo?.enabled !== false).length}
            </div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground mb-1'>Đã cấm</div>
            <div className='text-2xl font-bold text-destructive'>
              {pageData.data.filter((i) => i.user.accountInfo?.enabled === false).length}
            </div>
          </Card>
          <Card className='p-4'>
            <div className='text-sm text-muted-foreground mb-1'>Tổng số trang</div>
            <div className='text-2xl font-bold'>{pageData.totalPages}</div>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card className='p-6'>
        <UsersTable
          data={pageData}
          isLoading={isLoading}
          onView={handleView}
          onBan={handleBan}
          onUnban={handleUnban}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Dialogs */}
      <ViewUserDialog item={selected} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
      <BanUserDialog item={selected} open={banDialogOpen} onOpenChange={setBanDialogOpen} />
      <UnbanUserDialog item={selected} open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen} />
    </div>
  )
}
