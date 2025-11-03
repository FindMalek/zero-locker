interface AccountSectionHeaderProps {
  title: string
  description?: string
}

export function AccountSectionHeader({
  title,
  description,
}: AccountSectionHeaderProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

