'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScoreSlider } from '@/components/ui/score-slider'
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Save, Loader2 } from 'lucide-react'
import { saveScorecard } from '@/app/actions/scorecard'

const RED_FLAGS = [
  { id: 'unrealistic_timeline', label: 'Unrealistic timeline expectations' },
  { id: 'budget_unclear', label: 'Budget unclear or undefined' },
  { id: 'multiple_decision_makers', label: 'Too many decision makers' },
  { id: 'scope_creep_history', label: 'History of scope creep' },
  { id: 'poor_communication', label: 'Poor communication in initial contact' },
  { id: 'unrealistic_expectations', label: 'Unrealistic outcome expectations' },
  { id: 'price_focused', label: 'Primarily price-focused' },
  { id: 'previous_vendor_issues', label: 'Issues with previous vendors' },
]

export default function ScorecardPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [leadInfo, setLeadInfo] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    source: '',
  })
  const [scores, setScores] = useState({
    budget: 3,
    authority: 3,
    need: 3,
    timeline: 3,
    technicalFit: 3,
  })
  const [notes, setNotes] = useState({
    budget: '',
    authority: '',
    need: '',
    timeline: '',
    technicalFit: '',
  })
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [redFlagNotes, setRedFlagNotes] = useState('')

  // Calculate total score (weighted) - weights MUST sum to 1.0
  const calculateScore = () => {
    const weights = {
      budget: 0.20,      // 20% - Financial readiness
      authority: 0.20,   // 20% - Decision maker access (was 15%)
      need: 0.25,        // 25% - Problem urgency (highest weight)
      timeline: 0.15,    // 15% - Implementation timeline
      technicalFit: 0.20, // 20% - Solution compatibility (was 15%)
    } // Total: 100%

    const baseScore = (
      scores.budget * weights.budget +
      scores.authority * weights.authority +
      scores.need * weights.need +
      scores.timeline * weights.timeline +
      scores.technicalFit * weights.technicalFit
    ) * 20 // Convert 1-5 scale to 0-100

    // Reduce score based on red flags
    const redFlagPenalty = redFlags.length * 5
    return Math.max(0, Math.round(baseScore - redFlagPenalty))
  }

  const totalScore = calculateScore()

  const getRecommendation = (score: number) => {
    if (score >= 70) return { label: 'GO', color: 'green', icon: CheckCircle2 }
    if (score >= 50) return { label: 'REVIEW', color: 'yellow', icon: AlertTriangle }
    return { label: 'NO GO', color: 'red', icon: XCircle }
  }

  const recommendation = getRecommendation(totalScore)

  const toggleRedFlag = (id: string) => {
    setRedFlags(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    setError(null)

    startTransition(async () => {
      const result = await saveScorecard({
        leadInfo,
        scores,
        notes,
        redFlags,
        redFlagNotes: redFlagNotes || '',
        totalScore,
        recommendation: recommendation.label.toLowerCase() as 'go' | 'review' | 'no_go',
      })

      if (result.success) {
        toast.success('Scorecard saved!', {
          description: `${leadInfo.companyName || 'Lead'} has been qualified with a ${recommendation.label} recommendation.`,
        })
        router.push(`/leads?created=${result.leadId}`)
      } else {
        const errorMsg = result.error || 'Failed to save scorecard'
        setError(errorMsg)
        toast.error('Failed to save scorecard', {
          description: errorMsg,
        })
      }
    })
  }

  return (
    <div className="min-h-screen">
      <Header
        title="New Scorecard"
        subtitle="Qualify your lead with structured assessment"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-violet-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Lead Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
                <CardDescription>
                  Basic information about the lead you&apos;re qualifying
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name"
                  value={leadInfo.companyName}
                  onChange={(e) => setLeadInfo({ ...leadInfo, companyName: e.target.value })}
                  placeholder="e.g., TechCorp Inc."
                />
                <Input
                  label="Contact Name"
                  value={leadInfo.contactName}
                  onChange={(e) => setLeadInfo({ ...leadInfo, contactName: e.target.value })}
                  placeholder="e.g., John Smith"
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={leadInfo.contactEmail}
                  onChange={(e) => setLeadInfo({ ...leadInfo, contactEmail: e.target.value })}
                  placeholder="e.g., john@techcorp.com"
                />
                <Input
                  label="Lead Source"
                  value={leadInfo.source}
                  onChange={(e) => setLeadInfo({ ...leadInfo, source: e.target.value })}
                  placeholder="e.g., Website, Referral, LinkedIn"
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)}>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: BANT Scoring */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>BANT Assessment</CardTitle>
                <CardDescription>
                  Score the lead on Budget, Authority, Need, and Timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <ScoreSlider
                    label="💰 Budget"
                    value={scores.budget}
                    onChange={(v) => setScores({ ...scores, budget: v })}
                    description="Does the prospect have budget allocated for this solution?"
                    labels={['No budget', 'Exploring', 'Budget planned', 'Approved', 'Ready to spend']}
                  />
                  <Textarea
                    placeholder="Notes about budget..."
                    value={notes.budget}
                    onChange={(e) => setNotes({ ...notes, budget: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-6">
                  <ScoreSlider
                    label="👤 Authority"
                    value={scores.authority}
                    onChange={(v) => setScores({ ...scores, authority: v })}
                    description="Are you talking to the decision maker?"
                    labels={['No access', 'Influencer', 'Recommender', 'Co-decider', 'Final decider']}
                  />
                  <Textarea
                    placeholder="Notes about decision-making authority..."
                    value={notes.authority}
                    onChange={(e) => setNotes({ ...notes, authority: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-6">
                  <ScoreSlider
                    label="🎯 Need"
                    value={scores.need}
                    onChange={(v) => setScores({ ...scores, need: v })}
                    description="How urgent and real is their need?"
                    labels={['No need', 'Nice to have', 'Important', 'Urgent', 'Critical']}
                  />
                  <Textarea
                    placeholder="Notes about their need..."
                    value={notes.need}
                    onChange={(e) => setNotes({ ...notes, need: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-6">
                  <ScoreSlider
                    label="⏰ Timeline"
                    value={scores.timeline}
                    onChange={(v) => setScores({ ...scores, timeline: v })}
                    description="When do they need a solution?"
                    labels={['No timeline', '12+ months', '6-12 months', '3-6 months', 'Immediate']}
                  />
                  <Textarea
                    placeholder="Notes about timeline..."
                    value={notes.timeline}
                    onChange={(e) => setNotes({ ...notes, timeline: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Technical Fit & Red Flags */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Fit & Red Flags</CardTitle>
                <CardDescription>
                  Assess technical compatibility and identify warning signs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <ScoreSlider
                    label="🔧 Technical Fit"
                    value={scores.technicalFit}
                    onChange={(v) => setScores({ ...scores, technicalFit: v })}
                    description="Can we actually solve their problem with our solution?"
                    labels={['Cannot solve', 'Major gaps', 'Partial fit', 'Good fit', 'Perfect fit']}
                  />
                  <Textarea
                    placeholder="Notes about technical fit..."
                    value={notes.technicalFit}
                    onChange={(e) => setNotes({ ...notes, technicalFit: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    🚩 Red Flags (select all that apply)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {RED_FLAGS.map((flag) => (
                      <button
                        key={flag.id}
                        type="button"
                        onClick={() => toggleRedFlag(flag.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          redFlags.includes(flag.id)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <span className="text-sm font-medium">{flag.label}</span>
                      </button>
                    ))}
                  </div>
                  <Textarea
                    label="Additional red flag notes"
                    placeholder="Any other concerns or observations..."
                    value={redFlagNotes}
                    onChange={(e) => setRedFlagNotes(e.target.value)}
                    className="mt-4"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)}>
                    Review Score <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Qualification Results</CardTitle>
                <CardDescription>
                  Review the assessment and save the scorecard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Score Display */}
                <div className={`p-8 rounded-xl mb-6 text-center ${
                  recommendation.color === 'green' ? 'bg-green-50 border-2 border-green-200' :
                  recommendation.color === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
                  'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-4">
                    <span className={`text-4xl font-bold ${
                      recommendation.color === 'green' ? 'text-green-600' :
                      recommendation.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {totalScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <recommendation.icon className={`w-6 h-6 ${
                      recommendation.color === 'green' ? 'text-green-600' :
                      recommendation.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                    <span className={`text-2xl font-bold ${
                      recommendation.color === 'green' ? 'text-green-600' :
                      recommendation.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {recommendation.label}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {recommendation.label === 'GO' && 'This lead shows strong potential. Proceed with confidence.'}
                    {recommendation.label === 'REVIEW' && 'This lead needs further evaluation. Consider involving an SME.'}
                    {recommendation.label === 'NO GO' && 'This lead has significant risks. Recommend declining or major negotiation.'}
                  </p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.budget}</div>
                    <div className="text-xs text-gray-500">Budget</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.authority}</div>
                    <div className="text-xs text-gray-500">Authority</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.need}</div>
                    <div className="text-xs text-gray-500">Need</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.timeline}</div>
                    <div className="text-xs text-gray-500">Timeline</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{scores.technicalFit}</div>
                    <div className="text-xs text-gray-500">Tech Fit</div>
                  </div>
                </div>

                {/* Red Flags */}
                {redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-red-700 mb-2">
                      🚩 {redFlags.length} Red Flag{redFlags.length > 1 ? 's' : ''} Identified
                    </h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {redFlags.map((flagId) => {
                        const flag = RED_FLAGS.find(f => f.id === flagId)
                        return flag ? <li key={flagId}>• {flag.label}</li> : null
                      })}
                    </ul>
                  </div>
                )}

                {/* Lead Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Lead Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Company:</span>{' '}
                      <span className="font-medium">{leadInfo.companyName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Contact:</span>{' '}
                      <span className="font-medium">{leadInfo.contactName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="font-medium">{leadInfo.contactEmail || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Source:</span>{' '}
                      <span className="font-medium">{leadInfo.source || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(3)} disabled={isPending}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 w-4 h-4" />
                        Save Scorecard
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
