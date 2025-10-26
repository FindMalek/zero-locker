import NextLink from "next/link"

interface LinkProps extends React.ComponentProps<"a"> {
  href: string
  children: React.ReactNode
  external?: boolean
}

export function Link({ href, children, external, className = "", ...props }: LinkProps) {
  const isExternal = external || href?.startsWith("http") || href?.startsWith("mailto:")
  
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-foreground transition-colors hover:text-primary ${className}`}
        {...props}
      >
        {children}
      </a>
    )
  }
  
  return (
    <NextLink
      href={href}
      className={`text-foreground transition-colors hover:text-primary ${className}`}
      {...props}
    >
      {children}
    </NextLink>
  )
}
