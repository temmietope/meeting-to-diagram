const SYSTEM_PROMPT = `You are a diagram generation assistant. Your ONLY job is to convert process descriptions, meeting notes, or workflow descriptions into valid Mermaid.js diagram syntax.

Rules:
1. Return ONLY valid Mermaid syntax — no prose, no explanation, no markdown code blocks
2. Choose the most appropriate diagram type: flowchart (graph TD/LR), sequence, state, etc.
3. Keep node labels concise (under 40 chars each)
4. Use graph TD (top-down) for most process flows
5. If input is ambiguous, make a reasonable flowchart
6. Do NOT wrap output in \`\`\`mermaid or any markdown fences
7. Start directly with the diagram type keyword (e.g. "graph TD" or "sequenceDiagram")
8. Use clean, readable node IDs (A, B, C or descriptive short IDs)`

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let notes
  try {
    const body = await req.json()
    notes = body?.notes?.trim()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!notes || notes.length > 2000) {
    return new Response(JSON.stringify({ error: 'Notes must be 1–2000 characters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Convert these notes into a Mermaid diagram:\n\n${notes}` }],
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}))
    return new Response(
      JSON.stringify({ error: err?.error?.message || `Upstream error ${upstream.status}` }),
      { status: upstream.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await upstream.json()
  let mermaid = data.content?.[0]?.text?.trim() ?? ''

  mermaid = mermaid
    .replace(/^```mermaid\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  return new Response(JSON.stringify({ mermaid }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/api/generate' }
