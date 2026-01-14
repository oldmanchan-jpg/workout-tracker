import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface SwipeablePagesProps {
  children: React.ReactNode
}

export default function SwipeablePages({ children }: SwipeablePagesProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const minSwipeDistance = 75 // Minimum distance for a swipe

  // Define page order
  const pages = ['/', '/progress']
  const currentPageIndex = pages.indexOf(location.pathname)

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    touchEndX.current = e.targetTouches[0].clientX
    const diff = touchEndX.current - touchStartX.current
    
    // Add resistance at boundaries
    const canSwipeLeft = currentPageIndex < pages.length - 1
    const canSwipeRight = currentPageIndex > 0
    
    if ((diff < 0 && canSwipeLeft) || (diff > 0 && canSwipeRight)) {
      setSwipeOffset(diff * 0.3) // Dampened movement
    }
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setSwipeOffset(0)
      return
    }

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance // Swipe left = next page
    const isRightSwipe = distance < -minSwipeDistance // Swipe right = previous page

    if (isLeftSwipe && currentPageIndex < pages.length - 1) {
      navigate(pages[currentPageIndex + 1])
    } else if (isRightSwipe && currentPageIndex > 0) {
      navigate(pages[currentPageIndex - 1])
    }

    setSwipeOffset(0)
    touchStartX.current = null
    touchEndX.current = null
  }

  // Reset swipe offset when route changes
  useEffect(() => {
    setSwipeOffset(0)
  }, [location.pathname])

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="transition-transform duration-100"
      style={{ transform: `translateX(${swipeOffset}px)` }}
    >
      {children}
    </div>
  )
}
