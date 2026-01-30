interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
          {description}
        </p>
      )}
    </div>
  );
}
