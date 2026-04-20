import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useSubmitReportMutation } from '@/features/report/queries/report-submit-mutation'
import { toast } from 'sonner'
import type { TargetType, ReportReason } from '@/features/report/schemas/report.schema'

type ReportContentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: string
  targetType: TargetType
}

const reasonLabels: Record<ReportReason, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  HATE_SPEECH: 'Hate speech',
  VIOLENCE: 'Violence',
  NUDITY: 'Nudity or sexual content',
  MISINFORMATION: 'Misinformation',
  OTHER: 'Other'
}

const REASONS = Object.keys(reasonLabels) as ReportReason[]

const targetLabels: Record<TargetType, string> = {
  POST: 'post',
  COMMENT: 'comment'
}

export function ReportContentDialog({ open, onOpenChange, targetId, targetType }: ReportContentDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const mutation = useSubmitReportMutation()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setReason('')
      setDetails('')
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit() {
    if (!reason) return
    mutation.mutate(
      { targetId, targetType, reason, details: details.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Report submitted. Thank you for helping keep the community safe.')
          handleOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Report {targetLabels[targetType]}</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this {targetLabels[targetType]}. Your report is anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='report-reason'>Reason *</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger id='report-reason' className='w-full'>
                <SelectValue placeholder='Select a reason' />
              </SelectTrigger>
              <SelectContent className='z-[200]'>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {reasonLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='report-details'>Additional details (optional)</Label>
            <Textarea
              id='report-details'
              placeholder='Provide more context about this report...'
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              className='resize-none'
            />
            <p className='text-right text-[11px] text-muted-foreground'>{details.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || mutation.isPending}
            className='bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
          >
            {mutation.isPending ? 'Submitting...' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
