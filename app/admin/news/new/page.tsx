import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { requireAdmin } from '@/lib/admin'
import AdminNewsForm from '@/components/admin/AdminNewsForm'

export const metadata: Metadata = {
  title: 'Адмін · Нова новина',
  robots: { index: false, follow: false },
}

export default async function AdminNewsNewPage() {
  await requireAdmin()

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminNewsForm mode="create" />
        </div>
      </main>
      <Footer />
    </>
  )
}

