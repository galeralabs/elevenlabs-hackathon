import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCalls } from '@/hooks/useCalls'
import { format } from 'date-fns'
import { Clock, MessageSquare } from 'lucide-react'

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

function getStatusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'missed':
      return 'Missed'
    case 'failed':
      return 'Failed'
    case 'in_progress':
      return 'In progress'
    case 'scheduled':
      return 'Scheduled'
    default:
      return status
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

export function CallHistory() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: calls, isLoading } = useCalls({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  return (
    <div className="flex flex-col">
      <Header
        title="Call history"
        description="All calls with elderly people"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Elderly person</TableHead>
                <TableHead>Date & time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : calls && calls.length > 0 ? (
                calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <Link
                        to={`/elderly/${call.elderly_profile?.id}`}
                        className="font-medium hover:underline"
                      >
                        {call.elderly_profile?.first_name} {call.elderly_profile?.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {call.initiated_at ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(call.initiated_at), 'MMM dd yyyy, HH:mm')}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)} variant="secondary">
                        {getStatusLabel(call.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {call.duration_secs ? (
                        <span className="text-sm">
                          {Math.floor(call.duration_secs / 60)}:{String(call.duration_secs % 60).padStart(2, '0')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {call.call_summary?.transcript_summary ? (
                        <p className={`text-sm line-clamp-2 ${getMoodColor(call.call_summary.mood_assessment)}`}>
                          {call.call_summary.transcript_summary}
                        </p>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/calls/${call.id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No calls to display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
