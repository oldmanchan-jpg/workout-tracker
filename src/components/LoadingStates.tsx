import React from 'react'

// Skeleton loading component for cards
export const CardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`card p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
)

// Skeleton for workout cards
export const WorkoutCardSkeleton = () => (
  <div className="card-dark p-4 animate-pulse">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        <div>
          <div className="h-5 bg-gray-600 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-20"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-600 rounded"></div>
        <div className="w-16 h-8 bg-gray-600 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="h-5 bg-gray-500 rounded w-8 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-500 rounded w-16 mx-auto"></div>
      </div>
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="h-5 bg-gray-500 rounded w-8 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-500 rounded w-16 mx-auto"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-600 rounded w-20"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-600 rounded w-24"></div>
      </div>
    </div>
  </div>
)

// Skeleton for template cards
export const TemplateCardSkeleton = () => (
  <div className="card-dark p-6 animate-pulse">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
        <div>
          <div className="h-5 bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-20"></div>
        </div>
      </div>
      <div className="w-6 h-6 bg-gray-600 rounded"></div>
    </div>
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="h-5 bg-gray-500 rounded w-8 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-500 rounded w-16 mx-auto"></div>
      </div>
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="h-5 bg-gray-500 rounded w-8 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-500 rounded w-16 mx-auto"></div>
      </div>
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="h-5 bg-gray-500 rounded w-8 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-500 rounded w-16 mx-auto"></div>
      </div>
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
      <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-600 rounded w-24"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-600 rounded w-20"></div>
      </div>
    </div>
    <div className="w-full h-10 bg-gray-600 rounded-lg"></div>
  </div>
)

// Skeleton for table rows
export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="py-4 px-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="py-4 px-4">
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded"></div>
        <div className="w-16 h-8 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
)

// Enhanced loading spinner
export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto ${className}`}></div>
  )
}

// Page loading overlay
export const PageLoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <div className="text-lg font-medium text-dark">{message}</div>
    </div>
  </div>
)

// Content loading skeleton
export const ContentSkeleton = ({ type = 'card', count = 3 }: { type?: 'card' | 'workout' | 'template'; count?: number }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'workout':
        return <WorkoutCardSkeleton />
      case 'template':
        return <TemplateCardSkeleton />
      default:
        return <CardSkeleton />
    }
  }
  
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Progress bar skeleton
export const ProgressBarSkeleton = () => (
  <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse">
    <div className="bg-primary h-2 rounded-full w-1/3 animate-pulse"></div>
  </div>
)

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-primary-light rounded-lg p-4 animate-pulse">
    <div className="h-8 bg-white/20 rounded w-16 mx-auto mb-2"></div>
    <div className="h-4 bg-white/20 rounded w-24 mx-auto"></div>
  </div>
)
