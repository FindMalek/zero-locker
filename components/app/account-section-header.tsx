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
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
    </div>
  )
}

