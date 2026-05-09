import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { requireAdmin } from '@/lib/admin'
import AdminFundraiserForm from '@/components/admin/AdminFundraiserForm'

export const metadata: Metadata = {
  title: 'Адмін · Новий збір',
  robots: { index: false, follow: false },
}

export default async function AdminFundraisersNewPage() {
  await requireAdmin()

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminFundraiserForm mode="create" />
        </div>
      </main>
      <Footer />
    </>
  )
}

