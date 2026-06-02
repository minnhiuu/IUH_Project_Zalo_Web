import { useState, useEffect } from 'react'
import { 
  Code, Music, Trophy, Compass, Utensils, Gamepad, Palette, Shirt, Film, Check, Loader2,
  Camera, Dumbbell, Coffee, Sparkles, BookOpen, Mountain, Heart, Bike, PawPrint, Pizza, Brain, Briefcase, Leaf, Home, Cookie, Shield, Smartphone, Wine
} from 'lucide-react'
import { toast } from 'sonner'

import { useMyProfile } from '@/features/user/queries/use-queries'
import { useUpdateProfileMutation } from '@/features/user/queries/use-mutations'
import { useUserText } from '@/features/user/i18n/use-user-text'
import { Button } from '@/components/ui/button'
import { ActionRow } from './action-row'
import { cn } from '@/lib/utils'

const INTEREST_OPTIONS = [
  { id: '#Travel', labelKey: 'travel', icon: Compass },
  { id: '#Photography', labelKey: 'photography', icon: Camera },
  { id: '#Fitness', labelKey: 'fitness', icon: Dumbbell },
  { id: '#Cooking', labelKey: 'cooking', icon: Utensils },
  { id: '#Coffee', labelKey: 'coffee', icon: Coffee },
  { id: '#Technology', labelKey: 'technology', icon: Code },
  { id: '#ArtificialIntelligence', labelKey: 'artificialIntelligence', icon: Sparkles },
  { id: '#Gaming', labelKey: 'gaming', icon: Gamepad },
  { id: '#Music', labelKey: 'music', icon: Music },
  { id: '#Movies', labelKey: 'movies', icon: Film },
  { id: '#Reading', labelKey: 'reading', icon: BookOpen },
  { id: '#Art', labelKey: 'art', icon: Palette },
  { id: '#Hiking', labelKey: 'hiking', icon: Mountain },
  { id: '#Yoga', labelKey: 'yoga', icon: Heart },
  { id: '#Cycling', labelKey: 'cycling', icon: Bike },
  { id: '#Football', labelKey: 'football', icon: Trophy },
  { id: '#Pets', labelKey: 'pets', icon: PawPrint },
  { id: '#StreetFood', labelKey: 'streetFood', icon: Pizza },
  { id: '#Fashion', labelKey: 'fashion', icon: Shirt },
  { id: '#MentalHealth', labelKey: 'mentalHealth', icon: Brain },
  { id: '#Entrepreneurship', labelKey: 'entrepreneurship', icon: Briefcase },
  { id: '#SustainableLiving', labelKey: 'sustainableLiving', icon: Leaf },
  { id: '#InteriorDesign', labelKey: 'interiorDesign', icon: Home },
  { id: '#Basketball', labelKey: 'basketball', icon: Trophy },
  { id: '#Baking', labelKey: 'baking', icon: Cookie },
  { id: '#WebDevelopment', labelKey: 'webDevelopment', icon: Code },
  { id: '#Cybersecurity', labelKey: 'cybersecurity', icon: Shield },
  { id: '#MobileApps', labelKey: 'mobileApps', icon: Smartphone },
  { id: '#WineTasting', labelKey: 'wineTasting', icon: Wine },
  { id: '#Veganism', labelKey: 'veganism', icon: Leaf }
] as const

export function InterestsSettings() {
  const { text, t } = useUserText()
  const { data: user, isLoading } = useMyProfile()
  const updateProfileMutation = useUpdateProfileMutation()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  useEffect(() => {
    if (user?.initialInterests) {
      setSelectedInterests(user.initialInterests)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const cleanId = id.toLowerCase().replace('#', '')
      const exists = prev.some((i) => i.toLowerCase().replace('#', '') === cleanId)
      if (exists) {
        return prev.filter((i) => i.toLowerCase().replace('#', '') !== cleanId)
      } else {
        if (prev.length >= 10) {
          toast.error(text.settings.interests.interestsMax)
          return prev
        }
        return [...prev, id]
      }
    })
  }

  // Detect unsaved changes (case/prefix-insensitive)
  const isChanged = (() => {
    const saved = user?.initialInterests || []
    if (saved.length !== selectedInterests.length) return true
    const savedSet = new Set(saved.map(i => i.toLowerCase().replace('#', '')))
    return selectedInterests.some((i) => !savedSet.has(i.toLowerCase().replace('#', '')))
  })()

  const handleSave = () => {
    if (!user) return

    const updateData = {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || 'MALE',
      dob: user.dob || new Date().toISOString().split('T')[0],
      bio: user.bio || '',
      initialInterests: selectedInterests
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success(text.settings.interests.success)
      },
      onError: () => {
        toast.error(text.settings.interests.error || 'Failed to update interests')
      }
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{text.settings.interests.title}</h2>

      <ActionRow
        title={text.settings.interests.title}
        description={text.settings.interests.description}
        titleClassName="font-semibold"
      >
        <div className="flex flex-col gap-4 mt-3">
          {/* Compact Selection Progress Bar */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 select-none">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {t('user:user.settings.interests.selectCount', { count: selectedInterests.length })}
            </span>
            <div className="w-32 bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${(selectedInterests.length / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Denser Flat-themed Grid of Interest Tag Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1.5 custom-scrollbar">
            {INTEREST_OPTIONS.map((option) => {
              const isSelected = selectedInterests.some(
                (i) => i.toLowerCase().replace('#', '') === option.id.toLowerCase().replace('#', '')
              )
              const Icon = option.icon
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  disabled={updateProfileMutation.isPending}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-3 rounded-lg border text-left transition-all hover:bg-muted/50 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  )}
                >
                  {/* Clean Icon Container */}
                  <div className={cn(
                    'p-2 rounded-md transition-colors',
                    isSelected 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Text Information */}
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-xs font-semibold leading-none mb-1 text-foreground truncate w-full">
                      {t('user:user.settings.interests.tags.' + option.labelKey)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate w-full">
                      {option.id}
                    </span>
                  </div>

                  {/* Absolute Check Circle Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                      <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Flat-styled Footer controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/40 select-none">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {text.settings.interests.footerNote || 'Choose up to 10 tags to curate your feed.'}
            </p>

            <div className="flex items-center gap-3 self-end">
              {selectedInterests.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedInterests([])}
                  disabled={updateProfileMutation.isPending}
                  className="h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {text.settings.interests.reset || 'Reset Selection'}
                </Button>
              )}

              <Button
                onClick={handleSave}
                disabled={!isChanged || updateProfileMutation.isPending}
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    {text.settings.interests.saving}
                  </>
                ) : (
                  text.settings.interests.save
                )}
              </Button>
            </div>
          </div>
        </div>
      </ActionRow>
    </div>
  )
}
