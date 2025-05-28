
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileCode, Loader2, AlertTriangle, Info, Download } from "lucide-react";

interface SchemaViewerProps {
  schema: string | null;
  isLoading: boolean;
  error: string | null;
}

export function SchemaViewer({ schema, isLoading, error }: SchemaViewerProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!schema || schema.trim() === "") {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "No schema content to download.",
      });
      return;
    }
    try {
      const blob = new Blob([schema], { type: 'application/graphql;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'schema.graphql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({
        title: "Download Started",
        description: "Your schema.graphql file is downloading.",
      });
    } catch (err) {
      console.error("Failed to download schema:", err);
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Could not initiate schema download.",
      });
    }
  };

  const canDownload = schema !== null && schema.trim() !== "" && !isLoading && !error;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Generating schema...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-auto">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error Generating Schema</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (schema && schema.trim() !== "") {
      return (
        <ScrollArea className="flex-grow h-0 rounded-md border bg-muted/30">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
            <code>{schema}</code>
          </pre>
        </ScrollArea>
      );
    }
    
    if (schema !== null && schema.trim() === "") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
          <Info className="h-12 w-12 text-primary mb-4" />
          <p className="text-lg mb-1">Generated schema is empty.</p>
          <p className="text-sm">
            The AI processed the request but did not return any schema content. Try different inputs or be more specific.
          </p>
        </div>
      );
    }

    // Default case: schema is null (initial state or explicitly cleared)
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
        <Info className="h-12 w-12 text-primary mb-4" />
        <p className="text-lg mb-1">No schema generated yet.</p>
        <p className="text-sm">
          Connect to a data source to see the schema here.
        </p>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-6 w-6" />
              GraphQL Schema
            </CardTitle>
            <CardDescription>
              The AI-generated schema based on your data source.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!canDownload}
            aria-label="Download schema"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
