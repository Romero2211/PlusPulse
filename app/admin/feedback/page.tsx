import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminFeedbackList, { type AdminFeedbackRow } from '@/components/admin/AdminFeedbackList'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Адмін · Побажання',
  robots: { index: false, follow: false },
}

export default async function AdminFeedbackPage() {
  await requireAdmin()

  const rows = await prisma.contactFeedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      createdAt: true,
    },
  })

  const wire: AdminFeedbackRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    message: r.message,
    createdAtIso: r.createdAt.toISOString(),
  }))

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminFeedbackList rows={wire} />
        </div>
      </main>
      <Footer />
    </>
  )
}
