import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, ShieldCheck, Sprout, TriangleAlert, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import { getErrorMessage } from '@/utils/error-handler'
import { seedingApi } from '@/features/admin-seeding/api/seeding.api'
import type { SeedEndpointInfo, SeedExecution } from '@/features/admin-seeding/schemas/seeding.schema'

const SEEDING_ENDPOINTS: SeedEndpointInfo[] = [
  {
    key: 'auth-accounts',
    service: 'auth-service',
    method: 'POST',
    gatewayPath: '/api/auth/internal/seed/accounts?count={count}',
    servicePath: '/auth/internal/seed/accounts?count={count}',
    authorization: 'ADMIN (method security: @PreAuthorize)',
    webAccessible: true,
    notes: 'If count >= 50, backend returns STARTED and runs background seeding.'
  },
  {
    key: 'social-seed-all',
    service: 'social-feed-service',
    method: 'POST',
    gatewayPath: '/api/social/internal/seeder/seed/all',
    servicePath: '/social/internal/seeder/seed/all',
    authorization: 'Internal endpoint is permitAll in service security',
    webAccessible: true,
    notes:
      'Destructive reseed: clears social-feed data (posts/comments/reactions/interactions/hashtags) before regenerating it.'
  },
  {
    key: 'user-seed-interests',
    service: 'user-service',
    method: 'PUT',
    gatewayPath: 'Not routed via API Gateway',
    servicePath: '/internal/users/account/{accountId}/seed-interests',
    authorization: 'Internal service-to-service usage',
    webAccessible: false,
    notes: 'Used by social-feed seeder internally through service-to-service calls.'
  }
]

const formatExecutionTime = (isoDate: string): string => {
  const dt = new Date(isoDate)
  return dt.toLocaleString()
}

