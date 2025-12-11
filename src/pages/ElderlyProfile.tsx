import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ElderlyForm } from '@/components/elderly/ElderlyForm'
import { CallDialog } from '@/components/calls/CallDialog'
import { useElderlyProfile, useUpdateElderlyProfile } from '@/hooks/useElderlyProfiles'
import { useElderlyCallHistory } from '@/hooks/useCalls'
import { useElderlyIssues } from '@/hooks/useIssues'
import type { ElderlyProfileUpdate } from '@/types'
import { format, differenceInYears } from 'date-fns'
import {
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  User,
  Heart,
  FileText,
  Pencil,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'

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
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'normal':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function ElderlyProfile() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = useState(searchParams.get('edit') === 'true')
  const [callOpen, setCallOpen] = useState(false)

  const { data: profile, isLoading: profileLoading } = useElderlyProfile(id!)
  const { data: calls, isLoading: callsLoading } = useElderlyCallHistory(id!)
  const { data: issues, isLoading: issuesLoading } = useElderlyIssues(id!)
  const updateMutation = useUpdateElderlyProfile()

  const handleUpdate = async (data: ElderlyProfileUpdate) => {
    try {
      await updateMutation.mutateAsync({ id: id!, updates: data })
      setEditOpen(false)
      setSearchParams({})
      toast.success('Profile has been updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const openIssuesCount = issues?.filter((i) => i.status === 'open').length ?? 0

  if (profileLoading) {
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

  if (!profile) {
    return (
      <div className="flex flex-col">
        <Header title="Not found" />
        <div className="p-6">
          <p>Elderly person not found</p>
          <Button asChild className="mt-4">
            <Link to="/elderly">Back to list</Link>
          </Button>
        </div>
      </div>
    )
  }

  const age = profile.date_of_birth
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : null

  return (
    <div className="flex flex-col">
      <Header
        title={`${profile.first_name} ${profile.last_name}`}
        action={{
          label: 'Edit',
          onClick: () => setEditOpen(true),
        }}
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/elderly">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {profile.first_name[0]}{profile.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    {profile.preferred_name || `${profile.first_name} ${profile.last_name}`}
                  </h2>
                  <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {age && (
                  <p className="text-muted-foreground mt-1">
                    {age} years old
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone_number}`} className="hover:underline">
                      {profile.phone_number}
                    </a>
                  </div>
                  {profile.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${profile.email}`} className="hover:underline">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {profile.address_line1 && `${profile.address_line1}, `}{profile.city}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Calls: {profile.preferred_call_time?.slice(0, 5)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setCallOpen(true)} size="sm">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button onClick={() => setEditOpen(true)} variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {profile.emergency_contact_name && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Emergency contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{profile.emergency_contact_name}</p>
                  {profile.emergency_contact_relationship && (
                    <p className="text-sm text-muted-foreground">
                      {profile.emergency_contact_relationship}
                    </p>
                  )}
                </div>
                {profile.emergency_contact_phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${profile.emergency_contact_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {profile.emergency_contact_phone}
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-2" />
              Information
            </TabsTrigger>
            <TabsTrigger value="calls">
              <Phone className="h-4 w-4 mr-2" />
              Calls ({calls?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="issues">
              <AlertCircle className="h-4 w-4 mr-2" />
              Issues ({openIssuesCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            {profile.medical_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Medical notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{profile.medical_notes}</p>
                </CardContent>
              </Card>
            )}

            {profile.care_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Care notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{profile.care_notes}</p>
                </CardContent>
              </Card>
            )}

            {!profile.medical_notes && !profile.care_notes && (
              <p className="text-muted-foreground text-center py-8">
                No additional notes
              </p>
            )}
          </TabsContent>

          <TabsContent value="calls" className="mt-4">
            {callsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : calls && calls.length > 0 ? (
              <div className="space-y-3">
                {calls.map((call) => (
                  <Card key={call.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(call.status)} variant="secondary">
                              {call.status === 'completed' ? 'Completed' :
                               call.status === 'missed' ? 'Missed' :
                               call.status === 'failed' ? 'Failed' : call.status}
                            </Badge>
                            {call.duration_secs && (
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(call.duration_secs / 60)} min {call.duration_secs % 60} s
                              </span>
                            )}
                          </div>
                          {call.call_summary?.transcript_summary && (
                            <p className="text-sm mt-2 line-clamp-2">
                              {call.call_summary.transcript_summary}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {call.initiated_at && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(call.initiated_at), 'MMM dd yyyy, HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No call history
              </p>
            )}
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            {issuesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : issues && issues.length > 0 ? (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card key={issue.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority === 'urgent' ? 'Urgent' :
                               issue.priority === 'high' ? 'High' :
                               issue.priority === 'normal' ? 'Normal' : 'Low'}
                            </Badge>
                            <Badge variant="outline">
                              {issue.status === 'open' ? 'Open' :
                               issue.status === 'in_progress' ? 'In progress' :
                               issue.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                            </Badge>
                          </div>
                          <p className="font-medium mt-2">{issue.title}</p>
                          {issue.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {issue.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(issue.created_at), 'MMM dd yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No issues
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ElderlyForm
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setSearchParams({})
        }}
        onSubmit={handleUpdate}
        initialData={profile}
        isLoading={updateMutation.isPending}
      />

      <CallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        elderly={profile}
      />
    </div>
  )
}
