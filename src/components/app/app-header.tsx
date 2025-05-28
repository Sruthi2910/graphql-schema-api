import { Combine } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <Combine className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">
          GraphQL Factory
        </h1>
      </div>
    </header>
  );
}
