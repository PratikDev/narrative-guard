export function OriginalRewriteComparison({
  original,
  rewrite,
}: {
  original: string;
  rewrite: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border bg-background p-4">
        <h3 className="text-sm font-medium">Original</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {original}
        </p>
      </section>
      <section className="rounded-lg border border-primary/40 bg-primary/10 p-4">
        <h3 className="text-sm font-medium">Rewritten</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {rewrite}
        </p>
      </section>
    </div>
  );
}
