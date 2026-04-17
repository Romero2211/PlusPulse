import Link from 'next/link'

/**
 * Окрема сторінка 404 без залежності від клієнтського контексту —
 * знижує ризик помилок useContext під час пререндеру / static export.
 */
export default function NotFound() {
  return (
    <main
      style={{
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        minHeight: '50vh',
        maxWidth: '32rem',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Сторінку не знайдено
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>404 — запитаної адреси не існує.</p>
      <Link
        href="/"
        style={{
          color: '#2563eb',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        На головну
      </Link>
    </main>
  )
}
