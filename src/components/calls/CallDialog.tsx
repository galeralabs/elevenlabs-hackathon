import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { initiateOutboundCall } from '@/lib/callService'
import { Phone, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface ElderlyProfile {
  id: string
  first_name: string
  last_name: string
  preferred_name?: string | null
  phone_number: string
}

interface CallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  elderly: ElderlyProfile | null
}

type CallStatus = 'idle' | 'initiating' | 'success' | 'error'

export function CallDialog({ open, onOpenChange, elderly }: CallDialogProps) {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleInitiateCall = async () => {
    if (!elderly) return

    setStatus('initiating')
    setErrorMessage(null)

    const result = await initiateOutboundCall(elderly.id)

    if (result.success) {
      setStatus('success')
      toast.success(result.message || 'Rozmowa została zainicjowana')
      // Refresh calls data
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      queryClient.invalidateQueries({ queryKey: ['elderly-calls', elderly.id] })
      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false)
        setStatus('idle')
      }, 2000)
    } else {
      setStatus('error')
      setErrorMessage(result.error || 'Nie udało się zainicjować rozmowy')
      toast.error(result.error || 'Nie udało się zainicjować rozmowy')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setStatus('idle')
    setErrorMessage(null)
  }

  if (!elderly) return null

  const displayName = elderly.preferred_name || elderly.first_name

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Zadzwoń do {displayName}</DialogTitle>
          <DialogDescription>
            Zainicjuj rozmowę telefoniczną z {elderly.first_name} {elderly.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{elderly.phone_number}</p>
              <p className="text-sm text-muted-foreground">Numer telefonu</p>
            </div>
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <p>Rozmowa została zainicjowana. Agent dzwoni...</p>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <XCircle className="h-5 w-5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Anuluj
            </Button>
            <Button
              onClick={handleInitiateCall}
              disabled={status === 'initiating' || status === 'success'}
            >
              {status === 'initiating' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Łączenie...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Zainicjowano
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Zadzwoń
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
