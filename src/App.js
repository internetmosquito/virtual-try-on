import React, { useState, useEffect } from 'react';
import './App.css';
import ImageSelector from './components/ImageSelector';
import ResultDisplay from './components/ResultDisplay';
import CategorySelector from './components/CategorySelector';
import CaptionField from './components/CaptionField';
import CorsHelper from './components/CorsHelper';
import { processTryOn } from './services/apiService';

function App() {
  const [garmentImage, setGarmentImage] = useState(null);
  const [modelImage, setModelImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showCorsHelper, setShowCorsHelper] = useState(false);

  // Show CORS helper if we detect a CORS error
  useEffect(() => {
    if (error && (
      error.includes('Network Error') || 
      error.includes('CORS') || 
      error.includes('network') ||
      error.includes('Failed to fetch')
    )) {
      setShowCorsHelper(true);
    }
  }, [error]);

  const handleGarmentSelect = (image) => {
    setGarmentImage(image);
    setResultImage(null);
    setError(null);
  };

  const handleModelSelect = (image) => {
    setModelImage(image);
    setResultImage(null);
    setError(null);
  };

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory);
    setResultImage(null);
    setError(null);
  };

  const handleCaptionChange = (text) => {
    setCaption(text);
  };

  const updateStatus = (status) => {
    setProcessingStatus(status);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    handleMixImages();
  };

  const handleMixImages = async () => {
    if (!garmentImage || !modelImage) {
      setError('Please select both a garment and a model image');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingStatus('Initializing try-on process...');
      
      // Using the real API service with status updates
      const resultUrl = await processTryOn(garmentImage, modelImage, category, caption, updateStatus);
      setResultImage(resultUrl);
      setProcessingStatus('');
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to process images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Virtual Try-On</h1>
        <p>Select a garment and a model to see how they look together</p>
      </header>
      
      <main className="app-main">
        <div className="selectors-container">
          <ImageSelector 
            title="Select Garment Image" 
            onSelectImage={handleGarmentSelect} 
            selectedImage={garmentImage}
          />
          <ImageSelector 
            title="Select Model Image" 
            onSelectImage={handleModelSelect} 
            selectedImage={modelImage}
          />
        </div>

        <div className="form-controls">
          <CategorySelector 
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
          />
          <CaptionField 
            caption={caption}
            onCaptionChange={handleCaptionChange}
          />
        </div>

        <button 
          className="mix-button" 
          onClick={handleMixImages} 
          disabled={!garmentImage || !modelImage || !category || loading}
        >
          {loading ? 'Processing...' : 'Try On Garment'}
        </button>

        {error && (
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
        {loading && processingStatus && <div className="processing-status">{processingStatus}</div>}
        
        <ResultDisplay resultImage={resultImage} loading={loading} />
      </main>

      <CorsHelper 
        visible={showCorsHelper} 
        onClose={() => setShowCorsHelper(false)} 
      />
    </div>
  );
}

export default App; 
