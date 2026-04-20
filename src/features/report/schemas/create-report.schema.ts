import z from 'zod'
import type { TargetType, ReportReason } from './report.schema'

export const createReportSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  targetType: z.enum(['POST', 'COMMENT']) satisfies z.ZodType<TargetType>,
  reason: z.enum([
    'SPAM',
    'HARASSMENT',
    'HATE_SPEECH',
    'VIOLENCE',
    'NUDITY',
    'MISINFORMATION',
    'OTHER'
  ]) satisfies z.ZodType<ReportReason>,
  details: z.string().max(500).optional()
})

export type CreateReportRequest = z.infer<typeof createReportSchema>
