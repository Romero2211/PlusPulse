/**
 * Прогін HTTP-сценаріїв PlusPulse (еквівалент набору для Cinimex Test Tool).
 * Результати: tests/cinimex/results/report.json та report.html
 *
 * Запуск: node scripts/run-cinimex-scenarios.mjs [--base=http://localhost:3000]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const configPath = join(root, 'tests', 'cinimex', 'pluspulse-scenarios.json')
const resultsDir = join(root, 'tests', 'cinimex', 'results')

const argBase = process.argv.find((a) => a.startsWith('--base='))?.slice(7)
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const baseUrl = (argBase || process.env.PLUSPULSE_TEST_BASE_URL || config.baseUrl).replace(/\/$/, '')

function normalizeHeaderValue(v) {
  if (v == null) return ''
  return String(v).trim().toLowerCase()
}

function statusOk(actual, expected) {
  const exp = Array.isArray(expected) ? expected : [expected]
  return exp.includes(actual)
}

async function runScenario(scenario) {
  const url = `${baseUrl}${scenario.path}`
  const started = Date.now()
  const init = {
    method: scenario.method || 'GET',
    redirect: scenario.followRedirects === false ? 'manual' : 'follow',
    headers: { Accept: 'text/html,application/json' },
  }

  let res
  let error = null
  try {
    res = await fetch(url, init)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    return {
      ...scenario,
      url,
      pass: false,
      durationMs: Date.now() - started,
      actualStatus: null,
      error,
      checks: [{ name: 'network', pass: false, detail: error }],
    }
  }

  const durationMs = Date.now() - started
  const bodyText = (await res.text()).slice(0, 500_000)
  const checks = []

  const statusPass = statusOk(res.status, scenario.expectedStatus)
  checks.push({
    name: 'HTTP status',
    pass: statusPass,
    detail: `очікувано ${JSON.stringify(scenario.expectedStatus)}, фактично ${res.status}`,
  })

  if (scenario.headerLocationContains) {
    const loc = res.headers.get('location') || ''
    const pass = loc.includes(scenario.headerLocationContains)
    checks.push({
      name: 'Location',
      pass,
      detail: pass ? loc : `очікувано *${scenario.headerLocationContains}*, отримано: ${loc || '(порожньо)'}`,
    })
  }

  if (scenario.expectedHeaders) {
    for (const [key, expectedVal] of Object.entries(scenario.expectedHeaders)) {
      const actual = normalizeHeaderValue(res.headers.get(key))
      const exp = normalizeHeaderValue(expectedVal)
      const pass = actual === exp || actual.includes(exp)
      checks.push({
        name: `Header ${key}`,
        pass,
        detail: pass ? actual : `очікувано ${exp}, фактично ${actual || '(немає)'}`,
      })
    }
  }

  if (scenario.bodyContains?.length) {
    const lower = bodyText.toLowerCase()
    for (const fragment of scenario.bodyContains) {
      const pass =
        bodyText.includes(fragment) || lower.includes(String(fragment).toLowerCase())
      checks.push({
        name: `Body contains "${fragment}"`,
        pass,
        detail: pass ? 'знайдено' : 'фрагмент відсутній у відповіді',
      })
    }
  }

  const pass = !error && checks.every((c) => c.pass)

  return {
    id: scenario.id,
    name: scenario.name,
    method: scenario.method || 'GET',
    path: scenario.path,
    url,
    pass,
    durationMs,
    actualStatus: res.status,
    checks,
    error: null,
  }
}

function buildHtml(report) {
  const rows = report.results
    .map((r) => {
      const status = r.pass ? 'PASS' : 'FAIL'
      const cls = r.pass ? 'pass' : 'fail'
      const checks = (r.checks || [])
        .map((c) => `<li class="${c.pass ? 'pass' : 'fail'}">${c.name}: ${c.detail}</li>`)
        .join('')
      return `<tr class="${cls}">
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.method}</td>
        <td><code>${r.path}</code></td>
        <td>${r.actualStatus ?? '—'}</td>
        <td>${r.durationMs} ms</td>
        <td><strong>${status}</strong></td>
      </tr>
      <tr class="detail ${cls}"><td colspan="7"><ul>${checks}</ul>${r.error ? `<p>${r.error}</p>` : ''}</td></tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8"/>
  <title>PlusPulse — звіт HTTP-сценаріїв (Cinimex Test Tool)</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #f8fafc; color: #0f172a; }
    h1 { font-size: 1.35rem; }
    .meta { color: #475569; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px #0001; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.65rem; text-align: left; font-size: 0.9rem; }
    th { background: #f1f5f9; }
    tr.pass td:nth-child(7) { color: #15803d; }
    tr.fail td:nth-child(7) { color: #b91c1c; }
    tr.detail td { font-size: 0.82rem; background: #fafafa; }
    tr.detail ul { margin: 0.25rem 0; padding-left: 1.25rem; }
    li.pass { color: #15803d; }
    li.fail { color: #b91c1c; }
    .summary { margin-top: 1rem; padding: 1rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <h1>PlusPulse — звіт прогону тестових сценаріїв</h1>
  <p class="meta">Базовий URL: <strong>${report.baseUrl}</strong> · Час: ${report.finishedAt} ·
    Пройдено: <strong>${report.passed}/${report.total}</strong> (${report.passRate}%)</p>
  <p class="meta">Набір сценаріїв для імпорту в <a href="https://cinimex.ru/solutions/cinimex-test-tool/">Cinimex Test Tool</a>
    — див. <code>tests/cinimex/README.md</code></p>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Сценарій</th><th>Метод</th><th>Шлях</th><th>HTTP</th><th>Час</th><th>Статус</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="summary">
    <p><strong>Підсумок:</strong> ${report.passed} успішних, ${report.failed} невдалих з ${report.total} сценаріїв.</p>
  </div>
</body>
</html>`
}

async function main() {
  mkdirSync(resultsDir, { recursive: true })

  console.log(`PlusPulse HTTP scenarios → ${baseUrl}\n`)

  const results = []
  for (const scenario of config.scenarios) {
    process.stdout.write(`${scenario.id} ${scenario.name} ... `)
    const result = await runScenario(scenario)
    results.push(result)
    console.log(result.pass ? 'PASS' : 'FAIL')
  }

  const passed = results.filter((r) => r.pass).length
  const failed = results.length - passed
  const finishedAt = new Date().toISOString()

  const report = {
    suite: config.suite,
    tool: 'PlusPulse HTTP runner (Cinimex Test Tool compatible scenarios)',
    documentation: config.documentation,
    baseUrl,
    finishedAt,
    total: results.length,
    passed,
    failed,
    passRate: Math.round((passed / results.length) * 1000) / 10,
    results,
  }

  const jsonPath = join(resultsDir, 'report.json')
  const htmlPath = join(resultsDir, 'report.html')
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')
  writeFileSync(htmlPath, buildHtml(report), 'utf8')

  console.log(`\nГотово: ${passed}/${results.length} PASS`)
  console.log(`JSON: ${jsonPath}`)
  console.log(`HTML: ${htmlPath}`)

  process.exit(failed > 0 ? 1 : 0)
}

main()
