/**
 * Notification Service for QualifyIQ
 * Handles email notifications for lead events
 */

export type NotificationType =
  | 'new_lead'
  | 'scorecard_complete'
  | 'weekly_digest'
  | 'outcome_reminder'
  | 'follow_up_due'
  | 'lead_status_change'

export interface NotificationPreferences {
  email: string
  enabled: boolean
  types: {
    new_lead: boolean
    scorecard_complete: boolean
    weekly_digest: boolean
    outcome_reminder: boolean
    follow_up_due: boolean
    lead_status_change: boolean
  }
  digestDay: 'monday' | 'friday' | 'sunday'
  digestTime: string // 24h format "09:00"
  reminderDays: number // Days before follow-up to remind
}

export interface NotificationPayload {
  type: NotificationType
  recipient: string
  subject: string
  body: string
  data?: Record<string, unknown>
}

// Default preferences for new users
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: '',
  enabled: true,
  types: {
    new_lead: true,
    scorecard_complete: true,
    weekly_digest: true,
    outcome_reminder: true,
    follow_up_due: true,
    lead_status_change: false,
  },
  digestDay: 'monday',
  digestTime: '09:00',
  reminderDays: 1,
}

// Email templates
const EMAIL_TEMPLATES = {
  new_lead: {
    subject: (data: Record<string, unknown>) =>
      `New Lead: ${data.companyName}`,
    body: (data: Record<string, unknown>) => `
      <h2>New Lead Added</h2>
      <p>A new lead has been added to QualifyIQ:</p>
      <ul>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Contact:</strong> ${data.contactName}</li>
        <li><strong>Email:</strong> ${data.contactEmail}</li>
        <li><strong>Source:</strong> ${data.source}</li>
      </ul>
      <p><a href="${data.leadUrl}">View Lead Details</a></p>
    `,
  },
  scorecard_complete: {
    subject: (data: Record<string, unknown>) =>
      `Scorecard Complete: ${data.companyName} - ${data.recommendation}`,
    body: (data: Record<string, unknown>) => `
      <h2>Scorecard Completed</h2>
      <p>A lead qualification scorecard has been completed:</p>
      <ul>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Score:</strong> ${data.score}/100</li>
        <li><strong>Recommendation:</strong> ${data.recommendation}</li>
      </ul>
      <p><a href="${data.leadUrl}">View Lead Details</a></p>
    `,
  },
  weekly_digest: {
    subject: () => `QualifyIQ Weekly Digest`,
    body: (data: Record<string, unknown>) => `
      <h2>Your Weekly Lead Summary</h2>
      <p>Here's what happened this week:</p>
      <ul>
        <li><strong>New Leads:</strong> ${data.newLeads}</li>
        <li><strong>Qualified (GO):</strong> ${data.qualified}</li>
        <li><strong>Disqualified (NO GO):</strong> ${data.disqualified}</li>
        <li><strong>Pending Review:</strong> ${data.review}</li>
      </ul>
      <h3>Top Leads This Week</h3>
      ${data.topLeads}
      <p><a href="${data.dashboardUrl}">View Dashboard</a></p>
    `,
  },
  outcome_reminder: {
    subject: (data: Record<string, unknown>) =>
      `Outcome Reminder: ${data.companyName}`,
    body: (data: Record<string, unknown>) => `
      <h2>Lead Outcome Reminder</h2>
      <p>It's been a while since you qualified this lead. Have you closed the deal?</p>
      <ul>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Contact:</strong> ${data.contactName}</li>
        <li><strong>Score:</strong> ${data.score}/100</li>
        <li><strong>Qualified on:</strong> ${data.qualifiedDate}</li>
      </ul>
      <p><a href="${data.leadUrl}">Update Outcome</a></p>
    `,
  },
  follow_up_due: {
    subject: (data: Record<string, unknown>) =>
      `Follow-up Due: ${data.companyName}`,
    body: (data: Record<string, unknown>) => `
      <h2>Follow-up Reminder</h2>
      <p>You have a follow-up scheduled:</p>
      <ul>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Contact:</strong> ${data.contactName}</li>
        <li><strong>Due Date:</strong> ${data.followUpDate}</li>
        <li><strong>Notes:</strong> ${data.followUpNotes || 'No notes'}</li>
      </ul>
      <p><a href="${data.leadUrl}">View Lead</a></p>
    `,
  },
  lead_status_change: {
    subject: (data: Record<string, unknown>) =>
      `Lead Status Changed: ${data.companyName}`,
    body: (data: Record<string, unknown>) => `
      <h2>Lead Status Update</h2>
      <p>A lead status has been updated:</p>
      <ul>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Previous Status:</strong> ${data.previousStatus}</li>
        <li><strong>New Status:</strong> ${data.newStatus}</li>
      </ul>
      <p><a href="${data.leadUrl}">View Lead</a></p>
    `,
  },
}

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  type: NotificationType,
  preferences: NotificationPreferences
): boolean {
  if (!preferences.enabled) return false
  return preferences.types[type] ?? false
}

/**
 * Generate notification payload from template
 */
export function generateNotification(
  type: NotificationType,
  recipient: string,
  data: Record<string, unknown>
): NotificationPayload {
  const template = EMAIL_TEMPLATES[type]
  return {
    type,
    recipient,
    subject: template.subject(data),
    body: template.body(data),
    data,
  }
}

/**
 * Send notification (placeholder for actual email service integration)
 * In production, this would integrate with services like:
 * - SendGrid
 * - Resend
 * - AWS SES
 * - Postmark
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Demo mode - log instead of sending
  console.log('[Notification Service] Would send email:', {
    to: payload.recipient,
    subject: payload.subject,
    type: payload.type,
  })

  // In production, integrate with email service:
  // const response = await resend.emails.send({
  //   from: 'QualifyIQ <notifications@qualifyiq.com>',
  //   to: payload.recipient,
  //   subject: payload.subject,
  //   html: payload.body,
  // })

  // Simulate successful send
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  }
}

/**
 * Queue notification for batch sending (useful for digests)
 */
export async function queueNotification(
  payload: NotificationPayload,
  sendAt?: Date
): Promise<{ success: boolean; jobId?: string }> {
  console.log('[Notification Service] Queued notification:', {
    type: payload.type,
    recipient: payload.recipient,
    scheduledFor: sendAt?.toISOString() || 'immediate',
  })

  return {
    success: true,
    jobId: `job_${Date.now()}`,
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const testPayload: NotificationPayload = {
    type: 'new_lead',
    recipient: email,
    subject: 'QualifyIQ Test Notification',
    body: `
      <h2>Test Notification</h2>
      <p>This is a test notification from QualifyIQ.</p>
      <p>If you received this email, your notification settings are working correctly!</p>
    `,
  }

  return sendNotification(testPayload)
}

/**
 * Get notification statistics
 */
export function getNotificationStats(): {
  sent: number
  pending: number
  failed: number
} {
  // In production, would query from database
  return {
    sent: 142,
    pending: 3,
    failed: 0,
  }
}
