'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Building2, Bell, Palette, Webhook, Loader2, AlertTriangle, CheckCircle2, Mail, Send, Clock, HelpCircle } from 'lucide-react'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  sendTestNotification,
  type NotificationPreferences
} from '@/lib/services/notifications'

export default function SettingsPage() {
  // Scoring weights state - corrected to sum to 100%
  const [weights, setWeights] = useState({
    budget: 20,
    authority: 20, // Fixed from 15% to 20%
    need: 25,
    timeline: 15,
    technicalFit: 20, // Fixed from 15% to 20%
    redFlagPenalty: 5,
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingOrg, setSavingOrg] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    email: 'john@company.com', // Would come from user profile
  })

  // Calculate total weights (excluding red flag penalty)
  const totalWeight = weights.budget + weights.authority + weights.need + weights.timeline + weights.technicalFit
  const isValidTotal = totalWeight === 100

  const handleWeightChange = (field: keyof typeof weights, value: string) => {
    const numValue = parseInt(value) || 0
    setWeights(prev => ({ ...prev, [field]: numValue }))
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingProfile(false)
    toast.success('Profile updated', { description: 'Your profile settings have been saved.' })
  }

  const handleSaveOrg = async () => {
    setSavingOrg(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingOrg(false)
    toast.success('Organization updated', { description: 'Organization settings have been saved.' })
  }

  const handleSaveConfig = async () => {
    if (!isValidTotal) {
      toast.error('Invalid weights', {
        description: `BANT weights must sum to 100%. Current total: ${totalWeight}%`,
      })
      return
    }

    setSavingConfig(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingConfig(false)
    toast.success('Scoring configuration saved', {
      description: 'Your scoring weights have been updated.',
    })
  }

  const handleToggleNotificationType = (type: keyof NotificationPreferences['types']) => {
    setNotificationPrefs(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }))
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingNotifications(false)
    toast.success('Notification preferences saved', {
      description: 'Your email notification settings have been updated.',
    })
  }

  const handleTestEmail = async () => {
    if (!notificationPrefs.email) {
      toast.error('No email configured', {
        description: 'Please enter an email address first.',
      })
      return
    }

    setTestingEmail(true)
    try {
      const result = await sendTestNotification(notificationPrefs.email)
      if (result.success) {
        toast.success('Test email sent', {
          description: `A test notification was sent to ${notificationPrefs.email}`,
        })
      } else {
        toast.error('Failed to send test email', {
          description: result.error || 'Please try again later.',
        })
      }
    } catch {
      toast.error('Error sending test email')
    } finally {
      setTestingEmail(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="p-6">
        <div className="max-w-4xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" />
                <Input label="Email" type="email" placeholder="john@company.com" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Organization</CardTitle>
                  <CardDescription>Manage your organization settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Organization Name" placeholder="Acme Inc." />
                <Input label="Slug" placeholder="acme" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveOrg} disabled={savingOrg}>
                  {savingOrg ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Configure how you receive email notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Configuration */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Email Configuration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Notification Email"
                    type="email"
                    value={notificationPrefs.email}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={testingEmail || !notificationPrefs.email}
                      className="w-full"
                    >
                      {testingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Master Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable all notifications</p>
                    <p className="text-xs text-gray-500">Master toggle for all email notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationPrefs.enabled}
                      onChange={() => setNotificationPrefs(prev => ({ ...prev, enabled: !prev.enabled }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Notification Types */}
              <div className={`space-y-4 ${!notificationPrefs.enabled && 'opacity-50 pointer-events-none'}`}>
                {[
                  { key: 'new_lead' as const, title: 'New lead notifications', description: 'Get notified when a new lead is added' },
                  { key: 'scorecard_complete' as const, title: 'Scorecard completions', description: 'Get notified when a scorecard is completed' },
                  { key: 'follow_up_due' as const, title: 'Follow-up reminders', description: 'Reminders when follow-up dates are approaching' },
                  { key: 'outcome_reminder' as const, title: 'Outcome reminders', description: 'Reminders to update lead outcomes after qualification' },
                  { key: 'lead_status_change' as const, title: 'Status changes', description: 'Get notified when a lead status changes' },
                  { key: 'weekly_digest' as const, title: 'Weekly digest', description: 'Receive a weekly summary of your leads' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationPrefs.types[item.key]}
                        onChange={() => handleToggleNotificationType(item.key)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Weekly Digest Settings */}
              {notificationPrefs.enabled && notificationPrefs.types.weekly_digest && (
                <div className="p-4 bg-violet-50 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-700">Weekly Digest Schedule</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Day</label>
                      <select
                        value={notificationPrefs.digestDay}
                        onChange={(e) => setNotificationPrefs(prev => ({
                          ...prev,
                          digestDay: e.target.value as 'monday' | 'friday' | 'sunday'
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                      >
                        <option value="monday">Monday</option>
                        <option value="friday">Friday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Time</label>
                      <select
                        value={notificationPrefs.digestTime}
                        onChange={(e) => setNotificationPrefs(prev => ({
                          ...prev,
                          digestTime: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                      >
                        <option value="09:00">9:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Reminder Settings */}
              {notificationPrefs.enabled && notificationPrefs.types.follow_up_due && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Remind me before follow-up</label>
                    <p className="text-xs text-gray-500">Days before the follow-up date to send reminder</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={notificationPrefs.reminderDays}
                      onChange={(e) => setNotificationPrefs(prev => ({
                        ...prev,
                        reminderDays: parseInt(e.target.value) || 1
                      }))}
                      min={1}
                      max={7}
                      className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    />
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
                  {savingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Notification Settings'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Webhook className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with your favorite tools</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'HubSpot', description: 'Sync leads with HubSpot CRM', connected: false },
                  { name: 'Pipedrive', description: 'Sync leads with Pipedrive', connected: false },
                  { name: 'Salesforce', description: 'Sync leads with Salesforce', connected: false },
                  { name: 'Slack', description: 'Get notifications in Slack', connected: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Button variant={item.connected ? 'secondary' : 'outline'} size="sm">
                      {item.connected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scoring Weights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Scoring Configuration</CardTitle>
                  <CardDescription>Customize how scores are calculated</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* BANT Weight inputs */}
                {[
                  { label: 'Budget Weight', key: 'budget' as const, tooltip: 'Importance of available budget. Higher weight = more impact on final score.' },
                  { label: 'Authority Weight', key: 'authority' as const, tooltip: 'Importance of speaking with decision-maker. Higher weight = more relevant the purchasing authority.' },
                  { label: 'Need Weight', key: 'need' as const, tooltip: 'Importance of real need. Higher weight = more critical that a clear need exists.' },
                  { label: 'Timeline Weight', key: 'timeline' as const, tooltip: 'Importance of timing. Higher weight = more urgent they have a decision date.' },
                  { label: 'Technical Fit Weight', key: 'technicalFit' as const, tooltip: 'Importance of technical fit. Higher weight = more critical we can solve their problem.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <label className="text-sm font-medium text-gray-700">{item.label}</label>
                      <Tooltip content={item.tooltip} position="right">
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-violet-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weights[item.key]}
                        onChange={(e) => handleWeightChange(item.key, e.target.value)}
                        min={0}
                        max={100}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                ))}

                {/* Total indicator */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isValidTotal ? 'bg-green-50' : 'bg-amber-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {isValidTotal ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      isValidTotal ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {isValidTotal ? 'Weights are balanced' : 'Weights must sum to 100%'}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${
                    isValidTotal ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    Total: {totalWeight}%
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Red Flag Penalty</label>
                      <p className="text-xs text-gray-500">Points deducted per red flag</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weights.redFlagPenalty}
                        onChange={(e) => handleWeightChange('redFlagPenalty', e.target.value)}
                        min={0}
                        max={20}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                      />
                      <span className="text-gray-500">pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveConfig} disabled={savingConfig || !isValidTotal}>
                    {savingConfig ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
