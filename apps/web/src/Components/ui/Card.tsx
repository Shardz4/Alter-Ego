import React from 'react'
import clsx from 'clsx'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx('mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm', className)}
      {...props}
    />
  )
}

export default Card
