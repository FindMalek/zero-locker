interface AccountPageHeaderProps {
  title: string
  description?: string
}

export function AccountPageHeader({
  title,
  description,
}: AccountPageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
    </div>
  )
}

