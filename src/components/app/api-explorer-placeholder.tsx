"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, PlaySquare } from "lucide-react";

interface ApiExplorerPlaceholderProps {
  schemaGenerated: boolean;
}

export function ApiExplorerPlaceholder({ schemaGenerated }: ApiExplorerPlaceholderProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TerminalSquare className="h-6 w-6" />
          Interactive API Explorer
        </CardTitle>
        <CardDescription>
          Test and explore your GraphQL API (e.g., using a GraphiQL-like interface).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/30">
          <PlaySquare className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">API Explorer Interface</h3>
          {schemaGenerated ? (
            <p className="text-muted-foreground">
              Your GraphQL schema has been generated. An interactive explorer (like GraphiQL or GraphQL Playground) would typically appear here to allow you to make queries and mutations against the live API endpoint.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Once a schema is generated from your data source, an interactive GraphQL API explorer will be available here.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            (Note: Full API endpoint creation and explorer are beyond the current scope. This is a placeholder.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
