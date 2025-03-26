import React, { useRef, useState } from 'react';
import './ImageSelector.css';

const ImageSelector = ({ title, onSelectImage, selectedImage }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        onSelectImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  return (
    <div className="image-selector">
      <h3>{title}</h3>
      <div 
        className={`dropzone ${dragActive ? 'active' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected" className="preview-image" />
        ) : (
          <div className="upload-prompt">
            <p>Click or drag an image</p>
            <span>Supports JPG, PNG, GIF up to 10MB</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
      {previewUrl && (
        <button 
          className="clear-button" 
          onClick={(e) => {
            e.stopPropagation();
            setPreviewUrl(null);
            onSelectImage(null);
            fileInputRef.current.value = '';
          }}
        >
          Remove Image
        </button>
      )}
    </div>
  );
};

export default ImageSelector; 
