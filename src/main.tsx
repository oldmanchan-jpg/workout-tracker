import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Log mount attempt
console.log('[main.tsx] Starting React mount...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 2rem; background: #111; color: #f44; min-height: 100vh; font-family: system-ui;">
      <h1>Fatal: No #root element found</h1>
      <p>Check index.html has &lt;div id="root"&gt;&lt;/div&gt;</p>
    </div>
  `
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('[main.tsx] React mounted successfully')
  } catch (err) {
    console.error('[main.tsx] React mount failed:', err)
    rootElement.innerHTML = `
      <div style="padding: 2rem; background: #111; color: #f44; min-height: 100vh; font-family: system-ui;">
        <h1>React mount failed</h1>
        <pre style="background: #222; padding: 1rem; overflow: auto;">${err}</pre>
      </div>
    `
  }
}