import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useElderlyProfiles } from '@/hooks/useElderlyProfiles'
import { useRecentCalls, useUrgentCalls } from '@/hooks/useCalls'
import { format } from 'date-fns'
import { Phone, AlertCircle, Clock, Users } from 'lucide-react'

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'normal':
      return 'bg-blue-500 text-white'
    case 'low':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-500 text-white'
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
    default:
      return 'text-gray-600'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'missed':
      return 'bg-red-100 text-red-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'scheduled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function Dashboard() {
  const { data: elderly, isLoading: elderlyLoading } = useElderlyProfiles({ activeOnly: true })
  const { data: recentCalls, isLoading: callsLoading } = useRecentCalls(5)
  const { data: urgentCalls, isLoading: urgentCallsLoading } = useUrgentCalls(5)

  const activeCount = elderly?.length ?? 0
  const completedToday = recentCalls?.filter(c => c.status === 'completed').length ?? 0
  const urgentCallsCount = urgentCalls?.length ?? 0
  const criticalCalls = urgentCalls?.filter(c => c.call_summary?.urgency_level === 'urgent').length ?? 0

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Care system overview"
      />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active elderly</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {elderlyLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{activeCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calls today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{completedToday}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Needs attention</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {urgentCallsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{urgentCallsCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Urgent matters</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {urgentCallsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-red-600">{criticalCalls}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent calls
                <Link to="/calls" className="text-sm font-normal text-primary hover:underline">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentCalls && recentCalls.length > 0 ? (
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/elderly/${call.elderly_profile?.id}`}
                            className="font-medium hover:underline"
                          >
                            {call.elderly_profile?.first_name} {call.elderly_profile?.last_name}
                          </Link>
                          <Badge className={getStatusColor(call.status)} variant="secondary">
                            {call.status === 'completed' ? 'Completed' :
                             call.status === 'missed' ? 'Missed' :
                             call.status === 'failed' ? 'Failed' : call.status}
                          </Badge>
                        </div>
                        {call.call_summary?.transcript_summary && (
                          <p className={`text-sm mt-1 line-clamp-1 ${getMoodColor(call.call_summary.mood_assessment)}`}>
                            {call.call_summary.transcript_summary}
                          </p>
                        )}
                        {call.initiated_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(call.initiated_at), 'MMM dd, HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent calls
                </p>
              )}
            </CardContent>
          </Card>

          {/* Calls Needing Attention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Needs attention
                <Link to="/calls" className="text-sm font-normal text-primary hover:underline">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentCallsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : urgentCalls && urgentCalls.length > 0 ? (
                <div className="space-y-3">
                  {urgentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(call.call_summary?.urgency_level ?? 'normal')}>
                            {call.call_summary?.urgency_level === 'urgent' ? 'Urgent' : 'High'}
                          </Badge>
                          <Link
                            to={`/elderly/${call.elderly_profile?.id}`}
                            className="font-medium hover:underline"
                          >
                            {call.elderly_profile?.first_name} {call.elderly_profile?.last_name}
                          </Link>
                        </div>
                        {call.call_summary?.transcript_summary && (
                          <p className={`text-sm mt-1 line-clamp-2 ${getMoodColor(call.call_summary.mood_assessment)}`}>
                            {call.call_summary.transcript_summary}
                          </p>
                        )}
                        {call.initiated_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(call.initiated_at), 'MMM dd, HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No calls needing attention
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
