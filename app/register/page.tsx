import type { Metadata } from 'next'
import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
import Footer from '@/components/Footer'
import RegisterForm from '@/components/RegisterForm'
import { isGoogleOAuthConfigured } from '@/lib/googleOAuth'

export const metadata: Metadata = {
  title: 'Реєстрація | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Реєстрація облікового запису для участі у волонтерських заходах благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="page-below-header register-page">
        <PageHero title="Реєстрація" description="Створіть обліковий запис для участі у заходах фонду." />
        <div className="container inner-page-body">
          <RegisterForm googleAuthEnabled={isGoogleOAuthConfigured()} />
        </div>
      </main>
      <Footer />
    </>
  )
}
