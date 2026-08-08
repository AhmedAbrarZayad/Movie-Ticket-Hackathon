import type { PropsWithChildren } from 'react'

interface PageContainerProps extends PropsWithChildren {
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-16 ${className}`}>{children}</div>
}
