
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error overlay component
function GlobalErrorOverlay({ message, stack }: { message: string; stack?: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#010101',
        color: '#ffffff',
        padding: '2rem',
        overflow: 'auto',
        zIndex: 99999,
        fontFamily: 'monospace',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ffffff' }}>
        Global error
      </h1>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 'semibold', marginBottom: '0.5rem', color: '#ffffff' }}>
          Message:
        </h2>
        <pre
          style={{
            fontSize: '0.75rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '0.25rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </pre>
      </div>
      {stack && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 'semibold', marginBottom: '0.5rem', color: '#ffffff' }}>
            Stack:
          </h2>
          <pre
            style={{
              fontSize: '0.75rem',
              color: '#ffffff',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'auto',
              maxHeight: '50vh',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {stack}
          </pre>
        </div>
      )}
    </div>
  )
}

// Global error handler for synchronous errors
window.addEventListener('error', (event) => {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = ''
    const overlay = document.createElement('div')
    root.appendChild(overlay)
    ReactDOM.createRoot(overlay).render(
      <GlobalErrorOverlay
        message={event.message || String(event.error || 'Unknown error')}
        stack={event.error?.stack}
      />
    )
  }
})

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = ''
    const overlay = document.createElement('div')
    root.appendChild(overlay)
    const reason = event.reason
    const message = reason?.message || String(reason || 'Unhandled promise rejection')
    const stack = reason?.stack
    ReactDOM.createRoot(overlay).render(
      <GlobalErrorOverlay message={message} stack={stack} />
    )
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <div className="fixed bottom-2 left-2 text-xs text-white/30 pointer-events-none">
      mounted
    </div>
  </React.StrictMode>
)
