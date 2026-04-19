import { useState } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { UserFilterParams } from '@/features/user/schemas/admin-user.schema'
import { useAdminText } from '@/features/user/i18n/use-admin-text'

type UserFiltersProps = {
  filters: UserFilterParams
  onFiltersChange: (filters: UserFilterParams) => void
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const [name, setName] = useState(filters.name ?? '')
  const [phone, setPhone] = useState(filters.phone ?? '')
  const [email, setEmail] = useState(filters.email ?? '')
  const { text } = useAdminText()
  const t = text.userManagement.filters

  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      page: 0
    })
  }

  const handleReset = () => {
    setName('')
    setPhone('')
    setEmail('')
    onFiltersChange({ ...filters, name: undefined, phone: undefined, email: undefined, page: 0 })
  }

  return (
    <Card className='p-4 mb-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end'>
        <div className='flex-1'>
          <label className='text-sm font-medium mb-2 block'>{t.name}</label>
          <Input
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='flex-1'>
          <label className='text-sm font-medium mb-2 block'>{t.phone}</label>
          <Input
            placeholder={t.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='flex-1'>
          <label className='text-sm font-medium mb-2 block'>{t.email}</label>
          <Input
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='flex gap-2 shrink-0'>
          <Button onClick={handleSearch}>
            <Search className='w-4 h-4 mr-2' />
            {t.search}
          </Button>
          <Button variant='outline' onClick={handleReset}>
            <RotateCcw className='w-4 h-4 mr-2' />
            {t.reset}
          </Button>
        </div>
      </div>
    </Card>
  )
}
