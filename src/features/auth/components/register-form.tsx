import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Lock, Mail, User, Phone, KeyRound, ChevronLeft, 
  Code, Music, Trophy, Compass, Utensils, Gamepad, Palette, Shirt, GraduationCap, Film, Check, ArrowRight,
  Camera, Dumbbell, Coffee, Sparkles, BookOpen, Mountain, Heart, Bike, PawPrint, Pizza, Brain, Briefcase, Leaf, Home, Cookie, Shield, Smartphone, Wine
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldError } from '@/components/ui/field'

import {
  type RegisterRequest,
  registerRequestSchema,
  type RegisterVerifyRequest,
  registerVerifyRequestSchema
} from '@/features/auth/schemas/auth.schema'
import { useInitiateRegistration, useVerifyRegistration } from '@/features/auth/queries/use-mutations'
import { PATHS, DeviceType } from '@/constants'
import { handleErrorApi, getErrorCode, getErrorMessage } from '@/utils/error-handler'
import { ErrorCode } from '@/constants/error-code'
import { useAuthText } from '@/features/auth/i18n/use-auth-text'
import { AuthInput } from './common/auth-input'
import { AuthButton } from './common/auth-button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getDeviceId } from '@/utils/device'
import { FullScreenLoading } from '@/components/common/full-screen-loading'

type Step = 'REGISTER' | 'INTERESTS' | 'VERIFY'

