import z from 'zod'

// ─── Enums matching backend ────────────────────────────────
export type TargetType = 'POST' | 'COMMENT'
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'VIOLENCE' | 'NUDITY' | 'MISINFORMATION' | 'OTHER'
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'
export type AdminAction = 'DELETE_CONTENT' | 'HIDE_CONTENT' | 'WARN_USER' | 'DISMISS_REPORT'

// ─── Nested types ──────────────────────────────────────────
export type AuthorInfo = {
  id: string
  fullName: string
  avatar?: string
}

// ─── Grouped content summary (one row per reported post/comment) ───────────
export type ContentReportSummary = {
  targetId: string
  targetType: TargetType
  totalReports: number
  pendingCount: number
  resolvedCount: number
  dismissedCount: number
  reasons: ReportReason[]
  latestReportAt: string
  contentText?: string
  contentMediaUrls?: string[]
  contentAuthorId?: string
  contentAuthorInfo?: AuthorInfo
  overallStatus: ReportStatus
}

// ─── Individual report detail (used inside process dialog reporters list) ──
export type ReportDetailResponse = {
  id: string
  reporterId: string
  targetId: string
  targetType: TargetType
  reason: ReportReason
  details?: string
  status: ReportStatus
  adminId?: string
  adminNote?: string
  adminAction?: AdminAction
  createdAt: string
  updatedAt?: string
  contentText?: string
  contentMediaUrls?: string[]
  contentAuthorId?: string
  contentAuthorInfo?: AuthorInfo
  reporterInfo?: AuthorInfo
}

export type ReportResponse = {
  id: string
  reporterId: string
  targetId: string
  targetType: TargetType
  reason: ReportReason
  details?: string
  status: ReportStatus
  adminId?: string
  adminNote?: string
  adminAction?: AdminAction
  createdAt: string
  updatedAt?: string
}

export type UserWarningResponse = {
  id: string
  userId: string
  reportId: string
  reason: ReportReason
  adminId: string
  adminNote?: string
  createdAt: string
}

// ─── Request DTOs ──────────────────────────────────────────
export const bulkModerationRequestSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  targetType: z.enum(['POST', 'COMMENT']),
  action: z.enum(['DELETE_CONTENT', 'HIDE_CONTENT', 'WARN_USER', 'DISMISS_REPORT']),
  adminNote: z.string().optional()
})

export type BulkModerationRequest = z.infer<typeof bulkModerationRequestSchema>

export const submitReportSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['POST', 'COMMENT']),
  reason: z.enum(['SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'NUDITY', 'MISINFORMATION', 'OTHER']),
  details: z.string().max(500).optional()
})

export type CreateReportRequest = z.infer<typeof submitReportSchema>

// ─── Filter params ─────────────────────────────────────────
export type ReportFilterParams = {
  status?: ReportStatus
  page?: number
  size?: number
}
