import { useState, useEffect } from 'react'
import { X, Camera, Pencil, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/utils/date'

import { AlertDialog, AlertDialogContent, AlertDialogOverlay, AlertDialogPortal } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { useUpdateProfileMutation } from '@/features/user/queries/use-mutations'
import { useLocale } from '@/lib/i18n'
import { Gender } from '@/constants'
import { UserAvatar } from '@/components/common/user-avatar'
import { userUpdateRequestSchema } from '@/features/user/schemas/user.schema'
import { toast } from 'sonner'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, refetchUser } = useAuthContext()
  const { text } = useUserText()
  const { locale } = useLocale()
  const [isEditing, setIsEditing] = useState(false)
  const updateProfileMutation = useUpdateProfileMutation()

  // Form states
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<Gender>(Gender.Male)
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    if (open) {
      refetchUser()
      setIsEditing(false)
    }
  }, [open, refetchUser])

  useEffect(() => {
    if (user) {
      setFullName(user.fullName)
      setGender(user.gender)
      if (user.dob) {
        const date = new Date(user.dob)
        setDay(date.getDate().toString().padStart(2, '0'))
        setMonth((date.getMonth() + 1).toString().padStart(2, '0'))
        setYear(date.getFullYear().toString())
      }
    }
  }, [user, isEditing])

  if (!user) return null

  const handleUpdate = () => {
    const dob = `${year}-${month}-${day}`
    const updateData = {
      fullName,
      gender,
      dob,
      bio: user.bio
    }

    const validation = userUpdateRequestSchema.safeParse(updateData)
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

  const formattedDob = formatDate(user.dob, locale, 'dd MMMM, yyyy')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay className='bg-black/45 backdrop-blur-none! duration-200 fixed inset-0 z-50' />
        <AlertDialogContent
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[400px] max-w-[95vw] p-0 gap-0 rounded-[4px] overflow-hidden border-none shadow-[0_8px_28px_rgba(0,0,0,0.15)] bg-background outline-none',
            'animate-in zoom-in-95 duration-200'
          )}
        >
          <div className='flex items-center justify-between px-4 h-[44px] border-b border-border bg-background sticky top-0 z-10'>
            <div className='flex items-center gap-2'>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
                >
                  <ChevronLeft className='w-5 h-5 text-muted-foreground' />
                </button>
              )}
              <h2 className='text-[15px] font-bold text-foreground'>
                {isEditing ? 'Cập nhật thông tin cá nhân' : text.profile.title}
              </h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className='p-1 hover:bg-black/5 rounded-full transition-colors outline-none cursor-pointer'
            >
              <X className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          <div className='overflow-y-auto max-h-[calc(90vh-44px)] bg-background'>
            {!isEditing ? (
              <>
                <div className='relative h-[160px] w-full bg-muted overflow-hidden cursor-pointer'>
                  <img
                    src={user.background || 'https://cover-talk.zadn.vn/d/8/c/a/8/ddaacb12a8db4ca28bebf0102d217494.jpg'}
                    alt='Cover'
                    className='w-full h-full object-cover'
                  />
                </div>

                <div className='px-4 relative h-[84px] bg-background'>
                  <div className='absolute -top-6 left-4 flex items-end gap-4'>
                    <div className='relative group shrink-0'>
                      <UserAvatar
                        src={user.avatar}
                        name={user.fullName}
                        className='w-20 h-20 border-2 border-background shadow-sm cursor-pointer'
                        fallbackClassName='text-3xl bg-primary text-white font-medium'
                      />
                      <button className='absolute bottom-0 right-0 p-1.5 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-sm cursor-pointer'>
                        <Camera className='w-4 h-4 text-foreground' />
                      </button>
                    </div>
                    <div className='pb-2 flex items-center gap-2 min-w-0'>
                      <h3 className='text-[18px] font-bold text-foreground truncate max-w-[200px]'>{user.fullName}</h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className='p-1 hover:bg-muted rounded-md transition-colors cursor-pointer shrink-0'
                      >
                        <Pencil className='w-4 h-4 text-muted-foreground/60' />
                      </button>
                    </div>
                  </div>
                </div>

                <div className='h-2 bg-muted w-full' />

                <div className='px-4 pt-4'>
                  <h4 className='text-[15px] font-bold text-foreground mb-5'>{text.profile.personalInfo}</h4>

                  <div className='space-y-4 pr-2'>
                    <div className='flex items-start'>
                      <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.gender}</span>
                      <span className='text-[14px] text-foreground font-medium'>
                        {user.gender === Gender.Male ? text.profile.male : text.profile.female}
                      </span>
                    </div>

                    <div className='flex items-start'>
                      <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.dob}</span>
                      <span className='text-[14px] text-foreground font-medium'>{formattedDob}</span>
                    </div>

                    <div className='flex flex-col gap-1'>
                      <div className='flex items-start'>
                        <span className='w-28 shrink-0 text-[14px] text-muted-foreground'>{text.profile.phone}</span>
                        <span className='text-[14px] text-foreground font-medium'>{user.phoneNumber}</span>
                      </div>
                      <p className='mt-5 text-[12.5px] text-muted-foreground leading-snug'>{text.profile.privacyNote}</p>
                    </div>
                  </div>

                  <div className='mt-8 border-t border-border flex justify-center'>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant='ghost'
                      className='w-full h-10 bg-background hover:bg-muted border-none font-bold text-[14px] gap-2 transition-colors'
                    >
                      <Pencil className='w-4 h-4' />
                      {text.profile.update}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className='p-4 pt-6 space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName' className='text-[14px] font-medium'>
                    Tên hiển thị
                  </Label>
                  <Input
                    id='fullName'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className='h-10 rounded-md border-border'
                    placeholder='Nhập tên hiển thị'
                  />
                  <p className='text-[12px] text-muted-foreground'>
                    Sử dụng tên thật để bạn bè dễ dàng nhận ra bạn.
                  </p>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-[14px] font-medium'>Thông tin cá nhân</h4>
                  <div className='flex items-center gap-8'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        name='gender'
                        value={Gender.Male}
                        checked={gender === Gender.Male}
                        onChange={() => setGender(Gender.Male)}
                        className='w-4 h-4 accent-primary'
                      />
                      <span className='text-[14px]'>Nam</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        name='gender'
                        value={Gender.Female}
                        checked={gender === Gender.Female}
                        onChange={() => setGender(Gender.Female)}
                        className='w-4 h-4 accent-primary'
                      />
                      <span className='text-[14px]'>Nữ</span>
                    </label>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[14px] text-muted-foreground'>Ngày sinh</Label>
                    <div className='grid grid-cols-3 gap-3'>
                      <Select value={day} onValueChange={setDay}>
                        <SelectTrigger className='w-full h-9 bg-white border-border'>
                          <SelectValue placeholder='Ngày' />
                        </SelectTrigger>
                        <SelectContent
                          position='popper'
                          className='max-h-[180px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
                        >
                          {days.map((d) => (
                            <SelectItem
                              key={d}
                              value={d}
                              className='cursor-pointer focus:bg-[#e8f3ff] focus:text-[#0068ff]'
                            >
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className='w-full h-9 bg-white border-border'>
                          <SelectValue placeholder='Tháng' />
                        </SelectTrigger>
                        <SelectContent
                          position='popper'
                          className='max-h-[180px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
                        >
                          {months.map((m) => (
                            <SelectItem
                              key={m}
                              value={m}
                              className='cursor-pointer focus:bg-[#e8f3ff] focus:text-[#0068ff]'
                            >
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className='w-full h-9 bg-white border-border'>
                          <SelectValue placeholder='Năm' />
                        </SelectTrigger>
                        <SelectContent
                          position='popper'
                          className='max-h-[180px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-border'
                        >
                          {years.map((y) => (
                            <SelectItem
                              key={y}
                              value={y}
                              className='cursor-pointer focus:bg-[#e8f3ff] focus:text-[#0068ff]'
                            >
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t border-border'>
                  <Button
                    variant='ghost'
                    onClick={() => setIsEditing(false)}
                    className='px-6 h-10 hover:bg-zinc-200 font-bold bg-[#eaebed] text-[#081b3a] rounded-md'
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={updateProfileMutation.isPending}
                    className='px-6 h-10 bg-[#0068ff] hover:bg-[#005ae0] text-white font-bold rounded-md border-none shadow-none'
                  >
                    {updateProfileMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
