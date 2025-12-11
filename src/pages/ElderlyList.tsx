import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { ElderlyForm } from '@/components/elderly/ElderlyForm'
import {
  useElderlyProfiles,
  useCreateElderlyProfile,
  useDeleteElderlyProfile,
} from '@/hooks/useElderlyProfiles'
import type { ElderlyProfileInsert } from '@/types'
import { Search, MoreHorizontal, Eye, Pencil, Trash2, Phone } from 'lucide-react'
import { toast } from 'sonner'

export function ElderlyList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const { data: elderly, isLoading } = useElderlyProfiles()
  const createMutation = useCreateElderlyProfile()
  const deleteMutation = useDeleteElderlyProfile()

  const filteredElderly = elderly?.filter((person) => {
    const query = searchQuery.toLowerCase()
    return (
      person.first_name.toLowerCase().includes(query) ||
      person.last_name.toLowerCase().includes(query) ||
      person.phone_number.includes(query)
    )
  })

  const handleCreate = async (data: ElderlyProfileInsert) => {
    try {
      await createMutation.mutateAsync(data)
      setFormOpen(false)
      toast.success('Podopieczny został dodany')
    } catch {
      toast.error('Nie udało się dodać podopiecznego')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć ${name}?`)) return

    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Podopieczny został usunięty')
    } catch {
      toast.error('Nie udało się usunąć podopiecznego')
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Podopieczni"
        description="Lista osób objętych opieką"
        action={{
          label: 'Dodaj podopiecznego',
          onClick: () => setFormOpen(true),
        }}
      />

      <div className="p-6">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj po imieniu, nazwisku lub telefonie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imię i nazwisko</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Miasto</TableHead>
                <TableHead>Preferowana godzina</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredElderly && filteredElderly.length > 0 ? (
                filteredElderly.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <Link
                        to={`/elderly/${person.id}`}
                        className="font-medium hover:underline"
                      >
                        {person.first_name} {person.last_name}
                      </Link>
                      {person.preferred_name && (
                        <p className="text-sm text-muted-foreground">
                          {person.preferred_name}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{person.phone_number}</TableCell>
                    <TableCell>{person.city || '-'}</TableCell>
                    <TableCell>{person.preferred_call_time?.slice(0, 5) || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={person.is_active ? 'default' : 'secondary'}>
                        {person.is_active ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
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
                            <Link to={`/elderly/${person.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Zobacz profil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/elderly/${person.id}?edit=true`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edytuj
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Zadzwoń teraz
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(person.id, `${person.first_name} ${person.last_name}`)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Nie znaleziono pasujących wyników' : 'Brak podopiecznych'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ElderlyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
