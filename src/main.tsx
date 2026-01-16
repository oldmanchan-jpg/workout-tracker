
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <div className="fixed bottom-2 left-2 text-xs text-white/30 pointer-events-none">
      mounted
    </div>
  </React.StrictMode>
)
