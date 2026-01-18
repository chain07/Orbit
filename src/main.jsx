import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './styles/index.css'

// Service Worker registration is now handled by vite-plugin-pwa via virtual module
// in components/system/UpdateManager.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
