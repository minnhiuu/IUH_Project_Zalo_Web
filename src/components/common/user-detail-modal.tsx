import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/common/user-avatar'
import { AuditTimeline } from '@/components/common/audit-timeline'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { userApi } from '@/features/user/api/user.api'
import { GENDER_LABELS } from '@/constants/enum'
import { 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon, 
  Activity,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserDetailModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function UserDetailModal({ userId, open, onOpenChange }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('profile')

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserById(userId),
    enabled: open && !!userId
  })

  // Fetch audit logs
  const { data: auditData, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['audit-logs', userId],
    queryFn: () => userApi.getUserAuditLogs(userId, { page: 0, size: 50 }),
    enabled: open && !!userId && activeTab === 'activity'
  })

  const user = userData?.data
  const auditLogs = auditData?.data?.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoadingUser ? (
          <UserDetailSkeleton />
        ) : user ? (
          <div className="flex-1 overflow-hidden">
            {/* Background & Avatar Section */}
            <div className="relative mb-16">
              {/* Background Image */}
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden">
                {user.background && (
                  <img
                    src={user.background}
                    alt="Background"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${user.backgroundY || 50}%` }}
                  />
                )}
              </div>

              {/* Avatar */}
              <div className="absolute left-6 -bottom-12">
                <div className="relative">
                  <UserAvatar
                    name={user.fullName}
                    src={user.avatar}
                    className="size-24 border-4 border-background shadow-lg"
                    fallbackClassName="text-2xl"
                  />
                  {user.role === 'ADMIN' && (
                    <Badge 
                      variant="default" 
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs"
                    >
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="gap-2">
                  <Info className="size-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="size-4" />
                  Activity History
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    
                    {user.bio && (
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    )}

                    <div className="grid gap-3">
                      {user.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="size-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-muted-foreground">Email:</span>
                          <span>{user.email}</span>
                        </div>
                      )}

                      {user.phoneNumber && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="size-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-muted-foreground">Phone:</span>
                          <span>{user.phoneNumber}</span>
                        </div>
                      )}

                      {user.gender && (
                        <div className="flex items-center gap-3 text-sm">
                          <UserIcon className="size-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-muted-foreground">Gender:</span>
                          <span>{GENDER_LABELS[user.gender]}</span>
                        </div>
                      )}

                      {user.dob && (
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="size-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-muted-foreground">Date of Birth:</span>
                          <span>{formatDate(user.dob)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Account Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-xs">{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account ID:</span>
                        <span className="font-mono text-xs">{user.accountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role:</span>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-4">
                {isLoadingAudit ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="size-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AuditTimeline logs={auditLogs} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Background & Avatar Skeleton */}
      <div className="relative mb-16">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="absolute left-6 -bottom-12">
          <Skeleton className="size-24 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4 mt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        <div className="space-y-3 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
