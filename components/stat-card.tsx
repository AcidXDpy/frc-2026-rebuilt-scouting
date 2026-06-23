import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="gold-rule" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-primary">{value}</div>
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
