import axios from 'axios';

// API configuration
const API_DOMAIN = process.env.REACT_APP_API_DOMAIN;
const API_BASE_PATH = '/api';
const API_KEY = process.env.REACT_APP_API_KEY;

// Validate environment variables
if (!API_DOMAIN || !API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  console.error('API_DOMAIN:', API_DOMAIN);
  console.error('API_KEY:', API_KEY ? 'Present' : 'Missing');
}

// Generate API URL
const getApiUrl = (path) => {
  return `https://${API_DOMAIN}${API_BASE_PATH}${path}`;
};

/**
 * Process two images through the virtual try-on API
 * @param {File} garmentImage - The garment image file
 * @param {File} modelImage - The model image file
 * @param {string} category - The category ID (1-upper_body, 2-lower_body, 3-dresses, 4-full_body, 5-hair)
 * @param {string} caption - Optional caption for the image
 * @param {Function} onStatusUpdate - Optional callback for status updates
 * @returns {Promise<string>} - The URL of the processed image
 */
export const processTryOn = async (garmentImage, modelImage, category, caption = '', onStatusUpdate = null) => {
  try {
    // Step 1: Create a task
    updateStatus(onStatusUpdate, 'Creating try-on task...');
    const createTaskResponse = await axios({
      method: 'post',
      url: getApiUrl('/create-task'),
      data: {
        user_img_name: modelImage.name,
        cloth_img_name: garmentImage.name,
        category,
        caption
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    // Check if the task creation was successful
    if (!createTaskResponse.data || createTaskResponse.data.code !== 0) {
      throw new Error(
        createTaskResponse.data?.message || 
        'Failed to create task. Server response was invalid.'
      );
    }
    
    // Get task data
    const taskData = createTaskResponse.data.data;
    const taskUuid = taskData.uuid;
    const userImgUrl = taskData.user_img_url;
    const clothImgUrl = taskData.cloth_img_url;
    
    // Step 2: Upload the model image
    updateStatus(onStatusUpdate, 'Uploading model image...');
    try {
      await axios({
        method: 'put',
        url: userImgUrl,
        data: modelImage,
        headers: {
          'Content-Type': modelImage.type
        }
      });
    } catch (error) {
      console.error('Failed to upload model image:', error);
      throw new Error('Failed to upload model image. Please try again.');
    }
    
    // Step 3: Upload the garment image
    updateStatus(onStatusUpdate, 'Uploading garment image...');
    try {
      await axios({
        method: 'put',
        url: clothImgUrl,
        data: garmentImage,
        headers: {
          'Content-Type': garmentImage.type
        }
      });
    } catch (error) {
      console.error('Failed to upload garment image:', error);
      throw new Error('Failed to upload garment image. Please try again.');
    }
    
    // Step 4: Submit the task
    updateStatus(onStatusUpdate, 'Submitting try-on task...');
    const submitTaskResponse = await axios({
      method: 'post',
      url: getApiUrl('/submit-task'),
      data: {
        task_uuid: taskUuid
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    // Check if the task submission was successful
    if (!submitTaskResponse.data || submitTaskResponse.data.code !== 0) {
      throw new Error(
        submitTaskResponse.data?.message || 
        'Failed to submit task. Server response was invalid.'
      );
    }
    
    // Step 5: Poll for the task status until it completes
    updateStatus(onStatusUpdate, 'Processing images... This may take a moment.');
    return await pollTaskStatus(taskUuid, onStatusUpdate);
  } catch (error) {
    console.error('Error processing try-on request:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
      throw new Error('No response from server. Please check your network connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

/**
 * Poll for task status until it completes
 * @param {string} taskUuid - The task UUID
 * @param {Function} onStatusUpdate - Optional callback for status updates
 * @returns {Promise<string>} - The URL of the processed image
 */
const pollTaskStatus = async (taskUuid, onStatusUpdate = null) => {
  return new Promise((resolve, reject) => {
    let pollCount = 0;
    const maxPolls = 30; // Maximum number of poll attempts (5 minutes at 10s intervals)
    
    const checkStatus = async () => {
      try {
        if (pollCount >= maxPolls) {
          reject(new Error('Task processing timed out. Please try again.'));
          return;
        }
        
        pollCount++;
        if (pollCount > 1) {
          updateStatus(onStatusUpdate, `Waiting for processing to complete... (${pollCount})`);
        }
        
        const response = await axios({
          method: 'post',
          url: getApiUrl('/get-task-info'),
          data: {
            task_uuid: taskUuid
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        
        if (!response.data || response.data.code !== 0) {
          reject(new Error(response.data?.message || 'Failed to get task status'));
          return;
        }
        
        const taskData = response.data.data;
        const status = taskData.status;
        
        if (status === 'successed') {
          // Task completed successfully
          updateStatus(onStatusUpdate, 'Processing complete! Displaying result...');
          resolve(taskData.tryon_img_url);
        } else if (status === 'failed') {
          // Task failed
          reject(new Error(taskData.err_msg || 'Processing failed'));
        } else {
          // Task is still processing, check again after 10 seconds
          updateStatus(onStatusUpdate, `Task status: ${status}. Checking again in 10 seconds...`);
          setTimeout(checkStatus, 10000);
        }
      } catch (error) {
        console.error('Error checking task status:', error);
        if (error.response) {
          reject(new Error(`Status check failed: ${error.response.status} - ${error.response.data?.message || error.message}`));
        } else if (error.request) {
          // Network error - try again
          updateStatus(onStatusUpdate, 'Network issue while checking status. Retrying in 10 seconds...');
          setTimeout(checkStatus, 10000);
        } else {
          reject(error);
        }
      }
    };
    
    // Start checking status
    checkStatus();
  });
};

/**
 * Update status via callback if provided
 * @param {Function} callback - Status update callback
 * @param {string} message - Status message
 */
const updateStatus = (callback, message) => {
  if (typeof callback === 'function') {
    callback(message);
  }
  console.log(message);
};

/**
 * Temporary mock implementation for development without an actual API
 * Remove this when connecting to a real API
 */
export const mockProcessTryOn = async (garmentImage, modelImage, category, caption = '') => {
  return new Promise((resolve) => {
    console.log(`Mock API called with category: ${category}, caption: ${caption}`);
    
    // Simulate API processing time
    setTimeout(() => {
      // For testing, we'll just return the model image
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(modelImage);
    }, 2000);
  });
}; 
