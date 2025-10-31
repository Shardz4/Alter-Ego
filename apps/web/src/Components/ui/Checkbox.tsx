import React from 'react'
import clsx from 'clsx'

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={clsx('h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500', className)}
      {...props}
    />
  )
}

export default Checkbox
