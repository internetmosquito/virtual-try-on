# Virtual Try-On App

A React application that allows users to virtually try on clothing items using AI technology. The app uses the HeyBeauty.ai API to process images and generate virtual try-on results.

## Features

- Upload model and garment images
- Select clothing categories (upper body, lower body, dresses, full body, hair)
- Real-time status updates during processing
- Display of processed results
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A HeyBeauty.ai API key

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd virtual-try-on-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API key:
```
REACT_APP_API_KEY=your_api_key_here
REACT_APP_API_DOMAIN=heybeauty.ai
```

4. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Install the Vercel CLI (optional):
```bash
npm install -g vercel
```

3. Deploy using one of these methods:

   a. Using Vercel CLI:
   ```bash
   vercel
   ```

   b. Using Vercel Dashboard:
   - Go to [Vercel](https://vercel.com)
   - Import your Git repository
   - Configure the following environment variables in your project settings:
     ```
     REACT_APP_API_KEY=your_api_key_here
     REACT_APP_API_DOMAIN=heybeauty.ai
     ```
   - Deploy!

## Usage

1. Upload a model image (person wearing clothes)
2. Upload a garment image (clothing item to try on)
3. Select the appropriate category
4. Click "Try On" to process the images
5. Wait for the processing to complete
6. View the result

## Technologies Used

- React
- Axios for API calls
- Material-UI for components
- HeyBeauty.ai API

## License

MIT
