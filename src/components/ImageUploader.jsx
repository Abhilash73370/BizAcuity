

function ImageUploader({ onUpload }) {
  const handleImageChange = (e) => {
    onUpload(e)
  }

  return (
    <div style={{ marginBottom: '1em' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <span>Upload Images</span>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
      </label>
    </div>
  )
}

export default ImageUploader