function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        type="button"
        className="button secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Précédent
      </button>
      <span>
        Page {page} sur {totalPages}
      </span>
      <button
        type="button"
        className="button secondary"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Suivant →
      </button>
    </div>
  )
}

export default Pagination