const INTEREST_OPTIONS = [
  { id: '#Travel', labelKey: 'travel', icon: Compass, color: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:text-emerald-600 text-emerald-500 dark:text-emerald-400' },
  { id: '#Photography', labelKey: 'photography', icon: Camera, color: 'border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-500 hover:text-cyan-600 text-cyan-500 dark:text-cyan-400' },
  { id: '#Fitness', labelKey: 'fitness', icon: Dumbbell, color: 'border-orange-500/40 bg-orange-500/5 hover:border-orange-500 hover:text-orange-600 text-orange-500 dark:text-orange-400' },
  { id: '#Cooking', labelKey: 'cooking', icon: Utensils, color: 'border-red-500/40 bg-red-500/5 hover:border-red-500 hover:text-red-600 text-red-500 dark:text-red-400' },
  { id: '#Coffee', labelKey: 'coffee', icon: Coffee, color: 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:text-amber-600 text-amber-500 dark:text-amber-400' },
  { id: '#Technology', labelKey: 'technology', icon: Code, color: 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-600 text-indigo-500 dark:text-indigo-400' },
  { id: '#ArtificialIntelligence', labelKey: 'artificialIntelligence', icon: Sparkles, color: 'border-purple-500/40 bg-purple-500/5 hover:border-purple-500 hover:text-purple-600 text-purple-500 dark:text-purple-400' },
  { id: '#Gaming', labelKey: 'gaming', icon: Gamepad, color: 'border-violet-500/40 bg-violet-500/5 hover:border-violet-500 hover:text-violet-600 text-violet-500 dark:text-violet-400' },
  { id: '#Music', labelKey: 'music', icon: Music, color: 'border-pink-500/40 bg-pink-500/5 hover:border-pink-500 hover:text-pink-600 text-pink-500 dark:text-pink-400' },
  { id: '#Movies', labelKey: 'movies', icon: Film, color: 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500 hover:text-rose-600 text-rose-500 dark:text-rose-400' },
  { id: '#Reading', labelKey: 'reading', icon: BookOpen, color: 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500 hover:text-blue-600 text-blue-500 dark:text-blue-400' },
  { id: '#Art', labelKey: 'art', icon: Palette, color: 'border-fuchsia-500/40 bg-fuchsia-500/5 hover:border-fuchsia-500 hover:text-fuchsia-600 text-fuchsia-500 dark:text-fuchsia-400' },
  { id: '#Hiking', labelKey: 'hiking', icon: Mountain, color: 'border-teal-500/40 bg-teal-500/5 hover:border-teal-500 hover:text-teal-600 text-teal-500 dark:text-teal-400' },
  { id: '#Yoga', labelKey: 'yoga', icon: Heart, color: 'border-rose-400/40 bg-rose-400/5 hover:border-rose-400 hover:text-rose-500 text-rose-400 dark:text-rose-300' },
  { id: '#Cycling', labelKey: 'cycling', icon: Bike, color: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:text-emerald-600 text-emerald-500 dark:text-emerald-400' },
  { id: '#Football', labelKey: 'football', icon: Trophy, color: 'border-amber-600/40 bg-amber-600/5 hover:border-amber-600 hover:text-amber-700 text-amber-600 dark:text-amber-500' },
  { id: '#Pets', labelKey: 'pets', icon: PawPrint, color: 'border-orange-400/40 bg-orange-400/5 hover:border-orange-400 hover:text-orange-500 text-orange-400 dark:text-orange-300' },
  { id: '#StreetFood', labelKey: 'streetFood', icon: Pizza, color: 'border-red-400/40 bg-red-400/5 hover:border-red-400 hover:text-red-500 text-red-400 dark:text-red-300' },
  { id: '#Fashion', labelKey: 'fashion', icon: Shirt, color: 'border-fuchsia-400/40 bg-fuchsia-400/5 hover:border-fuchsia-400 hover:text-fuchsia-500 text-fuchsia-400 dark:text-fuchsia-300' },
  { id: '#MentalHealth', labelKey: 'mentalHealth', icon: Brain, color: 'border-sky-500/40 bg-sky-500/5 hover:border-sky-500 hover:text-sky-600 text-sky-500 dark:text-sky-400' },
  { id: '#Entrepreneurship', labelKey: 'entrepreneurship', icon: Briefcase, color: 'border-stone-500/40 bg-stone-500/5 hover:border-stone-500 hover:text-stone-600 text-stone-500 dark:text-stone-400' },
  { id: '#SustainableLiving', labelKey: 'sustainableLiving', icon: Leaf, color: 'border-green-500/40 bg-green-500/5 hover:border-green-500 hover:text-green-600 text-green-500 dark:text-green-400' },
  { id: '#InteriorDesign', labelKey: 'interiorDesign', icon: Home, color: 'border-yellow-600/40 bg-yellow-600/5 hover:border-yellow-600 hover:text-yellow-700 text-yellow-600 dark:text-yellow-500' },
  { id: '#Basketball', labelKey: 'basketball', icon: Trophy, color: 'border-orange-600/40 bg-orange-600/5 hover:border-orange-600 hover:text-orange-700 text-orange-600 dark:text-orange-500' },
  { id: '#Baking', labelKey: 'baking', icon: Cookie, color: 'border-amber-400/40 bg-amber-400/5 hover:border-amber-400 hover:text-amber-500 text-amber-400 dark:text-amber-300' },
  { id: '#WebDevelopment', labelKey: 'webDevelopment', icon: Code, color: 'border-blue-600/40 bg-blue-600/5 hover:border-blue-600 hover:text-blue-700 text-blue-600 dark:text-blue-500' },
  { id: '#Cybersecurity', labelKey: 'cybersecurity', icon: Shield, color: 'border-slate-500/40 bg-slate-500/5 hover:border-slate-500 hover:text-slate-600 text-slate-500 dark:text-slate-400' },
  { id: '#MobileApps', labelKey: 'mobileApps', icon: Smartphone, color: 'border-indigo-400/40 bg-indigo-400/5 hover:border-indigo-400 hover:text-indigo-500 text-indigo-400 dark:text-indigo-300' },
  { id: '#WineTasting', labelKey: 'wineTasting', icon: Wine, color: 'border-purple-600/40 bg-purple-600/5 hover:border-purple-600 hover:text-purple-700 text-purple-600 dark:text-purple-500' },
  { id: '#Veganism', labelKey: 'veganism', icon: Leaf, color: 'border-lime-500/40 bg-lime-500/5 hover:border-lime-500 hover:text-lime-600 text-lime-500 dark:text-lime-400' }
] as const

export default function RegisterForm() {
  const { loginSuccess } = useAuth()
  const deviceId = getDeviceId()
  const navigate = useNavigate()
  const { text, t } = useAuthText()
  const [step, setStep] = useState<Step>('REGISTER')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const registerForm = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      initialInterests: []
    }
  })

  const verifyForm = useForm<RegisterVerifyRequest>({
    resolver: zodResolver(registerVerifyRequestSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
      deviceId,
      deviceType: DeviceType.Web
    }
  })

  const initiateRegistrationMutation = useInitiateRegistration()
  const verifyRegistrationMutation = useVerifyRegistration()

  const onGoToInterests = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await registerForm.trigger(['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'])
    if (isValid) {
      setStep('INTERESTS')
    }
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      let next: string[]
      const cleanId = id.toLowerCase().replace('#', '')
      const exists = prev.some((i) => i.toLowerCase().replace('#', '') === cleanId)
      if (exists) {
        next = prev.filter((i) => i.toLowerCase().replace('#', '') !== cleanId)
      } else {
        if (prev.length >= 10) return prev
        next = [...prev, id]
      }
      registerForm.setValue('initialInterests', next, { shouldValidate: true })
      return next
    })
  }

  const onHandleRegister = async (data: RegisterRequest) => {
    setIsSubmitting(true)
    const payload = {
      ...data,
      phoneNumber: data.phoneNumber?.trim() || undefined,
      initialInterests: selectedInterests
    }
    try {
      await initiateRegistrationMutation.mutateAsync(payload)
      setEmail(data.email)
      verifyForm.setValue('email', data.email)
      setStep('VERIFY')
    } catch (error) {
      const errorCode = getErrorCode(error)
      setStep('REGISTER')
      if (errorCode === ErrorCode.ACC_EMAIL_ALREADY_USED.toString()) {
        registerForm.setError('email', { message: getErrorMessage(error) })
      } else if (errorCode === ErrorCode.ACC_PHONE_NUMBER_ALREADY_USED.toString()) {
        registerForm.setError('phoneNumber', { message: getErrorMessage(error) })
      } else {
        handleErrorApi({ error, setError: registerForm.setError })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onHandleVerify = async (data: RegisterVerifyRequest) => {
    setIsSubmitting(true)
    try {
      const result = await verifyRegistrationMutation.mutateAsync(data)
      const { accessToken, refreshTokenExpirationMs } = result.data.data!
      toast.success(text.verifyOtp.success)
      await loginSuccess(accessToken, refreshTokenExpirationMs)

      navigate(PATHS.HOME)
    } catch (error) {
      setIsSubmitting(false)
      handleErrorApi({ error, setError: verifyForm.setError })
    }
  }

  return (
    <>
      {isSubmitting && <FullScreenLoading message={step === 'VERIFY' ? text.form.loggingIn : text.register.submitting} />}
      
      <div className='w-full max-w-[500px] bg-white dark:bg-card shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-none rounded-2xl overflow-hidden border border-gray-100 dark:border-border/30 transition-all duration-300'>
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-8 pt-6 pb-2 border-b border-gray-50/50 dark:border-border/10 select-none">
          <div className="flex items-center gap-1.5">
            <div className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              step === 'REGISTER' 
                ? 'bg-primary text-primary-foreground scale-110 shadow-sm' 
                : 'bg-primary/20 text-primary'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-medium transition-colors ${step === 'REGISTER' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('auth:auth.register.title')}
            </span>
          </div>
          <div className="h-px bg-gray-100 dark:bg-border/30 flex-1 mx-2.5" />
          <div className="flex items-center gap-1.5">
            <div className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              step === 'INTERESTS' 
                ? 'bg-primary text-primary-foreground scale-110 shadow-sm' 
                : step === 'VERIFY' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground dark:bg-muted/30'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-medium transition-colors ${step === 'INTERESTS' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('auth:auth.interests.title')}
            </span>
          </div>
          <div className="h-px bg-gray-100 dark:bg-border/30 flex-1 mx-2.5" />
          <div className="flex items-center gap-1.5">
            <div className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              step === 'VERIFY' 
                ? 'bg-primary text-primary-foreground scale-110 shadow-sm' 
                : 'bg-muted text-muted-foreground dark:bg-muted/30'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-medium transition-colors ${step === 'VERIFY' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('auth:auth.verifyOtp.title')}
            </span>
          </div>
        </div>

        <div className='p-8 bg-white dark:bg-card'>
          <AnimatePresence mode='wait'>
            {step === 'REGISTER' && (
              <motion.form
                key='register'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={onGoToInterests} 
                className='space-y-5 px-3'
              >
                <div className="space-y-1 text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {t('auth:auth.register.title')}
                  </h2>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {t('auth:auth.register.subtitle')}
                  </p>
                </div>

                <AuthInput
                  {...registerForm.register('fullName')}
                  icon={User}
                  placeholder={text.register.fullname}
                  error={
                    registerForm.formState.touchedFields.fullName ? registerForm.formState.errors.fullName : undefined
                  }
                />

                <AuthInput
                  {...registerForm.register('email')}
                  icon={Mail}
                  placeholder={text.register.email}
                  error={registerForm.formState.touchedFields.email ? registerForm.formState.errors.email : undefined}
                />

                <AuthInput
                  {...registerForm.register('phoneNumber')}
                  icon={Phone}
                  placeholder={text.register.phoneNumber}
                  error={
                    registerForm.formState.touchedFields.phoneNumber
                      ? registerForm.formState.errors.phoneNumber
                      : undefined
                  }
                />

                <AuthInput
                  {...registerForm.register('password')}
                  icon={Lock}
                  type='password'
                  placeholder={text.register.password}
                  autoComplete='new-password'
                  error={
                    registerForm.formState.touchedFields.password ? registerForm.formState.errors.password : undefined
                  }
                />

                <AuthInput
                  {...registerForm.register('confirmPassword')}
                  icon={Lock}
                  type='password'
                  placeholder={text.register.confirmPassword}
                  autoComplete='new-password'
                  error={
                    registerForm.formState.touchedFields.confirmPassword
                      ? registerForm.formState.errors.confirmPassword
                      : undefined
                  }
                />

                <div className='pt-2'>
                  <AuthButton
                    type="submit"
                    disabled={!registerForm.formState.isValid}
                  >
                    {t('auth:auth.forgotPassword.continue')}
                  </AuthButton>
                </div>
              </motion.form>
            )}

            {step === 'INTERESTS' && (
              <motion.div
                key='interests'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className='space-y-5 px-3'
              >
                <div className="space-y-1 text-center mb-5">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {t('auth:auth.interests.title')}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t('auth:auth.interests.subtitle')}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 select-none">
                    <span className="font-semibold text-primary">
                      {t('auth:auth.interests.selectCount', { count: selectedInterests.length })}
                    </span>
                    {selectedInterests.length === 0 && (
                      <span className="text-muted-foreground/80 font-normal">
                        ({text.interests?.optional})
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {INTEREST_OPTIONS.map((option) => {
                    const isSelected = selectedInterests.some(
                      (i) => i.toLowerCase().replace('#', '') === option.id.toLowerCase().replace('#', '')
                    )
                    const Icon = option.icon
                    
                    return (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleInterest(option.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group select-none ${
                          isSelected
                            ? option.color + ' border-current scale-[1.02] shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                            : 'bg-background hover:bg-muted/50 hover:border-muted-foreground/30 border-muted-foreground/15 text-foreground dark:border-border/80'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-white dark:bg-card shadow-sm transition-colors ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold leading-none mb-1">
                            {t(`auth:auth.interests.tags.${option.labelKey}`)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/75 font-medium font-mono">
                            {option.id}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 p-0.5 rounded-full bg-current text-white dark:text-card shadow-sm animate-in zoom-in-50 duration-150">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type='button'
                    onClick={() => setStep('REGISTER')}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-input bg-background hover:bg-accent text-sm font-medium transition-colors cursor-pointer select-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('auth:auth.interests.back')}
                  </button>
                  
                  <AuthButton
                    type="button"
                    onClick={registerForm.handleSubmit(onHandleRegister)}
                    isLoading={initiateRegistrationMutation.isPending}
                    loadingText={text.register.submitting}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {t('auth:auth.register.submit')}
                    <ArrowRight className="h-4 w-4" />
                  </AuthButton>
                </div>
              </motion.div>
            )}

            {step === 'VERIFY' && (
              <motion.div
                key='verify'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className='px-3'
              >
                <div className="space-y-1 text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {t('auth:auth.verifyOtp.title')}
                  </h2>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">
                    {t('auth:auth.verifyOtp.subtitle')}
                  </p>
                </div>

                <p className='text-[14px] font-normal text-foreground mb-8 text-center whitespace-pre-line px-5 leading-relaxed'>
                  {text.verifyOtp.instruction}
                  {'\n'}
                  <span className='font-semibold text-primary'>{email}</span>
                </p>

                <form onSubmit={verifyForm.handleSubmit(onHandleVerify)} className='space-y-6'>
                  <div className='w-full flex flex-col items-center space-y-4 mb-4'>
                    <div className='flex items-center justify-center gap-2 text-muted-foreground/80'>
                      <KeyRound className='h-4 w-4' strokeWidth={2} />
                      <span className='text-[14px] font-medium'>{text.verifyOtp.otp}</span>
                    </div>
                    <Controller
                      name='otp'
                      control={verifyForm.control}
                      render={({ field }) => (
                        <Field className='w-full items-center'>
                          <div className='flex justify-center w-full'>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup className='gap-2 justify-center'>
                                {[...Array(6)].map((_, i) => (
                                  <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className='size-11 text-lg rounded-lg border border-input shadow-none data-[active=true]:border-primary data-[active=true]:ring-primary/20 transition-all'
                                  />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <FieldError
                            errors={[
                              verifyForm.formState.touchedFields.otp ? verifyForm.formState.errors.otp : undefined
                            ]}
                          />
                        </Field>
                      )}
                    />
                  </div>

                  <div className='pt-2'>
                    <AuthButton
                      isLoading={verifyRegistrationMutation.isPending}
                      loadingText={text.verifyOtp.submitting}
                      disabled={!verifyForm.formState.isValid}
                    >
                      {text.verifyOtp.submit}
                    </AuthButton>
                  </div>
                </form>

                <div className='w-full text-center mt-6 select-none'>
                  <button
                    type='button'
                    className='text-xs text-primary hover:underline font-semibold transition-colors cursor-pointer'
                    onClick={() => toast.info('Tính năng đang phát triển')}
                  >
                    {text.verifyOtp.resend}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='mt-8 text-center border-t border-gray-100 dark:border-border/20 pt-6 mb-2 px-3'>
            {step === 'REGISTER' ? (
              <p className='text-sm text-muted-foreground select-none'>
                {text.register.hasAccount}{' '}
                <Link to={PATHS.AUTH.LOGIN} className='text-primary hover:underline font-bold transition-all'>
                  {text.register.loginNow}
                </Link>
              </p>
            ) : step === 'INTERESTS' ? (
              <button
                onClick={() => setStep('REGISTER')}
                className='flex items-center justify-center mx-auto text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium group cursor-pointer select-none'
              >
                <ChevronLeft className='mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
                {t('auth:auth.forgotPassword.back')}
              </button>
            ) : (
              <button
                onClick={() => setStep('INTERESTS')}
                className='flex items-center justify-center mx-auto text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium group cursor-pointer select-none'
              >
                <ChevronLeft className='mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
                Quay lại chọn sở thích
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
