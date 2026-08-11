import type { Metadata } from 'next'
import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
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
        <PageHero title="Вхід" description="Увійдіть до облікового запису PlusPulse." />
        <div className="container inner-page-body">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
