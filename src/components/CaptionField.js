import React from 'react';
import './CaptionField.css';

const CaptionField = ({ caption, onCaptionChange }) => {
  const handleChange = (e) => {
    onCaptionChange(e.target.value);
  };

  return (
    <div className="caption-field">
      <label htmlFor="caption">Caption:</label>
      <input
        type="text"
        id="caption"
        value={caption}
        onChange={handleChange}
        className="caption-input"
        placeholder="Add a descriptive caption (optional)"
      />
      <div className="caption-help">
        <p>Add a brief description about the garment or the desired result.</p>
      </div>
    </div>
  );
};

export default CaptionField; 
