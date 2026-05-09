import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { requireAdmin } from '@/lib/admin'

export const metadata: Metadata = {
  title: 'Адмін-панель | PlusPulse',
  description: 'Керування новинами та зборами.',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  await requireAdmin()

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </>
  )
}

