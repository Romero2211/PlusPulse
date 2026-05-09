import { redirect } from 'next/navigation'

/** Колись був окремий розділ «Збори»; тепер збори на сторінці «Допомогти». */
export default function FundraisersPageLegacyRedirect() {
  redirect('/donate')
}
