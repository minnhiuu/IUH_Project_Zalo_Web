import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useUpdateProfileMutation } from '@/features/user/queries/use-mutations'
import { Gender } from '@/constants'
import { userUpdateRequestSchema } from '@/features/user/schemas/user.schema'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getDaysInMonth } from 'date-fns'

interface OwnerProfileEditFormProps {
  user: NonNullable<ReturnType<typeof useAuthContext>['user']>
  onCancel: () => void
}

export function OwnerProfileEditForm({ user, onCancel }: OwnerProfileEditFormProps) {
  const { text } = useUserText()
  const updateProfileMutation = useUpdateProfileMutation()

  const [fullName, setFullName] = useState(user.fullName)
  const [gender, setGender] = useState<Gender>(user.gender)
  const [bio, setBio] = useState(user.bio || '')

  const initialDate = user.dob ? new Date(user.dob) : new Date()
  const [day, setDay] = useState(user.dob ? initialDate.getDate().toString().padStart(2, '0') : '')
  const [month, setMonth] = useState(user.dob ? (initialDate.getMonth() + 1).toString().padStart(2, '0') : '')
  const [year, setYear] = useState(user.dob ? initialDate.getFullYear().toString() : '')

  const handleUpdate = () => {
    const dob = `${year}-${month}-${day}`
    const updateData = {
      fullName,
      gender,
      dob,
      bio
    }

    const validation = userUpdateRequestSchema.safeParse(updateData)
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        onCancel()
      }
    })
  }

  const daysInMonth = month ? getDaysInMonth(new Date(parseInt(year || '2000'), parseInt(month) - 1)) : 31

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth)
    const maxDays = getDaysInMonth(new Date(parseInt(year || '2000'), parseInt(newMonth) - 1))
    if (day && parseInt(day) > maxDays) {
      setDay(maxDays.toString().padStart(2, '0'))
    }
  }

  const handleYearChange = (newYear: string) => {
    setYear(newYear)
    if (month) {
      const maxDays = getDaysInMonth(new Date(parseInt(newYear), parseInt(month) - 1))
      if (day && parseInt(day) > maxDays) {
        setDay(maxDays.toString().padStart(2, '0'))
      }
    }
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

  return (
    <div className='p-4 pt-6 space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='fullName' className='text-sm font-medium'>
          {text.profile.fullNameLabel}
        </Label>
        <Input
          id='fullName'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className='h-10 rounded-md border-border'
          placeholder={text.profile.fullNamePlaceholder}
        />
        <p className='text-xs text-muted-foreground'>{text.profile.fullNameNote}</p>
      </div>
      <div className='space-y-2'>
        <div className='flex justify-between items-center'>
          <Label htmlFor='bio' className='text-sm font-medium'>
            {text.profile.bioLabel}
          </Label>
          <span className={cn('text-xs', bio.length > 150 ? 'text-destructive font-bold' : 'text-muted-foreground')}>
            {bio.length}/150
          </span>
        </div>
        <Textarea
          id='bio'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className='min-h-[80px] resize-none text-sm rounded-md border-border'
          placeholder={text.profile.bioPlaceholder}
        />
      </div>

      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>{text.profile.personalInfo}</h4>
        <div className='flex items-center gap-8'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='gender'
              value={Gender.Male}
              checked={gender === Gender.Male}
              onChange={() => setGender(Gender.Male)}
              className='w-4 h-4 accent-primary cursor-pointer'
            />
            <span className='text-sm'>{text.profile.male}</span>
          </label>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='gender'
              value={Gender.Female}
              checked={gender === Gender.Female}
              onChange={() => setGender(Gender.Female)}
              className='w-4 h-4 accent-primary cursor-pointer'
            />
            <span className='text-sm'>{text.profile.female}</span>
          </label>
        </div>

        <div className='space-y-2'>
          <Label className='text-sm text-foreground/60'>{text.profile.dob}</Label>
          <div className='grid grid-cols-3 gap-3'>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger className='w-full h-9 border-border'>
                <SelectValue placeholder={text.profile.day} />
              </SelectTrigger>
              <SelectContent
                position='popper'
                className='max-h-[180px] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
              >
                {days.map((d) => (
                  <SelectItem key={d} value={d} className='cursor-pointer focus:bg-secondary focus:text-primary'>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month} onValueChange={handleMonthChange}>
              <SelectTrigger className='w-full h-9 border-border'>
                <SelectValue placeholder={text.profile.month} />
              </SelectTrigger>
              <SelectContent
                position='popper'
                className='max-h-[180px] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
              >
                {months.map((m) => (
                  <SelectItem key={m} value={m} className='cursor-pointer focus:bg-secondary focus:text-primary'>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={handleYearChange}>
              <SelectTrigger className='w-full h-9 border-border'>
                <SelectValue placeholder={text.profile.year} />
              </SelectTrigger>
              <SelectContent
                position='popper'
                className='max-h-[180px] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
              >
                {years.map((y) => (
                  <SelectItem key={y} value={y} className='cursor-pointer focus:bg-secondary focus:text-primary'>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-4 border-t border-border'>
        <Button variant='secondary' onClick={onCancel}>
          {text.profile.cancel}
        </Button>
        <Button onClick={handleUpdate} disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? text.profile.updating : text.profile.update}
        </Button>
      </div>
    </div>
  )
}
