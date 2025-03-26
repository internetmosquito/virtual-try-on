import React, { useState } from 'react';
import './CorsHelper.css';

const CorsHelper = ({ visible, onClose }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="cors-helper">
      <div className="cors-helper-content">
        <h3>Having trouble loading images?</h3>
        <p>
          This application may experience issues with Cross-Origin Resource Sharing (CORS) restrictions. 
          To solve this, you can install a CORS-bypass browser extension:
        </p>
        <ul>
          <li>
            <a 
              href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              CORS Unblock for Chrome
            </a>
          </li>
          <li>
            <a 
              href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              CORS Everywhere for Firefox
            </a>
          </li>
        </ul>
        <p className="cors-notes">
          After installing, enable the extension and refresh this page.
        </p>
        <button className="cors-dismiss-button" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default CorsHelper; 
