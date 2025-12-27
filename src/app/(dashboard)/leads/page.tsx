'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreBadge } from '@/components/ui/score-badge'
import {
  Plus,
  Eye,
  Trash2,
  Edit,
  FileSpreadsheet,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import Link from 'next/link'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-mode'
import { exportLeadsToCSV } from '@/lib/utils/export-csv'
import { cn } from '@/lib/utils/cn'

type SortField = 'companyName' | 'contactName' | 'source' | 'score' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function LeadsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState(DEMO_LEADS)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Advanced filters
  const [sourceFilter, setSourceFilter] = useState('all')
  const [scoreMin, setScoreMin] = useState('')
  const [scoreMax, setScoreMax] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    // In demo mode, use DEMO_LEADS; otherwise, fetch from API
    if (isDemoMode()) {
      setLeads(DEMO_LEADS)
    }
    // TODO: Add real data fetching here
  }, [])

  // Get unique sources for dropdown
  const uniqueSources = useMemo(() => {
    const sources = [...new Set(leads.map(l => l.source))]
    return sources.sort()
  }, [leads])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (sourceFilter !== 'all') count++
    if (scoreMin) count++
    if (scoreMax) count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [sourceFilter, scoreMin, scoreMax, dateFrom, dateTo])

  const clearAllFilters = () => {
    setFilter('all')
    setSearch('')
    setSourceFilter('all')
    setScoreMin('')
    setScoreMax('')
    setDateFrom('')
    setDateTo('')
  }

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sortable header component
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-violet-600" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-violet-600" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </div>
    </th>
  )

  const filteredLeads = useMemo(() => {
    // First filter
    const filtered = leads.filter(lead => {
      // Recommendation filter
      const matchesRecommendation = filter === 'all' || lead.recommendation === filter

      // Text search (company, contact name, email, source)
      const searchLower = search.toLowerCase()
      const matchesSearch = !search ||
        lead.companyName.toLowerCase().includes(searchLower) ||
        lead.contactName.toLowerCase().includes(searchLower) ||
        lead.contactEmail.toLowerCase().includes(searchLower) ||
        lead.source.toLowerCase().includes(searchLower)

      // Source filter
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

      // Score range filter
      const minScore = scoreMin ? parseInt(scoreMin) : 0
      const maxScore = scoreMax ? parseInt(scoreMax) : 100
      const matchesScore = lead.score >= minScore && lead.score <= maxScore

      // Date range filter
      const leadDate = new Date(lead.createdAt)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null
      const matchesDateFrom = !fromDate || leadDate >= fromDate
      const matchesDateTo = !toDate || leadDate <= toDate

      return matchesRecommendation && matchesSearch && matchesSource && matchesScore && matchesDateFrom && matchesDateTo
    })

    // Then sort
    return [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase()
          bValue = b.companyName.toLowerCase()
          break
        case 'contactName':
          aValue = a.contactName.toLowerCase()
          bValue = b.contactName.toLowerCase()
          break
        case 'source':
          aValue = a.source.toLowerCase()
          bValue = b.source.toLowerCase()
          break
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [leads, filter, search, sourceFilter, scoreMin, scoreMax, dateFrom, dateTo, sortField, sortDirection])

  return (
    <div className="min-h-screen">
      <Header
        title="Leads"
        subtitle="Gestiona y da seguimiento a todos tus leads calificados"
      />

      <div className="p-6 space-y-4">
        {/* Search and Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar empresa, contacto, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 pl-10"
              />
            </div>

            {/* Recommendation Filter Pills */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {['all', 'go', 'review', 'no_go'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f
                      ? f === 'go' ? 'bg-green-600 text-white' :
                        f === 'review' ? 'bg-yellow-500 text-white' :
                        f === 'no_go' ? 'bg-red-600 text-white' :
                        'bg-violet-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'go' ? 'GO' : f === 'review' ? 'Revisar' : 'NO GO'}
                </button>
              ))}
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={activeFilterCount > 0 ? 'border-violet-400 bg-violet-50 text-violet-700' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-violet-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>

            {/* Clear All Filters */}
            {(activeFilterCount > 0 || search || filter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => exportLeadsToCSV(filteredLeads)}
              disabled={filteredLeads.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Link href="/scorecard">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Scorecard
              </Button>
            </Link>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <Card className="border-violet-100 bg-violet-50/30">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuente
                  </label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">Todas las fuentes</option>
                    {uniqueSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                {/* Score Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de Score
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      min="0"
                      max="100"
                      value={scoreMin}
                      onChange={(e) => setScoreMin(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-gray-400">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      min="0"
                      max="100"
                      value={scoreMax}
                      onChange={(e) => setScoreMax(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha desde
                  </label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha hasta
                  </label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {(search || filter !== 'all' || activeFilterCount > 0) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{filteredLeads.length}</span>
            <span>leads encontrados</span>
            {search && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                búsqueda: "{search}"
              </span>
            )}
            {filter !== 'all' && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'go' ? 'bg-green-100 text-green-700' :
                filter === 'review' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {filter === 'go' ? 'GO' : filter === 'review' ? 'Revisar' : 'NO GO'}
              </span>
            )}
          </div>
        )}

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <SortableHeader field="companyName">Empresa</SortableHeader>
                    <SortableHeader field="contactName">Contacto</SortableHeader>
                    <SortableHeader field="source">Fuente</SortableHeader>
                    <SortableHeader field="score">Score</SortableHeader>
                    <SortableHeader field="status">Estado</SortableHeader>
                    <SortableHeader field="createdAt">Fecha</SortableHeader>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Acciones</th>
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
                          {lead.status === 'qualified' ? 'Calificado' :
                           lead.status === 'disqualified' ? 'Descalificado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/leads/${lead.id}?edit=true`}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No se encontraron leads con los criterios seleccionados.</p>
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="mt-2 text-violet-600 hover:text-violet-700"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {filteredLeads.length} de {leads.length} leads
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
