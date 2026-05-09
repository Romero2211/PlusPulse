import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminNewsList from '@/components/admin/AdminNewsList'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Адмін · Новини',
  robots: { index: false, follow: false },
}

export default async function AdminNewsListPage() {
  await requireAdmin()

  const rows = await prisma.newsPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, publishedAt: true, updatedAt: true },
    take: 200,
  })

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminNewsList rows={rows} />
        </div>
      </main>
      <Footer />
    </>
  )
}

