import { useState, useMemo } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ContactSidebar,
  ContactsFilter,
  FriendList,
  FriendRequestList,
  GroupList,
  GroupInviteList,
  useReceivedFriendRequests,
  useMyFriends,
  AddFriendSearchDialog,
  type ContactTab
} from '@/features/friend'

type FilterType = 'all' | 'friends' | 'requests' | 'blocked'
type SortType = 'name' | 'recent' | 'online'

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<ContactTab>('friends')
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('name')
  
  const { data: receivedRequests } = useReceivedFriendRequests()
  const { data: myFriends } = useMyFriends()

  // Calculate total contacts for display
  const totalContacts = useMemo(() => {
    let count = 0
    if (filterType === 'all' || filterType === 'friends') {
      count += myFriends?.length ?? 0
    }
    if (filterType === 'all' || filterType === 'requests') {
      count += receivedRequests?.length ?? 0
    }
    return count
  }, [filterType, myFriends, receivedRequests])

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return <FriendList searchQuery={globalSearchQuery} />
      case 'groups':
        return <GroupList />
      case 'friend-requests':
        return <FriendRequestList />
      case 'group-invites':
        return <GroupInviteList />
      default:
        return <FriendList />
    }
  }

  return (
    <div className='flex w-full h-full overflow-hidden bg-background'>
      {/* Left Panel - Sidebar */}
      <div className='w-80 flex flex-col border-r border-border bg-background shrink-0'>
        {/* Search and Quick Actions Header */}
        <div className='p-3 space-y-3 border-b border-border flex items-center justify-center gap-2'>
          {/* Search Input */}
          <div className='relative flex-1 group w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
            <Input
              placeholder='Tìm kiếm bạn bè'
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className='pl-10 h-9 w-full bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 text-sm rounded-full'
            />
          </div>

          {/* Quick Action Buttons */}
          <div className='flex items-center gap-1 justify-center'>
            <button
              onClick={() => setShowAddFriendDialog(true)}
              className='p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground'
              title='Thêm bạn'
            >
              <UserPlus className='w-5 h-5' />
            </button>

            <button 
              className='p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground'
              title='Tạo nhóm'
            >
              <Users className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Contact Sidebar Navigation */}
        <div className='flex-1 overflow-y-auto'>
          <ContactSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            friendRequestCount={receivedRequests?.length ?? 0}
          />
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header with Filter Options */}
        {activeTab === 'friends' && (
          <ContactsFilter
            searchQuery={globalSearchQuery}
            onSearchChange={setGlobalSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            sortType={sortType}
            onSortChange={setSortType}
            totalCount={totalContacts}
          />
        )}

        {/* Main Content Area */}
        <div className='flex-1 overflow-hidden'>
          {renderContent()}
        </div>
      </div>

      {/* Add Friend Dialog */}
      <AddFriendSearchDialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog} />
    </div>
  )
}
