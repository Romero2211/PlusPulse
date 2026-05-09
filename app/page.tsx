import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import MVV from '@/components/MVV'
import ProgramsPreview from '@/components/ProgramsPreview'
import NewsPreview from '@/components/NewsPreview'
import TrustBlock from '@/components/TrustBlock'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const fundraiserRows = await prisma.fundraiser.findMany({
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

  const newsPreviewPosts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
    },
    take: 3,
  })

  const newsPreviewSerialized = newsPreviewPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    publishedAtIso: p.publishedAt!.toISOString(),
  }))

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <MVV />
        <ProgramsPreview fundraiserRows={fundraiserRows} />
        <NewsPreview posts={newsPreviewSerialized} />
        <TrustBlock />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
