import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  darkMode: true,
  background: 'transparent',
  themeVariables: {
    darkMode: true,
    background: '#161616',
    primaryColor: '#312e81',
    primaryTextColor: '#e5e5e5',
    primaryBorderColor: '#6366f1',
    lineColor: '#6366f1',
    secondaryColor: '#1c1c1c',
    tertiaryColor: '#1c1c1c',
    edgeLabelBackground: '#161616',
    nodeTextColor: '#e5e5e5',
    clusterBkg: '#1c1c1c',
    titleColor: '#e5e5e5',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence: { actorFontFamily: 'Inter', noteFontFamily: 'Inter', messageFontFamily: 'Inter' },
})

let renderCounter = 0

export default function DiagramOutput({ diagramCode, isLoading, error: outerError }) {
  const containerRef = useRef(null)
  const [renderError, setRenderError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!diagramCode || !containerRef.current) return

    setRenderError(null)
    renderCounter++
    const id = `mermaid-diagram-${renderCounter}`

    mermaid
      .render(id, diagramCode)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          // Make SVG responsive
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.style.maxWidth = '100%'
            svgEl.style.height = 'auto'
          }
        }
      })
      .catch((err) => {
        setRenderError('Could not render diagram — the AI returned invalid Mermaid syntax. Try rephrasing your notes.')
        if (containerRef.current) containerRef.current.innerHTML = ''
        console.error('Mermaid render error:', err)
      })
  }, [diagramCode])

  const handleCopy = async () => {
    if (!diagramCode) return
    await navigator.clipboard.writeText(diagramCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPNG = () => {
    const svgEl = containerRef.current?.querySelector('svg')
    if (!svgEl) return

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    const svgWidth = svgEl.viewBox?.baseVal?.width || svgEl.getBoundingClientRect().width || 800
    const svgHeight = svgEl.viewBox?.baseVal?.height || svgEl.getBoundingClientRect().height || 600
    const scale = 2

    canvas.width = svgWidth * scale
    canvas.height = svgHeight * scale
    ctx.scale(scale, scale)
    ctx.fillStyle = '#161616'
    ctx.fillRect(0, 0, svgWidth, svgHeight)

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.download = 'diagram.png'
      a.href = pngUrl
      a.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  const displayError = outerError || renderError
  const hasContent = diagramCode && !isLoading

  if (isLoading) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center gap-4 min-h-[280px] animate-fade-in">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin-slow" />
        </div>
        <div className="text-center">
          <p className="text-neutral-300 text-sm font-medium">Generating diagram</p>
          <p className="text-neutral-600 text-xs mt-1 animate-pulse-subtle">Claude is analysing your notes…</p>
        </div>
      </div>
    )
  }

  if (displayError) {
    return (
      <div className="card border-red-500/20 bg-red-500/5 p-6 min-h-[200px] flex items-start gap-3 animate-fade-in">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 5v4M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="8" r="6.5" stroke="#f87171" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <p className="text-red-400 text-sm font-medium">Error</p>
          <p className="text-neutral-400 text-sm mt-1">{displayError}</p>
        </div>
      </div>
    )
  }

  if (!hasContent) {
    return (
      <div className="card min-h-[280px] flex flex-col items-center justify-center gap-3 text-center p-8">
        <div className="w-12 h-12 rounded-xl bg-surface-3 border border-border flex items-center justify-center mb-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" stroke="#404040" strokeWidth="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="2" stroke="#404040" strokeWidth="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="2" stroke="#404040" strokeWidth="1.5" />
            <path d="M17 13v8M13 17h8" stroke="#404040" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-neutral-500 text-sm">Your diagram will appear here</p>
        <p className="text-neutral-700 text-xs">Paste your notes and click Generate</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden animate-slide-up glow-accent">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-neutral-400 text-xs font-medium">Diagram</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-2.5">
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5l3 3 6-6" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 8.5H3A1.5 1.5 0 0 1 1.5 7V3A1.5 1.5 0 0 1 3 1.5h4A1.5 1.5 0 0 1 8.5 3v1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Copy Mermaid
              </>
            )}
          </button>
          <button onClick={handleDownloadPNG} className="btn-ghost text-xs py-1.5 px-2.5">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v7M4 6.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 10.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Download PNG
          </button>
        </div>
      </div>

      <div className="p-6 overflow-auto mermaid-output">
        <div ref={containerRef} className="flex justify-center" />
      </div>

      {diagramCode && (
        <details className="border-t border-border">
          <summary className="px-4 py-3 text-xs text-neutral-600 hover:text-neutral-400 cursor-pointer select-none transition-colors">
            View Mermaid source
          </summary>
          <pre className="px-4 pb-4 text-xs text-neutral-500 font-mono overflow-auto whitespace-pre-wrap break-all">
            {diagramCode}
          </pre>
        </details>
      )}
    </div>
  )
}
