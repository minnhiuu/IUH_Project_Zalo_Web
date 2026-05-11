import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import {
  ContactSidebar,
  FriendList,
  FriendRequestList,
  GroupList,
  GroupInviteList,
  useReceivedFriendRequests,
  AddFriendSearchDialog,
  useFriendText,
  type ContactTab
} from '@/features/friend'
import { CreateGroupDialog } from '@/features/chat'
import { SearchAndActions, type SearchAction } from '@/components/common/search-and-actions'
import { useOutletContext } from 'react-router'
import { GlobalSearchPanel } from '@/features/search'

export default function ContactPage() {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen } = useOutletContext<{
    isGlobalSearchOpen: boolean
    setIsGlobalSearchOpen: (open: boolean) => void
  }>()
  const { text } = useFriendText()
  const [activeTab, setActiveTab] = useState<ContactTab>('friends')
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')

  const { data: receivedRequests } = useReceivedFriendRequests()

  const headerActions: SearchAction[] = [
    {
      icon: UserPlus,
      onClick: () => setShowAddFriendDialog(true),
      title: text.sidebar.addFriend
    },
    {
      icon: Users,
      onClick: () => setShowCreateGroupDialog(true),
      title: text.sidebar.groupList
    }
  ]

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
      <div className='w-[344px] flex flex-col border-r border-border bg-background shrink-0 h-full relative'>
        {isGlobalSearchOpen ? (
          <GlobalSearchPanel open={isGlobalSearchOpen} onOpenChange={setIsGlobalSearchOpen} />
        ) : (
          <>
            {/* Search and Quick Actions Header */}
            <div className='px-4 py-3 shrink-0'>
              <SearchAndActions
                placeholder={text.contacts.searchPlaceholder}
                value={globalSearchQuery}
                onChange={setGlobalSearchQuery}
                onFocus={() => setIsGlobalSearchOpen(true)}
                actions={headerActions}
              />
            </div>

            {/* Contact Sidebar Navigation */}
            <div className='flex-1 overflow-y-auto'>
              <ContactSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                friendRequestCount={receivedRequests?.length ?? 0}
              />
            </div>
          </>
        )}
      </div>

      {/* Right Panel - Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Main Content Area */}
        <div className='flex-1 overflow-hidden'>{renderContent()}</div>
      </div>

      {/* Add Friend Dialog */}
      <AddFriendSearchDialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog} />
      <CreateGroupDialog isOpen={showCreateGroupDialog} onClose={() => setShowCreateGroupDialog(false)} />
    </div>
  )
}
