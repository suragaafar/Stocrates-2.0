import * as React from 'react'
import { cn } from '@/lib/utils'

export interface StocratesCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'decorative' | 'game' | 'bordered'
  background?: 'cream' | 'blue' | 'gray' | 'white'
}

const StocratesCard = React.forwardRef<HTMLDivElement, StocratesCardProps>(
  ({ className, variant = 'default', background = 'cream', children, ...props }, ref) => {
    const backgrounds = {
      cream: 'bg-stocrates-cream',
      blue: 'bg-stocrates-blue',
      gray: 'bg-stocrates-gray',
      white: 'bg-white'
    }
    
    const variants = {
      // Simple card
      default: 'rounded-lg p-6',
      
      // Card with decorative corner circles (like in your images)
      decorative: 'relative border-3 border-stocrates-dark p-6 rounded-none before:absolute before:w-3 before:h-3 before:rounded-full before:border-3 before:border-stocrates-dark before:bg-stocrates-cream before:-top-1.5 before:-left-1.5 after:absolute after:w-3 after:h-3 after:rounded-full after:border-3 after:border-stocrates-dark after:bg-stocrates-cream after:-bottom-1.5 after:-right-1.5',
      
      // Game-style card with thick borders
      game: 'border-4 border-stocrates-dark rounded-none p-6',
      
      // Simple bordered card
      bordered: 'border-2 border-stocrates-dark rounded-lg p-6'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          backgrounds[background],
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StocratesCard.displayName = 'StocratesCard'

// Decorative frame component (for images and content boxes)
export interface DecorativeFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerColor?: 'dark' | 'blue' | 'cream'
  withMidPoints?: boolean
}

const DecorativeFrame = React.forwardRef<HTMLDivElement, DecorativeFrameProps>(
  ({ className, cornerColor = 'dark', withMidPoints = true, children, ...props }, ref) => {
    const cornerBgColor = cornerColor === 'dark' ? 'bg-stocrates-dark' : cornerColor === 'blue' ? 'bg-stocrates-blue' : 'bg-stocrates-cream'

    return (
      <div
        ref={ref}
        className={cn(
          'relative border-2 border-stocrates-dark rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        {/* Corner circles - positioned ON the border */}
        <div className={cn('absolute w-3 h-3 rounded-full border-2 border-stocrates-dark -top-1.5 -left-1.5 z-10', cornerBgColor)} />
        <div className={cn('absolute w-3 h-3 rounded-full border-2 border-stocrates-dark -top-1.5 -right-1.5 z-10', cornerBgColor)} />
        <div className={cn('absolute w-3 h-3 rounded-full border-2 border-stocrates-dark -bottom-1.5 -left-1.5 z-10', cornerBgColor)} />
        <div className={cn('absolute w-3 h-3 rounded-full border-2 border-stocrates-dark -bottom-1.5 -right-1.5 z-10', cornerBgColor)} />

        {/* Mid-point circles - positioned ON the border */}
        {withMidPoints && (
          <>
            <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-stocrates-dark bg-stocrates-cream -top-1.5 left-1/2 -translate-x-1/2 z-10" />
            <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-stocrates-dark bg-stocrates-cream -bottom-1.5 left-1/2 -translate-x-1/2 z-10" />
            <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-stocrates-dark bg-stocrates-cream -left-1.5 top-1/2 -translate-y-1/2 z-10" />
            <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-stocrates-dark bg-stocrates-cream -right-1.5 top-1/2 -translate-y-1/2 z-10" />
          </>
        )}
      </div>
    )
  }
)

DecorativeFrame.displayName = 'DecorativeFrame'

export { StocratesCard, DecorativeFrame }

