import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './utils/auth'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#211f1c',
            color: '#e8e3d8',
            border: '1px solid #403d38',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: { primary: '#52c278', secondary: '#0f0e0c' },
          },
          error: {
            iconTheme: { primary: '#e05252', secondary: '#0f0e0c' },
          },
        }}
      />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
