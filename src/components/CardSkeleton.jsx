// Grey shimmering cards shown while the characters are loading
function CardSkeleton({ count = 8 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton skeleton-cover" />
          <div className="card-body">
            <div className="skeleton skeleton-line" style={{ width: '70%' }} />
            <div className="skeleton skeleton-line" style={{ width: '45%' }} />
            <div className="skeleton skeleton-line thin" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton
