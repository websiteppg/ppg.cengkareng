import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

function Badge({ className = "", ...props }: BadgeProps) {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} 
      {...props} 
    />
  )
}

export { Badge }