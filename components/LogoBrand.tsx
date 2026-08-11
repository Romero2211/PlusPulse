import Image from 'next/image'
import Link from 'next/link'

type LogoBrandProps = {
  /** header — навбар; footer — футер (трохи більший) */
  variant?: 'header' | 'footer'
  className?: string
  title?: string
}

export default function LogoBrand({
  variant = 'header',
  className = '',
  title = 'PlusPulse — благодійна організація',
}: LogoBrandProps) {
  const iconSize = variant === 'footer' ? 48 : 42

  return (
    <Link href="/" className={`logo-brand logo-brand--${variant} ${className}`.trim()} title={title}>
      <Image
        src="/icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="logo-brand-icon"
        priority={variant === 'header'}
      />
      <span className="logo-brand-text">PlusPulse</span>
    </Link>
  )
}
