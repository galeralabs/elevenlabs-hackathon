import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIssues, useUpdateIssue } from '@/hooks/useIssues'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { MoreHorizontal, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'

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

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'Pilne'
    case 'high':
      return 'Wysokie'
    case 'normal':
      return 'Normalne'
    case 'low':
      return 'Niskie'
    default:
      return priority
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    case 'dismissed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'open':
      return 'Otwarte'
    case 'in_progress':
      return 'W trakcie'
    case 'resolved':
      return 'Rozwiązane'
    case 'dismissed':
      return 'Odrzucone'
    default:
      return status
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'health':
      return 'Zdrowie'
    case 'loneliness':
      return 'Samotność'
    case 'practical':
      return 'Praktyczne'
    case 'emergency':
      return 'Pilne'
    case 'other':
      return 'Inne'
    default:
      return category
  }
}

export function IssuesList() {
  const [statusFilter, setStatusFilter] = useState<string>('open')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const { data: issues, isLoading } = useIssues({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  })

  const updateMutation = useUpdateIssue()

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
        },
      })
      toast.success('Status zgłoszenia został zaktualizowany')
    } catch {
      toast.error('Nie udało się zaktualizować statusu')
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Zgłoszenia"
        description="Problemy i prośby podopiecznych"
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="open">Otwarte</SelectItem>
              <SelectItem value="in_progress">W trakcie</SelectItem>
              <SelectItem value="resolved">Rozwiązane</SelectItem>
              <SelectItem value="dismissed">Odrzucone</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorytet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie priorytety</SelectItem>
              <SelectItem value="urgent">Pilne</SelectItem>
              <SelectItem value="high">Wysokie</SelectItem>
              <SelectItem value="normal">Normalne</SelectItem>
              <SelectItem value="low">Niskie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priorytet</TableHead>
                <TableHead>Tytuł</TableHead>
                <TableHead>Podopieczny</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {getPriorityLabel(issue.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        {issue.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/elderly/${issue.elderly_profile?.id}`}
                        className="hover:underline"
                      >
                        {issue.elderly_profile?.first_name} {issue.elderly_profile?.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(issue.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(issue.status)} variant="secondary">
                        {getStatusLabel(issue.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(issue.created_at), 'dd MMM yyyy', { locale: pl })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/elderly/${issue.elderly_profile?.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Zobacz profil
                            </Link>
                          </DropdownMenuItem>
                          {issue.status !== 'in_progress' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(issue.id, 'in_progress')}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Oznacz jako w trakcie
                            </DropdownMenuItem>
                          )}
                          {issue.status !== 'resolved' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(issue.id, 'resolved')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Oznacz jako rozwiązane
                            </DropdownMenuItem>
                          )}
                          {issue.status !== 'dismissed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(issue.id, 'dismissed')}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Odrzuć
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Brak zgłoszeń do wyświetlenia
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
