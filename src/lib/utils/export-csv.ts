/**
 * CSV Export Utility for QualifyIQ
 * Exports lead data to CSV format with proper escaping and formatting
 */

export interface LeadExportData {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  source: string
  status: string
  recommendation: string
  score: number
  createdAt: string
}

interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  dateFormat?: 'iso' | 'local'
}

/**
 * Escapes CSV field values to handle special characters
 */
function escapeCSVField(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return ''
  }

  const stringValue = String(value)

  // If the value contains comma, newline, or double quote, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escape double quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Formats recommendation value for export
 */
function formatRecommendation(rec: string): string {
  switch (rec) {
    case 'go': return 'GO'
    case 'no_go': return 'NO GO'
    case 'review': return 'REVIEW'
    default: return rec.toUpperCase()
  }
}

/**
 * Formats status value for export
 */
function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/**
 * Formats date for export based on options
 */
function formatDate(dateStr: string, format: 'iso' | 'local'): string {
  const date = new Date(dateStr)
  if (format === 'iso') {
    return date.toISOString().split('T')[0]
  }
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Generates CSV content from lead data
 */
export function generateLeadsCSV(
  leads: LeadExportData[],
  options: ExportOptions = {}
): string {
  const {
    includeHeaders = true,
    dateFormat = 'local'
  } = options

  const headers = [
    'Empresa',
    'Contacto',
    'Email',
    'Fuente',
    'Score',
    'Recomendación',
    'Estado',
    'Fecha Creación'
  ]

  const rows: string[] = []

  if (includeHeaders) {
    rows.push(headers.join(','))
  }

  for (const lead of leads) {
    const row = [
      escapeCSVField(lead.companyName),
      escapeCSVField(lead.contactName),
      escapeCSVField(lead.contactEmail),
      escapeCSVField(lead.source),
      escapeCSVField(lead.score),
      escapeCSVField(formatRecommendation(lead.recommendation)),
      escapeCSVField(formatStatus(lead.status)),
      escapeCSVField(formatDate(lead.createdAt, dateFormat))
    ]
    rows.push(row.join(','))
  }

  return rows.join('\n')
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Main export function that generates and downloads CSV
 */
export function exportLeadsToCSV(
  leads: LeadExportData[],
  options: ExportOptions = {}
): void {
  const {
    filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
  } = options

  const csvContent = generateLeadsCSV(leads, options)
  downloadCSV(csvContent, filename)
}
