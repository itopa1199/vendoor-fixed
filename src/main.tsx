import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2600,
          style: {
            background: '#111',
            color: '#fff',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 700,
            padding: '11px 20px',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
)
