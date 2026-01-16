import { useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

// Minimal swipe wrapper for mobile: swiping left/right switches between Dashboard and Progress.
// If your routes differ, this still compiles and behaves as a normal Outlet wrapper.
export default function SwipeablePages(props: any) {
  const navigate = useNavigate()
  const location = useLocation()

  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    startX.current = t.clientX
    startY.current = t.clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null) return
    const t = e.changedTouches[0]
    const dx = t.clientX - startX.current
    const dy = t.clientY - startY.current

    startX.current = null
    startY.current = null

    // ignore vertical scroll gestures
    if (Math.abs(dy) > Math.abs(dx)) return

    const threshold = 60
    if (Math.abs(dx) < threshold) return

    const path = location.pathname
    const dashPath = path === '/' ? '/dashboard' : '/dashboard'

    if (dx < 0) {
      // swipe left
      if (path === '/' || path === '/dashboard') navigate('/progress')
    } else {
      // swipe right
      if (path === '/progress') navigate(dashPath)
    }
  }

  return (
    <div className="min-h-screen" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <main className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-4">
        {props?.children ? props.children : <Outlet />}
      </main>
      <BottomNav />
    </div>
  )
}
