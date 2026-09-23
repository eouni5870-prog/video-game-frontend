function ErrorMessage({ error }) {
  if (!error) return null

  return (
    <div className="alert" role="alert">
      <strong>{error.message}</strong>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ErrorMessage
