function PageHeader({ eyebrow, title, description, meta, actions }) {
  return (
    <section className="page-header">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{title}</h1>
        </div>

        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>

      {meta ? <div className="page-actions">{meta}</div> : null}
    </section>
  )
}

export default PageHeader
