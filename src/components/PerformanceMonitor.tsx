import React, { useEffect, useState } from 'react'
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcp = entries[0] as PerformanceEntry
      setMetrics(prev => ({ ...prev, fcp: fcp.startTime }))
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1] as PerformanceEntry
      setMetrics(prev => ({ ...prev, lcp: lcp.startTime }))
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fid = entries[0] as any
      if (fid.processingStart) {
        setMetrics(prev => ({ ...prev, fid: fid.processingStart - fid.startTime }))
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value || 0
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }))
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      setMetrics(prev => ({ ...prev, ttfb: navigationEntry.responseStart - navigationEntry.requestStart }))
    }

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const getScore = (metric: keyof PerformanceMetrics): 'good' | 'needs-improvement' | 'poor' => {
    const value = metrics[metric]
    if (value === null) return 'needs-improvement'

    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
      case 'lcp':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
      case 'fid':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
      case 'cls':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor'
      case 'ttfb':
        return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor'
      default:
        return 'needs-improvement'
    }
  }

  const getScoreColor = (score: 'good' | 'needs-improvement' | 'poor') => {
    switch (score) {
      case 'good': return 'text-green-500'
      case 'needs-improvement': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
    }
  }

  const getScoreIcon = (score: 'good' | 'needs-improvement' | 'poor') => {
    switch (score) {
      case 'good': return <TrendingUp className="w-4 h-4" />
      case 'needs-improvement': return <Activity className="w-4 h-4" />
      case 'poor': return <Zap className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40"
        aria-label="Toggle performance monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 z-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">First Contentful Paint</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(getScore('fcp'))}
                <span className={`text-sm font-medium ${getScoreColor(getScore('fcp'))}`}>
                  {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Largest Contentful Paint</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(getScore('lcp'))}
                <span className={`text-sm font-medium ${getScoreColor(getScore('lcp'))}`}>
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">First Input Delay</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(getScore('fid'))}
                <span className={`text-sm font-medium ${getScoreColor(getScore('fid'))}`}>
                  {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cumulative Layout Shift</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(getScore('cls'))}
                <span className={`text-sm font-medium ${getScoreColor(getScore('cls'))}`}>
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time to First Byte</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(getScore('ttfb'))}
                <span className={`text-sm font-medium ${getScoreColor(getScore('ttfb'))}`}>
                  {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Development Mode Only</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
