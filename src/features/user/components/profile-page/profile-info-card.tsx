import { Calendar, Mail, Phone, User2, ShieldCheck, Info } from 'lucide-react'
import type { UserResponse } from '@/features/user/schemas/user.schema'
import { useUserText } from '@/features/user/i18n/use-user-text'

interface ProfileInfoCardProps {
  user: UserResponse
  /** When true, sensitive fields (email, phone) are hidden — used on other-user profile pages */
  isOther?: boolean
}

function formatDob(dob?: string | null, locale?: string): string | null {
  if (!dob) return null
  try {
    const date = new Date(dob)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString(locale ?? 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return null
  }
}


function maskPhone(phone?: string | null): string | null {
  if (!phone) return null
  if (phone.length <= 4) return phone
  return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4)
}

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value: string
  className?: string
}

function InfoRow({ icon: Icon, label, value, className }: InfoRowProps) {
  return (
    <div className={`flex items-start gap-3 py-2.5 ${className ?? ''}`}>
      <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
        <Icon className='h-4 w-4 text-primary dark:text-primary-foreground' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-[11.5px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>{label}</p>
        <p className='mt-0.5 break-all text-[14px] font-medium text-zinc-800 dark:text-zinc-200'>{value}</p>
      </div>
    </div>
  )
}

export function ProfileInfoCard({ user, isOther = false }: ProfileInfoCardProps) {
  const { text } = useUserText()
  const p = text.profile.page

  // /users/me returns flat email/phone/role; /users/{id} nests them in accountInfo
  const email = user.email ?? user.accountInfo?.email ?? null
  const phone = user.phoneNumber ?? user.accountInfo?.phoneNumber ?? null
  const role = user.role ?? user.accountInfo?.role ?? null

  const resolveGender = (gender?: string | null): string | null => {
    if (!gender) return null
    const g = gender.toLowerCase()
    if (g === 'male') return p.genderMale
    if (g === 'female') return p.genderFemale
    return gender
  }

  const rows: Array<{ icon: React.ElementType; label: string; value: string } | null> = [
    user.bio
      ? { icon: Info, label: p.fieldBio, value: user.bio }
      : null,
    resolveGender(user.gender)
      ? { icon: User2, label: p.fieldGender, value: resolveGender(user.gender)! }
      : null,
    formatDob(user.dob)
      ? { icon: Calendar, label: p.fieldBirthday, value: formatDob(user.dob)! }
      : null,
    // Contact info — full on own profile, masked/hidden on others
    !isOther && email
      ? { icon: Mail, label: p.fieldEmail, value: email }
      : null,
    !isOther && phone
      ? { icon: Phone, label: p.fieldPhone, value: phone }
      : null,
    // Show masked phone on other profiles
    isOther && phone
      ? { icon: Phone, label: p.fieldPhone, value: maskPhone(phone)! }
      : null,
    role && role !== 'USER'
      ? { icon: ShieldCheck, label: p.fieldRole, value: role }
      : null,
  ].filter(Boolean)

  if (rows.length === 0) return null

  return (
    <div className='rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950/60 px-5 py-1 shadow-sm'>
      <h4 className='pb-2 pt-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>
        {p.about}
      </h4>
      <div className='divide-y divide-zinc-100 dark:divide-white/5'>
        {rows.map((row) =>
          row ? (
            <InfoRow
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.value}
            />
          ) : null
        )}
      </div>
    </div>
  )
}
