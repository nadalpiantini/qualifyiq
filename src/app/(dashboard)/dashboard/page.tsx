'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreBadge } from '@/components/ui/score-badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight
} from 'lucide-react'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-mode'

// Mock data - will be replaced with real data from Supabase
const stats = [
  {
    title: 'Total Leads',
    value: '248',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Qualified (GO)',
    value: '156',
    change: '+8%',
    changeType: 'positive' as const,
    icon: CheckCircle2,
  },
  {
    title: 'Disqualified (NO GO)',
    value: '67',
    change: '-5%',
    changeType: 'negative' as const,
    icon: XCircle,
  },
  {
    title: 'Avg. Score',
    value: '72',
    change: '+3',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
]

const recentLeads = [
  { id: 1, company: 'TechCorp Inc.', contact: 'John Smith', score: 85, status: 'go' },
  { id: 2, company: 'StartupXYZ', contact: 'Jane Doe', score: 45, status: 'no_go' },
  { id: 3, company: 'Enterprise Ltd.', contact: 'Bob Johnson', score: 62, status: 'review' },
  { id: 4, company: 'Agency Pro', contact: 'Alice Brown', score: 78, status: 'go' },
  { id: 5, company: 'SMB Solutions', contact: 'Charlie Wilson', score: 55, status: 'review' },
]

export default function DashboardPage() {
  const [reviewLeads, setReviewLeads] = useState<typeof DEMO_LEADS>([])

  useEffect(() => {
    // Get leads needing review/follow-up
    if (isDemoMode()) {
      const needsReview = DEMO_LEADS.filter(l => l.recommendation === 'review')
      setReviewLeads(needsReview)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        subtitle="Overview of your lead qualification metrics"
        action={{
          label: 'New Scorecard',
          href: '/scorecard',
          dataTour: 'new-scorecard'
        }}
      />

      <div className="p-6 space-y-6">
        {/* Follow-up Reminders Widget */}
        {reviewLeads.length > 0 && (
          <Card data-tour="follow-up-widget" className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Leads Needing Follow-up</CardTitle>
                    <p className="text-sm text-gray-600">These REVIEW leads need your attention</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {reviewLeads.length} pending
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewLeads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.companyName}</p>
                        <p className="text-sm text-gray-500">{lead.contactName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={lead.score} size="sm" />
                      <Link href={`/leads/${lead.id}`}>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-1" />
                          Follow up
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {reviewLeads.length > 3 && (
                <Link href="/leads?filter=review" className="block mt-4">
                  <Button variant="ghost" className="w-full text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100">
                    View all {reviewLeads.length} leads needing review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div data-tour="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{stat.change} from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    stat.title === 'Disqualified (NO GO)' ? 'bg-red-100' : 'bg-violet-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.title === 'Disqualified (NO GO)' ? 'text-red-600' : 'text-violet-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{lead.company}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{lead.contact}</td>
                      <td className="py-4 px-4">
                        <ScoreBadge score={lead.score} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'go' ? 'bg-green-100 text-green-800' :
                          lead.status === 'no_go' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status === 'go' ? 'GO' : lead.status === 'no_go' ? 'NO GO' : 'REVIEW'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/leads/demo-lead-${lead.id}`}
                          className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">GO (70-100)</span>
                    <span className="font-medium">63%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '63%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">REVIEW (50-69)</span>
                    <span className="font-medium">27%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '27%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">NO GO (0-49)</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prediction Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-violet-100 mb-4">
                  <span className="text-4xl font-bold text-violet-600">87%</span>
                </div>
                <p className="text-gray-600">
                  Of leads scored as GO became successful clients
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Based on 142 completed deals
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
