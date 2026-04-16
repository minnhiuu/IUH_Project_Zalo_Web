import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminUsers } from '@/features/user/queries/admin-queries'
import { UserFilters } from '@/features/user/components/admin/user-filters'
import { UsersTable } from '@/features/user/components/admin/users-table'
import { BanUserDialog } from '@/features/user/components/admin/ban-user-dialog'
import { UnbanUserDialog } from '@/features/user/components/admin/unban-user-dialog'
import { ViewUserDialog } from '@/features/user/components/admin/view-user-dialog'
import type { UserFilterParams, AdminUserListItem } from '@/features/user/schemas/admin-user.schema'
import { useAdminText } from '@/features/user/i18n/use-admin-text'

export default function UserManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState<AdminUserListItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)
  const { text } = useAdminText()
  const t = text.userManagement

  const activeTab = (searchParams.get('status') as 'ACTIVE' | 'BANNED') ?? 'ACTIVE'
  const currentPage = Number(searchParams.get('page') ?? '0')

  const filters: UserFilterParams = {
    name: searchParams.get('name') ?? undefined,
    phone: searchParams.get('phone') ?? undefined,
    email: searchParams.get('email') ?? undefined,
    status: activeTab,
    page: currentPage,
    size: 10
  }

  const { data, isLoading } = useAdminUsers(filters)

  const baseCountFilters = { name: filters.name, phone: filters.phone, email: filters.email, page: 0, size: 1 }
  const { data: activeCountData } = useAdminUsers({ ...baseCountFilters, status: 'ACTIVE' as const })
  const { data: bannedCountData } = useAdminUsers({ ...baseCountFilters, status: 'BANNED' as const })
  const activeCount = activeCountData?.data?.data?.totalItems as number | undefined
  const bannedCount = bannedCountData?.data?.data?.totalItems as number | undefined

  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v)
        else next.delete(k)
      })
      return next
    })
  }

  const handleTabChange = (tab: string) => {
    updateParams({ status: tab, page: undefined })
  }

  const handleFiltersChange = (f: UserFilterParams) => {
    updateParams({
      name: f.name,
      phone: f.phone,
      email: f.email,
      page: undefined
    })
  }

  const handlePageChange = (page: number) => {
    updateParams({ page: page === 0 ? undefined : String(page) })
  }

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

  const pageData = data?.data?.data

  return (
    <div className='container'>
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Users className='w-6 h-6 text-primary' />
          </div>
          <h1 className='text-3xl font-bold'>{t.title}</h1>
        </div>
        <p className='text-muted-foreground'>{t.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className='mb-6'>
        <TabsList className='justify-start'>
          <TabsTrigger
            value='ACTIVE'
            className='flex-1 sm:flex-none data-[state=active]:bg-green-500 data-[state=active]:text-white'
          >
            {t.tabs.active}
            {activeCount !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === 'ACTIVE' ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}`}
              >
                {activeCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='BANNED'
            className='flex-1 sm:flex-none data-[state=active]:bg-red-500 data-[state=active]:text-white'
          >
            {t.tabs.banned}
            {bannedCount !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === 'BANNED' ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'}`}
              >
                {bannedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <UserFilters filters={filters} onFiltersChange={handleFiltersChange} />

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

      <ViewUserDialog item={selected} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
      <BanUserDialog item={selected} open={banDialogOpen} onOpenChange={setBanDialogOpen} />
      <UnbanUserDialog item={selected} open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen} />
    </div>
  )
}
