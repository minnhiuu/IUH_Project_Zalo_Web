import { useState } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import type { UserFilterParams } from '@/features/user/schemas/admin-user.schema'

type UserFiltersProps = {
  filters: UserFilterParams
  onFiltersChange: (filters: UserFilterParams) => void
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '')

  const handleSearch = () => {
    onFiltersChange({ ...filters, keyword: keyword.trim() || undefined, page: 0 })
  }

  return (
    <Card className='p-4 mb-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end'>
        {/* Tìm kiếm */}
        <div className='flex-1'>
          <label className='text-sm font-medium mb-2 block'>Tìm kiếm</label>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Tên người dùng...'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className='pl-9'
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className='w-4 h-4 mr-2' />
              Tìm
            </Button>
          </div>
        </div>

        {/* Trạng thái */}
        <div className='w-full md:w-44'>
          <label className='text-sm font-medium mb-2 block'>Trạng thái</label>
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v as UserFilterParams['status'], page: 0 })
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>Tất cả</SelectItem>
              <SelectItem value='ACTIVE'>Hoạt động</SelectItem>
              <SelectItem value='BANNED'>Đã cấm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <Button
          variant='outline'
          onClick={() => {
            setKeyword('')
            onFiltersChange({ page: 0, size: filters.size })
          }}
        >
          <RotateCcw className='w-4 h-4 mr-2' />
          Đặt lại
        </Button>
      </div>
    </Card>
  )
}


