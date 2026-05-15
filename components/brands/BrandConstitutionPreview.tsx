import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BrandConstitutionPreview({
  constitution,
}: {
  constitution: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Constitution preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-40 rounded-lg border bg-tertiary/45 p-4">
          {constitution ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {constitution}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Saved brand rules will appear here after you enter a constitution.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
