'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreBadge } from '@/components/ui/score-badge'
import { Plus, Download, Eye, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-mode'

export default function LeadsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState(DEMO_LEADS)

  useEffect(() => {
    // In demo mode, use DEMO_LEADS; otherwise, fetch from API
    if (isDemoMode()) {
      setLeads(DEMO_LEADS)
    }
    // TODO: Add real data fetching here
  }, [])

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.recommendation === filter
    const matchesSearch =
      lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(search.toLowerCase()) ||
      lead.contactEmail.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen">
      <Header
        title="Leads"
        subtitle="Manage and track all your qualified leads"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {['all', 'go', 'review', 'no_go'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'go' ? 'GO' : f === 'review' ? 'Review' : 'No Go'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/scorecard">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Scorecard
              </Button>
            </Link>
          </div>
        </div>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Company</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Source</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Score</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-medium text-gray-900">{lead.companyName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{lead.contactName}</div>
                          <div className="text-sm text-gray-500">{lead.contactEmail}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <ScoreBadge score={lead.score} size="sm" />
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          lead.status === 'disqualified' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/leads/${lead.id}?edit=true`}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No leads found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
