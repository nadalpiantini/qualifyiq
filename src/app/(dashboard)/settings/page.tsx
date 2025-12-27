'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Building2, Bell, Palette, Webhook, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

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
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'New lead notifications', description: 'Get notified when a new lead is added' },
                  { title: 'Scorecard completions', description: 'Get notified when a scorecard is completed' },
                  { title: 'Weekly digest', description: 'Receive a weekly summary of your leads' },
                  { title: 'Outcome reminders', description: 'Reminders to update lead outcomes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-violet-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
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
                  { label: 'Budget Weight', key: 'budget' as const },
                  { label: 'Authority Weight', key: 'authority' as const },
                  { label: 'Need Weight', key: 'need' as const },
                  { label: 'Timeline Weight', key: 'timeline' as const },
                  { label: 'Technical Fit Weight', key: 'technicalFit' as const },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">{item.label}</label>
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
