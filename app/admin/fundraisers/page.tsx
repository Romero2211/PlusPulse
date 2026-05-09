import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminFundraisersList from '@/components/admin/AdminFundraisersList'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Адмін · Збори',
  robots: { index: false, follow: false },
}

export default async function AdminFundraisersListPage() {
  await requireAdmin()

  const rows = await prisma.fundraiser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, tag: true, publishedAt: true, archivedAt: true, goalAmount: true, raisedAmount: true },
    take: 200,
  })

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminFundraisersList rows={rows} />
        </div>
      </main>
      <Footer />
    </>
  )
}

