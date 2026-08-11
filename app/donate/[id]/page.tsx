import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FundraiserDetailView from '@/components/FundraiserDetailView'
import { prisma } from '@/lib/prisma'
import '@/app/fundraiser-detail.css'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const row = await prisma.fundraiser.findFirst({
    where: { id, publishedAt: { not: null }, archivedAt: null },
    select: { title: true, description: true },
  })
  if (!row) return { title: 'Збір | БО БФ «ПЛЮС ПУЛЬС»' }
  return {
    title: `${row.title} | Допомогти | БО БФ «ПЛЮС ПУЛЬС»`,
    description: row.description,
  }
}

export default async function FundraiserDetailPage(props: Props) {
  const { id } = await props.params

  const row = await prisma.fundraiser.findFirst({
    where: { id, publishedAt: { not: null }, archivedAt: null },
    select: {
      id: true,
      title: true,
      tag: true,
      description: true,
      goalAmount: true,
      raisedAmount: true,
      coverImageUrl: true,
      endsAt: true,
      monobankUrl: true,
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

  const fundraiser = {
    id: row.id,
    title: row.title,
    tag: row.tag,
    description: row.description,
    goalAmount: row.goalAmount,
    raisedAmount: row.raisedAmount,
    coverImageUrl: row.coverImageUrl,
    endsAtIso: row.endsAt?.toISOString() ?? null,
    monobankUrl: row.monobankUrl,
  }

  const reports = row.reports.map((r) => ({
    id: r.id,
    occurredAtIso: r.occurredAt.toISOString(),
    description: r.description,
    amount: r.amount,
  }))

  return (
    <>
      <Header />
      <main className="page-below-header fundraiser-detail-page">
        <div className="container">
          <FundraiserDetailView fundraiser={fundraiser} reports={reports} />
        </div>
      </main>
      <Footer />
    </>
  )
}