export const SeedingDashboard = () => {
  const [accountCount, setAccountCount] = useState<number>(10)
  const [executions, setExecutions] = useState<SeedExecution[]>([])

  const confirmSocialReseed = () => {
    return window.confirm(
      'This action will DELETE all existing social-feed seeded data and reseed from scratch. Continue?'
    )
  }

  const seedAuthAccountsMutation = useMutation({
    mutationFn: (count: number) => seedingApi.seedAuthAccounts(count),
    onSuccess: (response, count) => {
      const data = response.data?.data
      const message = response.data?.message || `Seed auth accounts successfully with count=${count}`
      setExecutions((prev) => [
        {
          endpointKey: 'auth-accounts',
          endpointPath: `/api/auth/internal/seed/accounts?count=${count}`,
          executedAt: new Date().toISOString(),
          success: true,
          message,
          payload: data
        },
        ...prev
      ])
      showSuccessToast('Auth account seeding triggered successfully')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setExecutions((prev) => [
        {
          endpointKey: 'auth-accounts',
          endpointPath: `/api/auth/internal/seed/accounts?count=${accountCount}`,
          executedAt: new Date().toISOString(),
          success: false,
          message
        },
        ...prev
      ])
      showErrorToast(message)
    }
  })

  const seedSocialFeedMutation = useMutation({
    mutationFn: () => seedingApi.seedSocialFeedAll(),
    onSuccess: (response) => {
      const data = response.data?.data
      const message = response.data?.message || 'Reseed social-feed successfully'
      setExecutions((prev) => [
        {
          endpointKey: 'social-seed-all',
          endpointPath: '/api/social/internal/seeder/seed/all',
          executedAt: new Date().toISOString(),
          success: true,
          message,
          payload: data
        },
        ...prev
      ])
      showSuccessToast('Social feed reseeding finished')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setExecutions((prev) => [
        {
          endpointKey: 'social-seed-all',
          endpointPath: '/api/social/internal/seeder/seed/all',
          executedAt: new Date().toISOString(),
          success: false,
          message
        },
        ...prev
      ])
      showErrorToast(message)
    }
  })

  const runFullPipelineMutation = useMutation({
    mutationFn: async () => {
      await seedAuthAccountsMutation.mutateAsync(accountCount)
      await seedSocialFeedMutation.mutateAsync()
    }
  })

  const handleTriggerSocialSeeding = () => {
    if (!confirmSocialReseed()) {
      return
    }

    seedSocialFeedMutation.mutate()
  }

  const handleRunFullPipeline = () => {
    if (!confirmSocialReseed()) {
      return
    }

    runFullPipelineMutation.mutate()
  }

  const isBusy = useMemo(
    () => seedAuthAccountsMutation.isPending || seedSocialFeedMutation.isPending || runFullPipelineMutation.isPending,
    [seedAuthAccountsMutation.isPending, seedSocialFeedMutation.isPending, runFullPipelineMutation.isPending]
  )

  return (
    <div className='container space-y-6 pb-8'>
      <div className='flex items-start gap-3'>
        <div className='rounded-lg bg-primary/10 p-2.5'>
          <Sprout className='h-6 w-6 text-primary' />
        </div>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>Data Seeding</h1>
          <p className='text-muted-foreground'>
            Trigger backend seeding endpoints and monitor latest execution results for local/dev bootstrap.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seeding Endpoint Inventory</CardTitle>
          <CardDescription>All seed-related endpoints detected from backend source code.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b'>
                <tr className='text-muted-foreground'>
                  <th className='pb-3 pr-4 font-medium'>Service</th>
                  <th className='pb-3 pr-4 font-medium'>Method</th>
                  <th className='pb-3 pr-4 font-medium'>Gateway Path</th>
                  <th className='pb-3 pr-4 font-medium'>Service Path</th>
                  <th className='pb-3 pr-4 font-medium'>Access</th>
                  <th className='pb-3 pr-4 font-medium'>Web</th>
                </tr>
              </thead>
              <tbody>
                {SEEDING_ENDPOINTS.map((endpoint) => (
                  <tr key={endpoint.key} className='border-b last:border-b-0 align-top'>
                    <td className='py-3 pr-4'>
                      <div className='font-medium'>{endpoint.service}</div>
                      <p className='text-xs text-muted-foreground mt-1'>{endpoint.notes}</p>
                    </td>
                    <td className='py-3 pr-4'>
                      <Badge variant='secondary'>{endpoint.method}</Badge>
                    </td>
                    <td className='py-3 pr-4 font-mono text-xs'>{endpoint.gatewayPath}</td>
                    <td className='py-3 pr-4 font-mono text-xs'>{endpoint.servicePath}</td>
                    <td className='py-3 pr-4 text-xs'>{endpoint.authorization}</td>
                    <td className='py-3 pr-4'>
                      {endpoint.webAccessible ? (
                        <Badge variant='default' className='gap-1'>
                          <CheckCircle2 className='size-3' />
                          Reachable
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='gap-1'>
                          <TriangleAlert className='size-3' />
                          Internal only
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='h-4 w-4' />
              Auth Account Seeder
            </CardTitle>
            <CardDescription>Calls POST /api/auth/internal/seed/accounts with count query parameter.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Number of accounts</p>
              <Input
                type='number'
                min={1}
                max={1000}
                value={accountCount}
                onChange={(event) => {
                  const nextCount = Number(event.target.value)
                  setAccountCount(Number.isFinite(nextCount) ? nextCount : 1)
                }}
              />
              <p className='text-xs text-muted-foreground'>
                Backend switches to background mode automatically when count is 50 or higher.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => seedAuthAccountsMutation.mutate(accountCount)}
                disabled={isBusy || accountCount < 1}
              >
                {seedAuthAccountsMutation.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
                Trigger Auth Seeding
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sprout className='h-4 w-4' />
              Social Feed Seeder
            </CardTitle>
            <CardDescription>
              Calls POST /api/social/internal/seeder/seed/all for destructive social-feed reseeding.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-md border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'>
              This endpoint deletes existing social-feed data before creating fresh
              posts/comments/reactions/interactions.
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button onClick={handleTriggerSocialSeeding} disabled={isBusy}>
                {seedSocialFeedMutation.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
                Trigger Social Reseeding
              </Button>
              <Button variant='outline' onClick={handleRunFullPipeline} disabled={isBusy || accountCount < 1}>
                {runFullPipelineMutation.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
                Run Full Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
          <CardDescription>Most recent seeding calls and backend responses.</CardDescription>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No seeding action executed yet.</p>
          ) : (
            <div className='space-y-4'>
              {executions.map((execution, index) => (
                <div
                  key={`${execution.executedAt}-${execution.endpointKey}-${index}`}
                  className='rounded-lg border p-4'
                >
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      {execution.success ? (
                        <Badge variant='default' className='gap-1'>
                          <CheckCircle2 className='size-3' />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant='destructive' className='gap-1'>
                          <XCircle className='size-3' />
                          Failed
                        </Badge>
                      )}
                      <span className='font-mono text-xs text-muted-foreground'>{execution.endpointPath}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>{formatExecutionTime(execution.executedAt)}</span>
                  </div>
                  <p className='text-sm mt-2'>{execution.message}</p>
                  {execution.payload && (
                    <pre className='mt-3 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs'>
                      {JSON.stringify(execution.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
