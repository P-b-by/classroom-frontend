import { useCallback, useRef, useState } from 'react';
import { compressImage } from '../utils/compressImage.js';
import './ImageUpload.css';

export default function ImageUpload({ value, onChange, label = 'Product Image' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      setError('');
      setLoading(true);
      try {
        const dataUrl = await compressImage(file);
        onChange(dataUrl);
      } catch (err) {
        setError(err.message || 'Upload failed.');
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };

  const onFileSelect = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const clearImage = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="image-upload">
      <label className="image-upload-label">{label}</label>

      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt="Preview" />
          <div className="image-upload-preview-actions">
            <button type="button" className="btn btn-sm btn-outline" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={clearImage}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`image-upload-dropzone ${dragging ? 'is-dragging' : ''} ${loading ? 'is-loading' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !loading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload image by click or drag and drop"
        >
          {loading ? (
            <span className="dropzone-text">Processing image…</span>
          ) : (
            <>
              <svg className="dropzone-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="dropzone-title">Drag &amp; drop image here</span>
              <span className="dropzone-hint">or click to browse · JPG, PNG, WebP</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="image-upload-input"
        onChange={onFileSelect}
      />

      <div className="image-upload-url">
        <span className="url-divider">or paste image URL</span>
        <input
          type="url"
          value={value?.startsWith('http') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
}
