import { useState } from 'react'
import { useAuth } from '@/features/auth'
import type { ConversationResponse } from '../../schemas/chat.schema'
import { GroupMemberRole } from '@/constants/enum'
import { GroupInfoStep } from './steps/group-info-step'
import { GroupSubStep } from './steps/group-sub-step'

interface ChatInfoGroupSidebarProps {
  conversation: ConversationResponse
  onRenameClick?: () => void
  onAvatarClick?: () => void
  managementOpenSignal?: number
}

export function ChatInfoGroupSidebar({
  conversation,
  onRenameClick,
  onAvatarClick,
  managementOpenSignal
}: ChatInfoGroupSidebarProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'info' | 'management' | 'members'>('info')
  const [lastManagementOpenSignal, setLastManagementOpenSignal] = useState<number>(managementOpenSignal ?? 0)

  const currentMember = conversation.members?.find((m) => m.userId === user?.id)
  const currentUserRole = (currentMember?.role?.toUpperCase() as GroupMemberRole) || GroupMemberRole.Member

  if ((managementOpenSignal ?? 0) !== lastManagementOpenSignal) {
    setLastManagementOpenSignal(managementOpenSignal ?? 0)
    setStep('management')
  }

  if (step === 'management' || step === 'members') {
    return (
      <GroupSubStep
        conversation={conversation}
        currentUserRole={currentUserRole}
        step={step}
        onBack={() => setStep('info')}
      />
    )
  }

  return (
    <GroupInfoStep
      conversation={conversation}
      onGoToManagement={() => setStep('management')}
      onGoToMembers={() => setStep('members')}
      onAvatarClick={onAvatarClick}
      onRenameClick={onRenameClick}
    />
  )
}
