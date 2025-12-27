'use client'

import { useState, useEffect, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScoreSlider } from '@/components/ui/score-slider'
import { ScoreBadge } from '@/components/ui/score-badge'
import {
  ArrowLeft,
  Save,
  Edit2,
  X,
  Calendar,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { getLead, updateScorecard, addLeadNote, updateFollowUp } from '@/app/actions/leads'
import { isDemoMode, DEMO_LEADS, DEMO_SCORECARDS, RED_FLAGS } from '@/lib/demo-mode'

// BANT score descriptions
const BANT_DESCRIPTIONS = {
  budget: 'Does the prospect have the budget to purchase?',
  authority: 'Is this person a decision-maker or influencer?',
  need: 'How strong is their need for our solution?',
  timeline: 'How soon do they need a solution?',
  technicalFit: 'How well do we match their technical requirements?',
}

const NOTE_TYPES = [
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
]

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = params.id as string
  const [isPending, startTransition] = useTransition()

  // Check if edit mode from URL
  const editFromUrl = searchParams.get('edit') === 'true'

  // State
  const [isEditing, setIsEditing] = useState(false)

  // Sync edit state with URL
  useEffect(() => {
    setIsEditing(editFromUrl)
  }, [editFromUrl])
  const [lead, setLead] = useState<typeof DEMO_LEADS[0] | null>(null)
  const [scorecard, setScorecard] = useState<typeof DEMO_SCORECARDS[0] | null>(null)
  const [notes, setNotes] = useState<Array<{id: string; content: string; noteType: string; createdAt: string}>>([])
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable scores
  const [scores, setScores] = useState({
    budget: 3,
    authority: 3,
    need: 3,
    timeline: 3,
    technicalFit: 3,
  })

  // Notes for each BANT dimension
  const [bantNotes, setBantNotes] = useState({
    budget: '',
    authority: '',
    need: '',
    timeline: '',
    technicalFit: '',
  })

  // Red flags
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([])
  const [redFlagNotes, setRedFlagNotes] = useState('')

  // New note form
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('note')

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')

  // Load lead data
  useEffect(() => {
    async function loadLead() {
      setLoading(true)

      // Check if demo mode
      if (isDemoMode()) {
        const demoLead = DEMO_LEADS.find(l => l.id === leadId)
        const demoScorecard = DEMO_SCORECARDS.find(s => s.leadId === leadId)

        if (demoLead) {
          setLead(demoLead)
          if (demoScorecard) {
            setScorecard(demoScorecard)
            setScores({
              budget: demoScorecard.budget,
              authority: demoScorecard.authority,
              need: demoScorecard.need,
              timeline: demoScorecard.timeline,
              technicalFit: demoScorecard.technicalFit,
            })
            setBantNotes({
              budget: demoScorecard.budgetNotes || '',
              authority: demoScorecard.authorityNotes || '',
              need: demoScorecard.needNotes || '',
              timeline: demoScorecard.timelineNotes || '',
              technicalFit: demoScorecard.technicalFitNotes || '',
            })
            setSelectedRedFlags(demoScorecard.redFlags || [])
          }
        }
      } else {
        // Real data from server action
        const result = await getLead(leadId)
        if (result.success && result.lead) {
          setLead(result.lead as typeof DEMO_LEADS[0])
          if (result.scorecard) {
            setScorecard(result.scorecard as typeof DEMO_SCORECARDS[0])
          }
          if (result.notes) {
            setNotes(result.notes)
          }
        }
      }

      setLoading(false)
    }

    loadLead()
  }, [leadId])

  // Calculate total score
  const calculateTotalScore = () => {
    const total = (scores.budget + scores.authority + scores.need + scores.timeline + scores.technicalFit)
    const maxScore = 25
    const percentage = Math.round((total / maxScore) * 100)
    // Apply red flag penalty
    const penalty = selectedRedFlags.length * 5
    return Math.max(0, percentage - penalty)
  }

  // Determine recommendation
  const getRecommendation = (score: number): 'go' | 'review' | 'no_go' => {
    if (score >= 70) return 'go'
    if (score >= 50) return 'review'
    return 'no_go'
  }

  // Save scorecard
  const handleSaveScorecard = () => {
    const totalScore = calculateTotalScore()
    const recommendation = getRecommendation(totalScore)

    startTransition(async () => {
      const result = await updateScorecard({
        leadId,
        scores,
        notes: bantNotes,
        redFlags: selectedRedFlags,
        redFlagNotes,
        totalScore,
        recommendation,
      })

      if (result.success) {
        setSaveSuccess(true)
        setIsEditing(false)
        // Update local state
        if (lead) {
          setLead({ ...lead, score: totalScore, recommendation } as typeof lead)
        }
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    })
  }

  // Add note
  const handleAddNote = () => {
    if (!newNote.trim()) return

    startTransition(async () => {
      const result = await addLeadNote({
        leadId,
        content: newNote,
        noteType: noteType as 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'outcome',
      })

      if (result.success && result.note) {
        setNotes(prev => [result.note!, ...prev])
        setNewNote('')
        setNoteType('note')
      }
    })
  }

  // Update follow-up
  const handleUpdateFollowUp = () => {
    startTransition(async () => {
      await updateFollowUp({
        leadId,
        followUpDate: followUpDate || null,
        followUpNotes,
      })
    })
  }

  // Toggle red flag
  const toggleRedFlag = (flagId: string) => {
    setSelectedRedFlags(prev =>
      prev.includes(flagId)
        ? prev.filter(f => f !== flagId)
        : [...prev, flagId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." subtitle="" />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen">
        <Header title="Lead Not Found" subtitle="" />
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">The lead you're looking for doesn't exist.</p>
          <Link href="/leads">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalScore = calculateTotalScore()
  const recommendation = getRecommendation(totalScore)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={lead.companyName}
        subtitle={`${lead.contactName} • ${lead.contactEmail}`}
      />

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Back button and actions */}
        <div className="flex items-center justify-between">
          <Link href="/leads" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Link>

          <div className="flex gap-3">
            {saveSuccess && (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Saved successfully
              </span>
            )}

            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveScorecard} disabled={isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Scorecard
              </Button>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Scorecard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Score Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Qualification Score</h2>
                  <div className="flex items-center gap-4">
                    <ScoreBadge score={totalScore} size="lg" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      recommendation === 'go' ? 'bg-green-100 text-green-800' :
                      recommendation === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recommendation === 'go' ? 'GO' : recommendation === 'review' ? 'REVIEW' : 'NO GO'}
                    </span>
                  </div>
                </div>

                {/* BANT Scores */}
                <div className="space-y-6">
                  {(['budget', 'authority', 'need', 'timeline', 'technicalFit'] as const).map((dimension) => (
                    <div key={dimension} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <ScoreSlider
                        label={dimension === 'technicalFit' ? 'Technical Fit' : dimension.charAt(0).toUpperCase() + dimension.slice(1)}
                        value={scores[dimension]}
                        onChange={(val) => isEditing && setScores(prev => ({ ...prev, [dimension]: val }))}
                        description={BANT_DESCRIPTIONS[dimension]}
                      />

                      {isEditing ? (
                        <Textarea
                          placeholder={`Notes about ${dimension}...`}
                          value={bantNotes[dimension]}
                          onChange={(e) => setBantNotes(prev => ({ ...prev, [dimension]: e.target.value }))}
                          className="mt-3"
                          rows={2}
                        />
                      ) : bantNotes[dimension] && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {bantNotes[dimension]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Red Flags */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Red Flags</h2>
                  {selectedRedFlags.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {selectedRedFlags.length} selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RED_FLAGS.map((flag) => (
                    <button
                      key={flag.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleRedFlag(flag.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        selectedRedFlags.includes(flag.id)
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      } ${!isEditing && 'cursor-default opacity-75'}`}
                    >
                      {selectedRedFlags.includes(flag.id) ? (
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0" />
                      )}
                      <span className="text-sm">{flag.label}</span>
                    </button>
                  ))}
                </div>

                {isEditing && (
                  <Textarea
                    label="Additional red flag notes"
                    placeholder="Describe any concerns in detail..."
                    value={redFlagNotes}
                    onChange={(e) => setRedFlagNotes(e.target.value)}
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Notes & Follow-up */}
          <div className="space-y-6">
            {/* Follow-up */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Follow-up</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    type="date"
                    label="Follow-up Date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                  <Textarea
                    label="Notes"
                    placeholder="What to follow up on..."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    rows={2}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUpdateFollowUp}
                    disabled={isPending}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity / Notes */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
                </div>

                {/* Add Note Form */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2">
                    {NOTE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setNoteType(type.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          noteType === type.value
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <type.icon className="w-3 h-3" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddNote}
                    disabled={isPending || !newNote.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Notes Timeline */}
                <div className="space-y-4">
                  {notes.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">
                      No notes yet. Add your first note above.
                    </p>
                  ) : (
                    notes.map((note) => {
                      const NoteIcon = NOTE_TYPES.find(t => t.value === note.noteType)?.icon || MessageSquare
                      return (
                        <div key={note.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                              <NoteIcon className="w-4 h-4 text-violet-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{note.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lead Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Info</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Source</dt>
                    <dd className="text-gray-900 font-medium">{lead.source}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status</dt>
                    <dd className={`font-medium ${
                      lead.status === 'qualified' ? 'text-green-600' :
                      lead.status === 'disqualified' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
