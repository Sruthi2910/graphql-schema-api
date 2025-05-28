"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCode, Loader2, AlertTriangle, Info } from "lucide-react";

interface SchemaViewerProps {
  schema: string | null;
  isLoading: boolean;
  error: string | null;
}

export function SchemaViewer({ schema, isLoading, error }: SchemaViewerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-6 w-6" />
          Generated GraphQL Schema
        </CardTitle>
        <CardDescription>
          The AI-generated schema based on your data source.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Generating schema...</p>
            <p>This may take a moment.</p>
          </div>
        )}
        {error && !isLoading && (
          <Alert variant="destructive" className="my-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error Generating Schema</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && schema && (
          <ScrollArea className="flex-grow h-0 rounded-md border bg-muted/30">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
              <code>{schema}</code>
            </pre>
          </ScrollArea>
        )}
        {!isLoading && !error && !schema && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Info className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg">No schema generated yet.</p>
            <p>Connect to a data source to see the schema here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
