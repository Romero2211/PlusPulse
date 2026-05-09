import { GoogleGenerativeAI } from '@google/generative-ai'

/** Коди відповіді моделі; показ через `events.aiReject.{code}` у LanguageContext */
export type EventAiRejectCode =
  | 'off_topic'
  | 'nonsense'
  | 'spam'
  | 'harmful'
  | 'unclear'
  | 'other'

export type EventAiReviewResult =
  | { type: 'pass' }
  | { type: 'reject'; code: EventAiRejectCode }
  /** Модель не змогла однозначно схвалити — на ручну модерацію */
  | { type: 'manual_review'; cause: 'ambiguous' }
  | { type: 'service_error'; reason: 'missing_key' | 'timeout' | 'api' | 'parse' }

/** Один промпт: правила й формат JSON і поля чернетки заходу. */
function buildVolunteerEventReviewPrompt(input: {
  title: string
  reason: string | null
  description: string | null
}): string {
  const reasonLine = input.reason?.trim() ? input.reason.trim() : '[немає]'
  const descLine = input.description?.trim() ? input.description.trim() : '[немає]'

  return `Ти модератор контенту добровільних і благодійних заходів на волонтерській платформі в Україні (Благодійний фонд, небайдужі люди).

ЗАВДАННЯ
Проаналізуй чернетку заходу нижче. Поверни ЛИШЕ один JSON-об’єкт із полями "decision" та "code" — без тексту поза JSON, без markdown-блоків.

ФОРМАТ
- decision: "approve" | "reject" | "needs_review"
- code: один із "ok" | "off_topic" | "nonsense" | "spam" | "harmful" | "unclear" | "other"
Якщо decision = "approve", code має бути "ok".
Якщо decision = "needs_review", code зазвичай "unclear" або "other" (текст на межі / потрібна людина).

ПРАВИЛА
- approve: якщо можна добросовісно трактувати як волонтерство, допомогу громаді, збір, соціальну/екологічну підтримку в Україні (навіть короткий опис).
- needs_review: якщо опис допустимий, але є сумніви, суперечності, недостатньо контексту для автоматичного рішення, або тема на межі правил — без автоматичного відхилення.
- reject: лише за явним спамом, нісенітницею, шахрайством, закликом до шкоди, очевидно не про добровільну/благодійну тему.

ЧЕРНЕТКА
---
Назва (title): ${input.title}
Мета / причина (reason): ${reasonLine}
Опис (description): ${descLine}
---`
}

function extractJsonObjectString(raw: string): string {
  const t = raw.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence?.[1]) {
    return fence[1].trim()
  }
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end > start) {
    return t.slice(start, end + 1).trim()
  }
  return t
}

function normalizeRejectCode(raw: unknown): EventAiRejectCode {
  switch (raw) {
    case 'off_topic':
    case 'nonsense':
    case 'spam':
    case 'harmful':
    case 'unclear':
    case 'other':
      return raw
    default:
      return 'other'
  }
}

/** У dev за замовчуванням логуємо; у prod — EVENT_AI_DEBUG=1. EVENT_AI_DEBUG=0 вимикає навіть у dev. */
function shouldLogEventAi(): boolean {
  const v = process.env.EVENT_AI_DEBUG?.trim().toLowerCase()
  if (v === '0' || v === 'false' || v === 'no') {
    return false
  }
  if (process.env.NODE_ENV !== 'production') {
    return true
  }
  return v === '1' || v === 'true' || v === 'yes'
}

function truncateForLog(text: string, max = 800): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function logReview(payload: Record<string, unknown>): void {
  if (!shouldLogEventAi()) return
  console.log('[eventGeminiReview]', payload)
}

function resolveGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim() || null
}

/** `response.text()` кидає, якщо відповідь заблокована фільтрами. */
function safeResponseText(response: {
  text: () => string
  promptFeedback?: { blockReason?: string }
}): { ok: true; text: string } | { ok: false; blockReason?: string } {
  try {
    return { ok: true, text: response.text() }
  } catch (e: unknown) {
    const block = response.promptFeedback?.blockReason
    const msg = e instanceof Error ? e.message : String(e)
    logReview({ stage: 'response_blocked_or_empty', blockReason: block, message: truncateForLog(msg, 400) })
    return { ok: false, blockReason: block }
  }
}

