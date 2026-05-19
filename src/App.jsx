import { useState, useCallback } from 'react'
import Header from './components/Header.jsx'
import DiagramOutput from './components/DiagramOutput.jsx'
import Footer from './components/Footer.jsx'
import { generateDiagram } from './lib/ai.js'

const SAMPLE_PROMPTS = [
  {
    label: 'Insurance claim flow',
    icon: '🛡️',
    text: `User submits claim with photos and details
Ops team reviews documents for completeness
Fraud team checks for anomalies and red flags
Underwriter approves or rejects claim
If approved, payment is processed
Customer is notified via email and SMS`,
  },
  {
    label: 'Customer onboarding',
    icon: '👤',
    text: `New user signs up with email
System sends verification email
User verifies email and sets password
User completes KYC — uploads ID and selfie
KYC team reviews documents within 24hrs
Account activated and welcome email sent
User can now access all features`,
  },
  {
    label: 'Incident response',
    icon: '🚨',
    text: `Alert fires in Datadog for high error rate
On-call engineer acknowledges the alert
Engineer checks logs and identifies root cause
Hotfix is deployed to production
Incident channel is updated with status
Post-mortem is written and shared with team
Action items tracked in Linear`,
  },
  {
    label: 'Deployment pipeline',
    icon: '🚀',
    text: `Developer pushes code to feature branch
CI runs tests and lint checks
PR is opened and reviewed by team
PR merged to main branch
Staging deployment triggered automatically
QA team runs smoke tests on staging
Approval given for production release
Production deploy runs with zero-downtime rollout`,
  },
]

const EXAMPLE_INPUT = SAMPLE_PROMPTS[0].text

export default function App() {
  const [notes, setNotes] = useState('')
  const [diagramCode, setDiagramCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = useCallback(async () => {
    if (!notes.trim()) return

    setIsLoading(true)
    setError(null)
    setDiagramCode('')

    try {
      const code = await generateDiagram(notes)
      setDiagramCode(code)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [notes])

  const handleSamplePrompt = (sample) => {
    setNotes(sample.text)
    setError(null)
    setDiagramCode('')
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleGenerate()
    }
  }

  const charCount = notes.length
  const isOverLimit = charCount > 2000

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            Turn notes into{' '}
            <span className="text-gradient">diagrams</span>
          </h1>
          <p className="text-neutral-500 text-base max-w-md mx-auto">
            Paste messy meeting notes or process descriptions. Get a clean, visual diagram instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Input */}
          <div className="flex flex-col gap-4">
            {/* Notes textarea */}
            <div className="card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Meeting Notes
                </label>
                <span className={`text-xs font-mono ${isOverLimit ? 'text-red-400' : 'text-neutral-700'}`}>
                  {charCount}/2000
                </span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your meeting notes, process steps, or workflow description here…"
                rows={12}
                className="input-base leading-relaxed"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => { setNotes(EXAMPLE_INPUT); setError(null); setDiagramCode('') }}
                  className="btn-ghost text-xs py-1.5"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="6.5" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Load example
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !notes.trim() || isOverLimit}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
                        <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      Generate Diagram
                      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] opacity-50 font-mono">
                        ⌘↵
                      </kbd>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sample prompts */}
            <div className="card p-4">
              <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-3">
                Sample flows
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => handleSamplePrompt(sample)}
                    className="chip"
                  >
                    <span>{sample.icon}</span>
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Output */}
          <div className="flex flex-col">
            <DiagramOutput
              diagramCode={diagramCode}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
