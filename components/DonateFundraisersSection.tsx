import { prisma } from '@/lib/prisma'
import FundraiserActiveCards from '@/components/FundraiserActiveCards'

export default async function DonateFundraisersSection() {
  const rows = await prisma.fundraiser.findMany({
    where: { publishedAt: { not: null }, archivedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      tag: true,
      description: true,
      goalAmount: true,
      raisedAmount: true,
      coverImageUrl: true,
    },
    take: 50,
  })

  return (
    <section id="current-fundraisers" className="donate-fundraisers-section" aria-labelledby="donate-fundraisers-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="donate-fundraisers-heading" className="section-title">
            Актуальні збори
          </h2>
          <div className="section-divider" />
          <p className="section-description">
            Підтримайте відкриті збори фонду: прозорі цілі та звітність щодо зібраних коштів.
          </p>
        </div>
        <FundraiserActiveCards rows={rows} emptyMessage="Наразі немає активних зборів." />
      </div>
    </section>
  )
}
