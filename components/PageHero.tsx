type PageHeroProps = {
  title: string
  description?: string
}

export default function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="page-hero" aria-label={title}>
      <div className="container">
        <h1 className="page-hero-title">{title}</h1>
        {description ? <p className="page-hero-desc">{description}</p> : null}
      </div>
    </section>
  )
}
