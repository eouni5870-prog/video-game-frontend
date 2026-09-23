import { useRef, useState } from 'react'
import { api } from '../api'

// Lets the user upload a picture from the computer (or paste a link) and shows a preview.
function ImagePicker({ value, onChange, token, onError }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [showUrl, setShowUrl] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onError(new Error('Choisissez une image (jpg, png, gif, webp).'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onError(new Error("L'image doit faire moins de 5 Mo."))
      return
    }
    setUploading(true)
    try {
      const { url } = await api.uploadImage(file, token)
      onChange(url)
    } catch (err) {
      onError(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-picker">
      <div
        className={value ? 'image-drop has-image' : 'image-drop'}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFile(e.dataTransfer.files?.[0])
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="Aperçu" />
        ) : (
          <div className="image-drop-text">
            <span className="image-drop-icon">📷</span>
            <strong>{uploading ? 'Envoi…' : 'Ajouter une photo'}</strong>
            <span>Cliquez ou glissez une image ici</span>
          </div>
        )}
        {uploading && value && <div className="image-uploading">Envoi…</div>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className="image-picker-actions">
        {value && (
          <button type="button" className="link" onClick={() => onChange('')}>
            Retirer la photo
          </button>
        )}
        <button type="button" className="link" onClick={() => setShowUrl(!showUrl)}>
          {showUrl ? 'Masquer le lien' : 'Utiliser un lien'}
        </button>
      </div>

      {showUrl && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/image.png"
          maxLength={500}
        />
      )}
    </div>
  )
}

export default ImagePicker
