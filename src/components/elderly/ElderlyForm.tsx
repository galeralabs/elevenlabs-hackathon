import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ElderlyProfile, ElderlyProfileInsert } from '@/types'

interface ElderlyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ElderlyProfileInsert) => void
  initialData?: ElderlyProfile
  isLoading?: boolean
}

type FormData = {
  first_name: string
  last_name: string
  preferred_name: string
  phone_number: string
  secondary_phone: string
  email: string
  date_of_birth: string
  address_line1: string
  city: string
  postal_code: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  medical_notes: string
  care_notes: string
  preferred_call_time: string
  call_frequency: string
  is_active: string
}

export function ElderlyForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ElderlyFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      first_name: initialData?.first_name ?? '',
      last_name: initialData?.last_name ?? '',
      preferred_name: initialData?.preferred_name ?? '',
      phone_number: initialData?.phone_number ?? '',
      secondary_phone: initialData?.secondary_phone ?? '',
      email: initialData?.email ?? '',
      date_of_birth: initialData?.date_of_birth ?? '',
      address_line1: initialData?.address_line1 ?? '',
      city: initialData?.city ?? '',
      postal_code: initialData?.postal_code ?? '',
      emergency_contact_name: initialData?.emergency_contact_name ?? '',
      emergency_contact_phone: initialData?.emergency_contact_phone ?? '',
      emergency_contact_relationship: initialData?.emergency_contact_relationship ?? '',
      medical_notes: initialData?.medical_notes ?? '',
      care_notes: initialData?.care_notes ?? '',
      preferred_call_time: initialData?.preferred_call_time ?? '10:00',
      call_frequency: initialData?.call_frequency ?? 'daily',
      is_active: initialData?.is_active ? 'true' : 'false',
    },
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      first_name: data.first_name,
      last_name: data.last_name,
      preferred_name: data.preferred_name || null,
      phone_number: data.phone_number,
      secondary_phone: data.secondary_phone || null,
      email: data.email || null,
      date_of_birth: data.date_of_birth || null,
      address_line1: data.address_line1 || null,
      city: data.city || null,
      postal_code: data.postal_code || null,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
      emergency_contact_relationship: data.emergency_contact_relationship || null,
      medical_notes: data.medical_notes || null,
      care_notes: data.care_notes || null,
      preferred_call_time: data.preferred_call_time,
      call_frequency: data.call_frequency,
      is_active: data.is_active === 'true',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edytuj podopiecznego' : 'Dodaj podopiecznego'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Dane podstawowe</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Imię *</Label>
                <Input
                  id="first_name"
                  {...register('first_name', { required: 'Imię jest wymagane' })}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nazwisko *</Label>
                <Input
                  id="last_name"
                  {...register('last_name', { required: 'Nazwisko jest wymagane' })}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_name">Preferowane zwracanie się</Label>
                <Input
                  id="preferred_name"
                  placeholder="np. Pani Maria"
                  {...register('preferred_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Data urodzenia</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Kontakt</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Telefon *</Label>
                <Input
                  id="phone_number"
                  placeholder="+48..."
                  {...register('phone_number', { required: 'Telefon jest wymagany' })}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">{errors.phone_number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_phone">Telefon dodatkowy</Label>
                <Input
                  id="secondary_phone"
                  placeholder="+48..."
                  {...register('secondary_phone')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-medium">Adres</h3>
            <div className="space-y-2">
              <Label htmlFor="address_line1">Adres</Label>
              <Input
                id="address_line1"
                placeholder="ul. Przykładowa 1/2"
                {...register('address_line1')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  {...register('city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Kod pocztowy</Label>
                <Input
                  id="postal_code"
                  placeholder="00-000"
                  {...register('postal_code')}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-medium">Kontakt alarmowy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Imię i nazwisko</Label>
                <Input
                  id="emergency_contact_name"
                  {...register('emergency_contact_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefon</Label>
                <Input
                  id="emergency_contact_phone"
                  placeholder="+48..."
                  {...register('emergency_contact_phone')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relationship">Relacja</Label>
              <Input
                id="emergency_contact_relationship"
                placeholder="np. córka, syn, sąsiad"
                {...register('emergency_contact_relationship')}
              />
            </div>
          </div>

          {/* Care Notes */}
          <div className="space-y-4">
            <h3 className="font-medium">Notatki</h3>
            <div className="space-y-2">
              <Label htmlFor="medical_notes">Notatki medyczne</Label>
              <Textarea
                id="medical_notes"
                placeholder="Istotne informacje medyczne..."
                {...register('medical_notes')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care_notes">Notatki o opiece</Label>
              <Textarea
                id="care_notes"
                placeholder="Preferencje, zainteresowania, uwagi..."
                {...register('care_notes')}
              />
            </div>
          </div>

          {/* Call Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Ustawienia rozmów</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_call_time">Preferowana godzina</Label>
                <Input
                  id="preferred_call_time"
                  type="time"
                  {...register('preferred_call_time')}
                />
              </div>
              <div className="space-y-2">
                <Label>Częstotliwość</Label>
                <Select
                  value={watch('call_frequency')}
                  onValueChange={(value) => setValue('call_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Codziennie</SelectItem>
                    <SelectItem value="weekly">Co tydzień</SelectItem>
                    <SelectItem value="biweekly">Co 2 tygodnie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watch('is_active')}
                  onValueChange={(value) => setValue('is_active', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktywny</SelectItem>
                    <SelectItem value="false">Nieaktywny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