/** Перевірка тексту заходу через модель Gemini (Google AI). */
export async function reviewVolunteerEventWithGemini(input: {
  title: string
  reason: string | null
  description: string | null
}): Promise<EventAiReviewResult> {
  const disabled = process.env.EVENT_AI_DISABLED?.trim().toLowerCase()
  const modelId = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'

  if (disabled === '1' || disabled === 'true') {
    logReview({ stage: 'skip', cause: 'EVENT_AI_DISABLED', model: modelId })
    return { type: 'pass' }
  }

  const apiKey = resolveGeminiApiKey()
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[eventGeminiReview] GEMINI_API_KEY (або GOOGLE_AI_API_KEY) відсутній — перевірку пропущено (лише режим розробки).',
      )
      logReview({ stage: 'skip', cause: 'no_api_key_development', model: modelId, outcome: { type: 'pass' } })
      return { type: 'pass' }
    }
    logReview({
      stage: 'error',
      cause: 'missing_key_production',
      model: modelId,
      outcome: { type: 'service_error', reason: 'missing_key' },
    })
    return { type: 'service_error', reason: 'missing_key' }
  }

  const singlePrompt = buildVolunteerEventReviewPrompt(input)
  const timeoutMs = Math.min(
    Math.max(Number(process.env.EVENT_AI_TIMEOUT_MS) || 28_000, 5_000),
    120_000,
  )
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), timeoutMs)

  const genAI = new GoogleGenerativeAI(apiKey)

  const runWithJsonMime = async (): Promise<string> => {
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(singlePrompt, {
      signal: controller.signal,
      timeout: timeoutMs,
    })
    const extracted = safeResponseText(result.response)
    if (!extracted.ok) {
      throw new Error(extracted.blockReason ? `blocked:${extracted.blockReason}` : 'empty_response')
    }
    return extracted.text
  }

  const runPlain = async (): Promise<string> => {
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 512,
      },
    })
    const result = await model.generateContent(singlePrompt, {
      signal: controller.signal,
      timeout: timeoutMs,
    })
    const extracted = safeResponseText(result.response)
    if (!extracted.ok) {
      throw new Error(extracted.blockReason ? `blocked:${extracted.blockReason}` : 'empty_response')
    }
    return extracted.text
  }

  try {
    let raw: string
    try {
      raw = await runWithJsonMime()
    } catch (first: unknown) {
      const msg = first instanceof Error ? first.message : String(first)
      const maybeMime =
        msg.toLowerCase().includes('responsemimetype') ||
        msg.toLowerCase().includes('json') ||
        msg.toLowerCase().includes('not supported')
      if (maybeMime) {
        raw = await runPlain()
      } else {
        throw first
      }
    }

    let parsed: { decision?: unknown; code?: unknown }
    try {
      parsed = JSON.parse(extractJsonObjectString(raw)) as { decision?: unknown; code?: unknown }
    } catch {
      logReview({
        stage: 'parsed',
        model: modelId,
        rawSnippet: truncateForLog(raw || '(empty)'),
        outcome: { type: 'service_error', reason: 'parse' },
      })
      return { type: 'service_error', reason: 'parse' }
    }

    const decision =
      parsed.decision === 'approve' || parsed.decision === 'reject' || parsed.decision === 'needs_review'
        ? parsed.decision
        : null
    if (!decision) {
      logReview({
        stage: 'parsed',
        model: modelId,
        rawSnippet: truncateForLog(raw),
        parsedModelFields: parsed,
        outcome: { type: 'service_error', reason: 'parse' },
      })
      return { type: 'service_error', reason: 'parse' }
    }

    if (decision === 'needs_review') {
      logReview({
        stage: 'gemini_ok',
        model: modelId,
        inputSummary: {
          title: truncateForLog(input.title, 200),
          hasReason: Boolean(input.reason?.trim()),
          hasDescription: Boolean(input.description?.trim()),
        },
        rawSnippet: truncateForLog(raw),
        geminiDecision: decision,
        geminiCode: parsed.code,
        outcome: { type: 'manual_review', cause: 'ambiguous' },
      })
      return { type: 'manual_review', cause: 'ambiguous' }
    }

    if (decision === 'approve') {
      logReview({
        stage: 'gemini_ok',
        model: modelId,
        inputSummary: {
          title: truncateForLog(input.title, 200),
          hasReason: Boolean(input.reason?.trim()),
          hasDescription: Boolean(input.description?.trim()),
        },
        promptChars: singlePrompt.length,
        rawSnippet: truncateForLog(raw),
        geminiDecision: decision,
        geminiCode: parsed.code,
        outcome: { type: 'pass' },
      })
      return { type: 'pass' }
    }

    const code = normalizeRejectCode(parsed.code)
    logReview({
      stage: 'gemini_ok',
      model: modelId,
      inputSummary: {
        title: truncateForLog(input.title, 200),
        hasReason: Boolean(input.reason?.trim()),
        hasDescription: Boolean(input.description?.trim()),
      },
      promptChars: singlePrompt.length,
      rawSnippet: truncateForLog(raw),
      geminiDecision: decision,
      geminiCode: parsed.code,
      normalizedRejectCode: code,
      outcome: { type: 'reject', code },
    })
    return { type: 'reject', code }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('aborted') || (e instanceof Error && e.name === 'AbortError')) {
      logReview({
        stage: 'request_failed',
        model: modelId,
        errorKind: 'timeout',
        message: truncateForLog(msg, 400),
        outcome: { type: 'service_error', reason: 'timeout' },
      })
      return { type: 'service_error', reason: 'timeout' }
    }
    logReview({
      stage: 'request_failed',
      model: modelId,
      errorKind: 'api',
      message: truncateForLog(msg, 600),
      outcome: { type: 'service_error', reason: 'api' },
    })
    return { type: 'service_error', reason: 'api' }
  } finally {
    clearTimeout(tid)
  }
}
