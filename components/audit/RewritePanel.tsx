export function RewritePanel({ rewrite }: { rewrite: string }) {
  return (
    <div className="rounded-lg border bg-secondary/45 p-4">
      <h3 className="text-sm font-medium">Suggested rewrite</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {rewrite}
      </p>
    </div>
  );
}
