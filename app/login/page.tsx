import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginForm from '@/components/LoginForm'

export const metadata: Metadata = {
  title: 'Вхід | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Вхід до облікового запису на сайті благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="page-below-header register-page">
        <div className="container">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
