import React, { useEffect, useRef } from 'react'
import { SkipForward, Volume2, VolumeX, Sun, Moon, Monitor } from 'lucide-react'

// Skip to main content link
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <SkipForward className="w-4 h-4 mr-2 inline" />
      Skip to main content
    </a>
  )
}

// Theme toggle component
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system')
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-300'
        }`}
        aria-label="Light theme"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-300'
        }`}
        aria-label="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-300'
        }`}
        aria-label="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}

// Focus trap for modals
export function FocusTrap({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Live region for announcements
export function LiveRegion({ 
  children, 
  ariaLive = 'polite',
  className = ''
}: { 
  children: React.ReactNode
  ariaLive?: 'polite' | 'assertive' | 'off'
  className?: string
}) {
  return (
    <div 
      aria-live={ariaLive}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const handleKeyDown = (e: React.KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        onEnter?.()
        break
      case 'Escape':
        e.preventDefault()
        onEscape?.()
        break
    }
  }

  return { handleKeyDown }
}
