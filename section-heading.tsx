import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function Stub({ title, note }: { title: string; note?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Construction className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {note ?? "This module ships in a later phase — the database and permissions are already in place."}
      </p>
    </Card>
  );
}
