import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import AdminNewsForm from '@/components/admin/AdminNewsForm'

export const metadata: Metadata = {
  title: 'Адмін · Редагування новини',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ id: string }> }

export default async function AdminNewsEditPage(props: Props) {
  await requireAdmin()
  const { id } = await props.params

  const row = await prisma.newsPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      gallery: true,
      publishedAt: true,
    },
  })
  if (!row) notFound()

  const galleryUrls: string[] =
    Array.isArray(row.gallery) && row.gallery.every((x) => typeof x === 'string')
      ? (row.gallery as string[])
      : []

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminNewsForm
            mode="edit"
            initial={{
              id: row.id,
              title: row.title,
              slug: row.slug,
              excerpt: row.excerpt,
              body: row.body,
              coverImageUrl: row.coverImageUrl,
              galleryUrls,
              published: !!row.publishedAt,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

