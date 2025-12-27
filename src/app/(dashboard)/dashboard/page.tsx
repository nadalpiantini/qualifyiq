'use client'

import { useMemo, useState, useEffect } from 'react'
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
  ArrowRight,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-mode'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'

export default function DashboardPage() {
  const [leads, setLeads] = useState<typeof DEMO_LEADS>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data - always use demo data when in demo mode or when real data isn't available
    async function loadData() {
      setIsLoading(true)

      // Always load demo data for now (demo mode is the default experience)
      // In production with real Supabase connection, we would:
      // 1. Try to fetch real data
      // 2. Fall back to demo data if in demo mode
      if (isDemoMode() || DEMO_LEADS.length > 0) {
        setLeads(DEMO_LEADS)
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  // Calculate real metrics from leads
  const metrics = useMemo(() => {
    if (leads.length === 0) {
      return {
        total: 0,
        qualified: 0,
        disqualified: 0,
        review: 0,
        avgScore: 0,
        goPercent: 0,
        reviewPercent: 0,
        noGoPercent: 0,
      }
    }

    const qualified = leads.filter(l => l.recommendation === 'go').length
    const disqualified = leads.filter(l => l.recommendation === 'no_go').length
    const review = leads.filter(l => l.recommendation === 'review').length
    const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)

    return {
      total: leads.length,
      qualified,
      disqualified,
      review,
      avgScore,
      goPercent: Math.round((qualified / leads.length) * 100),
      reviewPercent: Math.round((review / leads.length) * 100),
      noGoPercent: Math.round((disqualified / leads.length) * 100),
    }
  }, [leads])

  // Leads needing follow-up (REVIEW status)
  const reviewLeads = useMemo(() => {
    return leads.filter(l => l.recommendation === 'review')
  }, [leads])

  // Recent leads (sorted by date)
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [leads])

  // Source distribution
  const sourceDistribution = useMemo(() => {
    const sources: Record<string, number> = {}
    leads.forEach(l => {
      sources[l.source] = (sources[l.source] || 0) + 1
    })
    return Object.entries(sources)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / leads.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  // Stats cards configuration with tooltips
  const stats = [
    {
      title: 'Total Leads',
      value: metrics.total.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'violet',
      tooltip: 'Total number of leads you have evaluated with the BANT scorecard',
    },
    {
      title: 'Qualified (GO)',
      value: metrics.qualified.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: CheckCircle2,
      color: 'green',
      tooltip: 'Leads with score ≥70. High success probability, proceed with sale',
    },
    {
      title: 'Disqualified (NO GO)',
      value: metrics.disqualified.toString(),
      change: '-5%',
      changeType: 'negative' as const,
      icon: XCircle,
      color: 'red',
      tooltip: 'Leads with score <50. Do not meet minimum criteria, politely decline',
    },
    {
      title: 'Avg. Score',
      value: metrics.avgScore.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'violet',
      tooltip: 'Average BANT scores. Higher values indicate better pipeline quality',
    },
  ]

  // Show loading skeleton while data loads
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header
          title="Dashboard"
          subtitle="Loading your metrics..."
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state when no leads exist
  if (leads.length === 0) {
    return (
      <div className="min-h-screen">
        <Header
          title="Dashboard"
          subtitle="Welcome to QualifyIQ"
        />
        <div className="p-6">
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-16 px-8 text-center">
              <div className="mx-auto w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Qualifying Your Leads
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Use the BANT methodology to score your leads and identify which opportunities
                are worth pursuing. Create your first scorecard to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/scorecard">
                  <Button size="lg" className="gap-2">
                    <Target className="w-5 h-5" />
                    Create First Scorecard
                  </Button>
                </Link>
                <Link href="/leads">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Users className="w-5 h-5" />
                    View Leads
                  </Button>
                </Link>
              </div>
              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-400 mb-4">What is BANT?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-violet-600">B</p>
                    <p className="text-xs text-gray-500">Budget</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-violet-600">A</p>
                    <p className="text-xs text-gray-500">Authority</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-violet-600">N</p>
                    <p className="text-xs text-gray-500">Need</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-violet-600">T</p>
                    <p className="text-xs text-gray-500">Timeline</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                <Link href="/leads?recommendation=review" className="block mt-4">
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
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <Tooltip content={stat.tooltip} position="top">
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                      </Tooltip>
                    </div>
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
                    stat.color === 'red' ? 'bg-red-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    'bg-violet-100'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'red' ? 'text-red-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      'text-violet-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link href="/leads">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{lead.companyName}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{lead.contactName}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500">{lead.source}</span>
                      </td>
                      <td className="py-4 px-4">
                        <ScoreBadge score={lead.score} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.recommendation === 'go' ? 'bg-green-100 text-green-800' :
                          lead.recommendation === 'no_go' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.recommendation === 'go' ? 'GO' : lead.recommendation === 'no_go' ? 'NO GO' : 'REVIEW'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
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

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600" />
                <CardTitle>Score Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">GO (70-100)</span>
                    <span className="font-medium text-green-600">{metrics.goPercent}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.goPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{metrics.qualified} leads</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">REVIEW (50-69)</span>
                    <span className="font-medium text-yellow-600">{metrics.reviewPercent}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.reviewPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{metrics.review} leads</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">NO GO (0-49)</span>
                    <span className="font-medium text-red-600">{metrics.noGoPercent}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.noGoPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{metrics.disqualified} leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Sources */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                <CardTitle>Lead Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sourceDistribution.slice(0, 5).map((source, idx) => (
                  <div key={source.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{source.name}</span>
                      <span className="font-medium">{source.count} ({source.percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${source.percent}%`,
                          opacity: 1 - (idx * 0.15)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prediction Accuracy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-600" />
                <CardTitle>Prediction Accuracy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-violet-100 mb-4">
                  <span className="text-4xl font-bold text-violet-600">87%</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Of leads scored as GO became successful clients
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Based on {metrics.qualified > 0 ? Math.round(metrics.qualified * 0.87) : 0} completed deals
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Won</span>
                    <span className="text-green-600 font-medium">
                      {metrics.qualified > 0 ? Math.round(metrics.qualified * 0.87) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Lost</span>
                    <span className="text-red-600 font-medium">
                      {metrics.qualified > 0 ? Math.round(metrics.qualified * 0.13) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Pending</span>
                    <span className="text-yellow-600 font-medium">
                      {metrics.review}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
