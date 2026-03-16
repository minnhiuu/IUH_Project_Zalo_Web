/**
 * Example usage of UserDetailModal component
 * 
 * Import and use this modal to display user details with audit history
 */

import { useState } from 'react'
import { UserDetailModal } from '@/components/common/user-detail-modal'
import { Button } from '@/components/ui/button'

export function UserDetailModalExample() {
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const handleOpenUserDetail = (userId: string) => {
    setSelectedUserId(userId)
    setOpen(true)
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">User Detail Modal Demo</h1>
      
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Click the button below to open user detail modal
        </p>
        
        <Button onClick={() => handleOpenUserDetail('user-id-here')}>
          View User Details
        </Button>
      </div>

      {/* Usage Example in your component */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Usage Example:</h3>
        <pre className="text-sm overflow-x-auto">
{`import { UserDetailModal } from '@/components/common/user-detail-modal'

// In your component
const [open, setOpen] = useState(false)
const [userId, setUserId] = useState('')

<UserDetailModal 
  userId={userId}
  open={open}
  onOpenChange={setOpen}
/>`}
        </pre>
      </div>

      <UserDetailModal 
        userId={selectedUserId}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}

/**
 * Integration with User List/Table
 */
export function UserListWithDetailModal() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Mock user data
  const users = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@example.com' },
  ]

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      
      <div className="space-y-2">
        {users.map(user => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => setSelectedUserId(user.id)}
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        ))}
      </div>

      {selectedUserId && (
        <UserDetailModal 
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
