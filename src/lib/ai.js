export async function generateDiagram(notes) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || `Server error ${response.status}`)
  }

  if (!data.mermaid) {
    throw new Error('No diagram returned. Please try again.')
  }

  return data.mermaid
}
