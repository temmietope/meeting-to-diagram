export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-neutral-700 text-xs">
          Meeting<span className="text-accent/60">→</span>Diagram — turn notes into visuals instantly
        </p>
        <p className="text-neutral-800 text-xs">
          Powered by{' '}
          <span className="text-neutral-600">Claude Haiku</span>
          {' '}·{' '}
          <span className="text-neutral-600">Mermaid.js</span>
        </p>
      </div>
    </footer>
  )
}
