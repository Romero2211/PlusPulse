import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RegisterForm from '@/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Реєстрація | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Реєстрація облікового запису для участі у волонтерських заходах благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="page-below-header register-page">
        <div className="container">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
