import React, { useState, useEffect } from 'react';
import './ResultDisplay.css';

// Same CORS proxies as in apiService.js
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];
const ACTIVE_PROXY = CORS_PROXIES[0];

// Helper to create a proxied URL
const getProxiedImageUrl = (url) => {
  if (!url || !url.startsWith('http')) return url;
  return `${ACTIVE_PROXY}${encodeURIComponent(url)}`;
};

const ResultDisplay = ({ resultImage, loading }) => {
  const [localImageUrl, setLocalImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // When the result image URL is provided, fetch it via proxy 
  useEffect(() => {
    const fetchImage = async () => {
      if (resultImage && resultImage.startsWith('http')) {
        try {
          // Use a CORS proxy for the image URL
          const proxyUrl = getProxiedImageUrl(resultImage);
          
          // Try to fetch the image to handle CORS issues
          const response = await fetch(proxyUrl, { 
            mode: 'cors',
            credentials: 'omit' // Don't send credentials
          });
          
          if (!response.ok) {
            throw new Error(`Image loading failed: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setLocalImageUrl(objectUrl);
          setImageError(false);
        } catch (error) {
          console.error('Error fetching image:', error);
          // Fall back to direct URL if fetch fails
          setLocalImageUrl(resultImage);
          setImageError(true);
        }
      } else {
        setLocalImageUrl(resultImage);
        setImageError(false);
      }
    };
    
    if (resultImage) {
      fetchImage();
    } else {
      setLocalImageUrl(null);
      setImageError(false);
    }
    
    // Clean up object URL on unmount or when resultImage changes
    return () => {
      if (localImageUrl && localImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [resultImage]);

  if (loading) {
    return (
      <div className="result-display">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing your try-on request...</p>
          <p className="loading-note">This may take up to a minute to complete.</p>
        </div>
      </div>
    );
  }

  if (!localImageUrl) {
    return (
      <div className="result-display empty">
        <p>Your try-on result will appear here</p>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      // Use CORS proxy for downloading the image
      const proxyUrl = getProxiedImageUrl(resultImage);
      
      const response = await fetch(proxyUrl, { 
        mode: 'cors',
        credentials: 'omit' // Don't send credentials
      });
      
      if (!response.ok) {
        throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'try-on-result.jpg';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try opening the image in a new tab and saving it manually.');
      // Open image in new tab as fallback
      window.open(resultImage, '_blank');
    }
  };

  return (
    <div className="result-display">
      <h3>Try-On Result</h3>
      <div className="result-image-container">
        <img 
          src={localImageUrl} 
          alt="Try-on result" 
          className={`result-image ${imageError ? 'image-error' : ''}`}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="image-error-message">
            <p>There was an issue displaying the image. Try viewing it in full size.</p>
          </div>
        )}
      </div>
      <div className="result-actions">
        <button 
          className="download-button" 
          onClick={handleDownload}
        >
          Download Image
        </button>
        <a 
          href={getProxiedImageUrl(resultImage)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="view-button"
        >
          View Full Size
        </a>
      </div>
    </div>
  );
};

export default ResultDisplay; 
