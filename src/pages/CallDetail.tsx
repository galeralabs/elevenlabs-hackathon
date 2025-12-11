import { useParams, Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCall } from '@/hooks/useCalls'
import { format } from 'date-fns'
import { ArrowLeft, Clock, User, Phone } from 'lucide-react'

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'missed':
      return 'bg-red-100 text-red-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'missed':
      return 'Missed'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

function getMoodLabel(mood: string | null) {
  switch (mood) {
    case 'positive':
      return 'Positive'
    case 'neutral':
      return 'Neutral'
    case 'concerned':
      return 'Concerned'
    case 'urgent':
      return 'Urgent'
    default:
      return '-'
  }
}

export function CallDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: call, isLoading } = useCall(id!)

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Loading..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!call) {
    return (
      <div className="flex flex-col">
        <Header title="Not found" />
        <div className="p-6">
          <p>Call not found</p>
          <Button asChild className="mt-4">
            <Link to="/calls">Back to list</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header title="Call details" />

      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/calls">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        </Button>

        {/* Call Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Call information</span>
              <Badge className={getStatusColor(call.status)} variant="secondary">
                {getStatusLabel(call.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Elderly person</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to={`/elderly/${call.elderly_profile?.id}`}
                    className="font-medium hover:underline"
                  >
                    {call.elderly_profile?.first_name} {call.elderly_profile?.last_name}
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {call.initiated_at
                      ? format(new Date(call.initiated_at), 'MMM dd yyyy, HH:mm')
                      : '-'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium mt-1">
                  {call.duration_secs
                    ? `${Math.floor(call.duration_secs / 60)}:${String(call.duration_secs % 60).padStart(2, '0')}`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium mt-1">
                  {call.call_type === 'scheduled' ? 'Scheduled' : 'Manual'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {call.call_summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mood</p>
                  <p className="font-medium mt-1">{getMoodLabel(call.call_summary.mood_assessment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <p className="font-medium mt-1">{call.call_summary.urgency_level || 'Normal'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requires follow-up</p>
                  <p className="font-medium mt-1">
                    {call.call_summary.follow_up_required ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {call.call_summary.transcript_summary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Call summary</p>
                  <p className="bg-muted p-4 rounded-lg">{call.call_summary.transcript_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        {call.elderly_profile && (
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <a href={`tel:${call.elderly_profile.phone_number}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {call.elderly_profile.phone_number}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/elderly/${call.elderly_profile.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
