export * from './database.types'

// Call status type
export type CallStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'missed'

// Issue category type
export type IssueCategory = 'health' | 'loneliness' | 'practical' | 'emergency' | 'other'

// Issue priority type
export type IssuePriority = 'low' | 'normal' | 'high' | 'urgent'

// Issue status type
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed'

// Mood assessment type
export type MoodAssessment = 'positive' | 'neutral' | 'concerned' | 'urgent'

// Urgency level type
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent'
