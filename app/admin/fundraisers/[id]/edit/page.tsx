import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import AdminFundraiserForm from '@/components/admin/AdminFundraiserForm'
import AdminFundraiserReportsPanel from '@/components/admin/AdminFundraiserReportsPanel'

export const metadata: Metadata = {
  title: 'Адмін · Редагування збору',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminFundraisersEditPage(props: Props) {
  await requireAdmin()
  const { id } = await props.params

  const row = await prisma.fundraiser.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      tag: true,
      description: true,
      goalAmount: true,
      raisedAmount: true,
      coverImageUrl: true,
      publishedAt: true,
      archivedAt: true,
      reports: {
        orderBy: { occurredAt: 'desc' },
        select: {
          id: true,
          occurredAt: true,
          description: true,
          amount: true,
        },
      },
    },
  })
  if (!row) notFound()

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminFundraiserForm
            mode="edit"
            initial={{
              id: row.id,
              title: row.title,
              tag: row.tag,
              description: row.description,
              goalAmount: row.goalAmount,
              raisedAmount: row.raisedAmount,
              coverImageUrl: row.coverImageUrl,
              published: !!row.publishedAt,
              archived: !!row.archivedAt,
            }}
          />
          <AdminFundraiserReportsPanel
            fundraiserId={row.id}
            reports={row.reports.map((r) => ({
              id: r.id,
              occurredAtIso: r.occurredAt.toISOString(),
              description: r.description,
              amount: r.amount,
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

