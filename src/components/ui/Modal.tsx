import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  showCloseButton?: boolean
  onConfirm?: () => void
  confirmText?: string
  onCancel?: () => void
  cancelText?: string
  loading?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

const variantIcons = {
  default: null,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info
}

const variantColors = {
  default: 'text-primary',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500'
}

export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  onConfirm,
  confirmText = 'Confirm',
  onCancel,
  cancelText = 'Cancel',
  loading = false
}: ModalProps) {
  const IconComponent = variantIcons[variant]
  const iconColor = variantColors[variant]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl border border-gray-200 animate-scale-in`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <IconComponent className={`w-6 h-6 ${iconColor}`} />
                )}
                <Dialog.Title className="text-xl font-display text-dark">
                  {title}
                </Dialog.Title>
              </div>
              
              {showCloseButton && (
                <Dialog.Close asChild>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  </button>
                </Dialog.Close>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>

            {/* Footer */}
            {(onConfirm || onCancel) && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelText}
                  </button>
                )}
                
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Specialized modal variants for common use cases
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  onCancel,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'warning' | 'error' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      variant={variant}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText={confirmText}
      cancelText={cancelText}
      loading={loading}
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  )
}

export function InfoModal({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  confirmText = 'Got it'
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  onConfirm?: () => void
  confirmText?: string
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      variant="info"
      onConfirm={onConfirm}
      confirmText={confirmText}
    >
      {children}
    </Modal>
  )
}
