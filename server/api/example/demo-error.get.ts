// Demo endpoint: deliberately responds with the requested HTTP status (?status=…).
// Powers the /errors page — showcases error handling for different request types.

// Human-readable messages per status. They go into the JSON body (UTF-8), so Cyrillic
// is fine — unlike statusMessage, which ends up in the ASCII-only reason phrase
// and would be mangled. normalizeApiError reads the text from the body (err.data.message).
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Access denied',
  404: 'Resource not found',
  422: 'Validation failed',
  500: 'Internal server error',
}

export default defineEventHandler((event) => {
  const status = Number(getQuery(event).status) || 200

  // No status (or 200) — successful response.
  if (status === 200) {
    return { ok: true, message: 'Request successful' }
  }

  // 422 → a raw [field, rule, params] array as the ENTIRE response body: this exact format
  // is what useForm maps into field errors (error.data.forEach). Only email fails here.
  if (status === 422) {
    setResponseStatus(event, 422)

    return [['email', 'email', []]]
  }

  // All other statuses — via createError: message goes into the body (err.data.message),
  // where normalizeApiError picks it up. statusMessage is deliberately not set —
  // h3 recommends message for long texts (the reason phrase stays standard).
  const message = STATUS_MESSAGES[status] ?? `Error ${status}`
  throw createError({ statusCode: status, message, data: { message } })
})
