export async function generateDiagram(notes) {
  let response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
  } catch {
    throw new Error('Could not reach the server. Are you running netlify dev locally?')
  }

  let data
  try {
    data = await response.json()
  } catch {
    if (response.status === 404) {
      throw new Error('API endpoint not found. Run "netlify dev" instead of "npm run dev" locally.')
    }
    throw new Error(`Server returned an unexpected response (${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Server error ${response.status}`)
  }

  if (!data.mermaid) {
    throw new Error('No diagram returned. Please try again.')
  }

  return data.mermaid
}
