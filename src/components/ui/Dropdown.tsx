import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, MoreHorizontal, Settings, Edit, Trash2, Copy, Eye } from 'lucide-react'

interface DropdownItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'danger' | 'success'
  separator?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

const variantColors = {
  default: 'text-gray-700 hover:bg-gray-100',
  danger: 'text-red-600 hover:bg-red-50',
  success: 'text-green-600 hover:bg-green-50'
}

export default function Dropdown({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  size = 'md',
  disabled = false
}: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {trigger}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50 animate-fade-in"
          align={align}
          side={side}
          sideOffset={5}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && (
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              )}
              
              <DropdownMenu.Item
                onClick={item.onClick}
                disabled={item.disabled}
                className={`
                  flex items-center gap-3 w-full px-3 py-2 rounded-md cursor-pointer transition-colors
                  ${sizeClasses[size]}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : variantColors[item.variant || 'default']}
                  ${!item.disabled && 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'}
                `}
              >
                {item.icon && (
                  <item.icon className="w-4 h-4" />
                )}
                {item.label}
              </DropdownMenu.Item>
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// Specialized dropdown for actions (edit, delete, etc.)
export function ActionsDropdown({
  onEdit,
  onDelete,
  onCopy,
  onView,
  onSettings,
  disabled = false,
  size = 'md'
}: {
  onEdit?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onView?: () => void
  onSettings?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const items: DropdownItem[] = []
  
  if (onView) {
    items.push({
      label: 'View',
      icon: Eye,
      onClick: onView,
      variant: 'default'
    })
  }
  
  if (onEdit) {
    items.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'default'
    })
  }
  
  if (onCopy) {
    items.push({
      label: 'Copy',
      icon: Copy,
      onClick: onCopy,
      variant: 'default'
    })
  }
  
  if (onSettings) {
    items.push({
      label: 'Settings',
      icon: Settings,
      onClick: onSettings,
      variant: 'default'
    })
  }
  
  if (onDelete) {
    if (items.length > 0) {
      items.push({ label: '', separator: true })
    }
    items.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger'
    })
  }

  return (
    <Dropdown
      trigger={
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          disabled={disabled}
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
        </button>
      }
      items={items}
      size={size}
      disabled={disabled}
    />
  )
}

// Specialized dropdown for select-like behavior
export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select option',
  disabled = false,
  size = 'md'
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const selectedOption = options.find(opt => opt.value === value)
  
  const items: DropdownItem[] = options.map(option => ({
    label: option.label,
    onClick: () => onChange(option.value),
    variant: option.value === value ? 'success' : 'default'
  }))

  return (
    <Dropdown
      trigger={
        <button
          className={`
            flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
            hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            transition-colors ${sizeClasses[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      }
      items={items}
      size={size}
      disabled={disabled}
    />
  )
}
