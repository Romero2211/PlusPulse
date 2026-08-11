import type { Metadata } from 'next'
import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
import Footer from '@/components/Footer'
import LoginForm from '@/components/LoginForm'
import { isGoogleOAuthConfigured } from '@/lib/googleOAuth'

export const metadata: Metadata = {
  title: 'Вхід | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Вхід до облікового запису на сайті благодійного фонду «ПЛЮС ПУЛЬС».',
}

type Props = { searchParams: Promise<{ oauth?: string }> }

export default async function LoginPage(props: Props) {
  const { oauth } = await props.searchParams

  return (
    <>
      <Header />
      <main className="page-below-header register-page">
        <PageHero title="Вхід" description="Увійдіть до облікового запису PlusPulse." />
        <div className="container inner-page-body">
          <LoginForm googleAuthEnabled={isGoogleOAuthConfigured()} oauthError={oauth} />
        </div>
      </main>
      <Footer />
    </>
  )
}
