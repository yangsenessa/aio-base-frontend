
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add this to your index.js or main.js file
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error);
        });
    });
  }

createRoot(document.getElementById("root")!).render(<App />);
