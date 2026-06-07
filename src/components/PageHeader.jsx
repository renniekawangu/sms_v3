function PageHeader({ eyebrow, title, description, meta, actions }) {
  return (
    <section className="page-header">
      <div className="page-header-row">
        <div>
          {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>

        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>

      {meta ? <div className="page-actions">{meta}</div> : null}
    </section>
  )
}

export default PageHeader
