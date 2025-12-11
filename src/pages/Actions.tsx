import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useUrgentCalls } from '@/hooks/useCalls'
import { format } from 'date-fns'
import { Phone, User, Clock, MessageSquare } from 'lucide-react'

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'moderate':
      return 'bg-yellow-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'High'
    case 'moderate':
      return 'Moderate'
    default:
      return priority
  }
}

function getMoodColor(mood: string | null) {
  switch (mood) {
    case 'positive':
      return 'text-green-600'
    case 'neutral':
      return 'text-gray-600'
    case 'concerned':
      return 'text-orange-600'
    case 'urgent':
      return 'text-red-600'
    case 'sad':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

export function Actions() {
  const { data: urgentCalls, isLoading } = useUrgentCalls(50)

  return (
    <div className="flex flex-col">
      <Header
        title="Actions"
        description="Calls requiring attention and follow-up"
      />

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : urgentCalls && urgentCalls.length > 0 ? (
          <div className="rounded-md border divide-y">
            {urgentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(call.call_summary?.urgency_level ?? 'normal')}>
                      {getPriorityLabel(call.call_summary?.urgency_level ?? 'normal')}
                    </Badge>
                    <Link
                      to={`/elderly/${call.elderly_profile?.id}`}
                      className="font-medium hover:underline flex items-center gap-2"
                    >
                      {call.elderly_profile?.first_name} {call.elderly_profile?.last_name}
                    </Link>
                    {call.call_summary?.follow_up_required && (
                      <Badge variant="outline" className="text-xs">
                        Follow-up
                      </Badge>
                    )}
                  </div>

                  {call.call_summary?.transcript_summary && (
                    <p className={`text-sm mt-1 line-clamp-1 ${getMoodColor(call.call_summary.mood_assessment)}`}>
                      {call.call_summary.transcript_summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {call.initiated_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(call.initiated_at), 'MMM dd, HH:mm')}
                      </span>
                    )}
                    {call.elderly_profile?.phone_number && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {call.elderly_profile.phone_number}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/calls/${call.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Details
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/elderly/${call.elderly_profile?.id}`}>
                      <User className="h-4 w-4 mr-1" />
                      Profile
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border p-12 text-center text-muted-foreground">
            No calls requiring attention
          </div>
        )}
      </div>
    </div>
  )
}
