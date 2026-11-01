
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeout || 30000
  )

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })

    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        typeof body.detail === 'string'
          ? body.detail
          : body.message || `Request failed (${response.status})`
      )
    }

    return body
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Backend request timed out.')
    }
    throw new Error(error.message || 'Backend is unavailable.')
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  health: () => request('/health'),

  analyzeCode: (code) =>
    request('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }),

  analyzeFile: (file) => {
    const form = new FormData()
    form.append('file', file)

    return request('/api/analyze-file', {
      method: 'POST',
      body: form,
      timeout: 120000,
    })
  },

  retest: (original_code, patched_code) =>
    request('/api/retest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original_code, patched_code }),
      timeout: 120000,
    }),
}
