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
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
      )}
    </div>
  )
}
