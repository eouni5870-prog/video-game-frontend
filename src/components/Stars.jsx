// Shows a rating out of 5 (read only), or lets the user pick one when onChange is given.
function Stars({ value = 0, onChange, size = 'normal' }) {
  const rounded = Math.round(value)
  return (
    <span className={`stars stars-${size}${onChange ? ' stars-input' : ''}`} role={onChange ? 'radiogroup' : 'img'}
      aria-label={onChange ? 'Note' : `${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            className={n <= rounded ? 'star on' : 'star'}
            onClick={() => onChange(n)}
            role="radio"
            aria-checked={n === rounded}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ) : (
          <span key={n} className={n <= rounded ? 'star on' : 'star'} aria-hidden="true">
            ★
          </span>
        ),
      )}
    </span>
  )
}

export default Stars
