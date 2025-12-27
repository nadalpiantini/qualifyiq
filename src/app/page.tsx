import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Target,
  CheckCircle2,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">QualifyIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Smart lead qualification for B2B teams
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Stop accepting clients
            <br />
            <span className="text-violet-600">you know will be a problem</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            QualifyIQ helps your sales team make data-driven decisions about which leads to pursue.
            Say &ldquo;no&rdquo; with confidence. Say &ldquo;yes&rdquo; with certainty.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-base">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-violet-600 mb-2">87%</div>
              <p className="text-gray-600">Prediction accuracy on successful clients</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-violet-600 mb-2">3x</div>
              <p className="text-gray-600">Reduction in problematic clients</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-violet-600 mb-2">2 min</div>
              <p className="text-gray-600">Average time to complete a scorecard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to qualify leads
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete system for structured qualification that learns from your outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Structured Scorecard</h3>
              <p className="text-gray-600">
                BANT-based scoring with customizable weights. Rate Budget, Authority, Need, Timeline, and Technical Fit in minutes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Predictive Scoring</h3>
              <p className="text-gray-600">
                AI-powered score that compares new leads to your historical wins and losses. Know the probability of success upfront.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Feedback Loop</h3>
              <p className="text-gray-600">
                Track outcomes and improve predictions over time. Your model gets smarter with every closed deal.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Red Flag Detection</h3>
              <p className="text-gray-600">
                Identify warning signs early. Unrealistic timelines, unclear budgets, and more flagged automatically.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-gray-600">
                Share scorecards with SMEs for technical validation. Collective decision-making reduces individual pressure.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CRM Integration</h3>
              <p className="text-gray-600">
                Connect with HubSpot, Pipedrive, Salesforce, and more. Sync leads and scores automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              From first call to informed decision in 4 simple steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: 'Have the conversation',
                description: 'Your BD has the first call with the lead. Listen, understand, take notes. No pressure to decide yet.',
              },
              {
                step: 2,
                title: 'Fill the scorecard',
                description: 'In 2 minutes, score the lead on Budget, Authority, Need, Timeline, and Technical Fit. Flag any red flags.',
              },
              {
                step: 3,
                title: 'Get the recommendation',
                description: 'QualifyIQ analyzes the scores, compares with historical data, and gives you a GO, REVIEW, or NO GO recommendation.',
              },
              {
                step: 4,
                title: 'Track the outcome',
                description: '3 months later, tell us how it went. Was it a good client? Your model learns and improves.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to qualify leads with confidence?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Start your free trial today. No credit card required.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-base">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl">QualifyIQ</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 QualifyIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
