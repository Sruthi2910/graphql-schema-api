
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2, Info, AlertTriangle, FileWarning, Copy } from "lucide-react";

interface ApiExamplesViewerProps {
  schemaGenerated: boolean; 
  exampleCode: string | null;
  isLoading: boolean;
  error: string | null; 
}

export function ApiExplorerPlaceholder({ schemaGenerated, exampleCode, isLoading, error }: ApiExamplesViewerProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!exampleCode || exampleCode.trim() === "" || !navigator.clipboard) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: !exampleCode || exampleCode.trim() === "" ? "No examples to copy." : "Clipboard API not available.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(exampleCode);
      toast({ title: "Copied!", description: "Example operations copied to clipboard." });
    } catch (err) {
      console.error("Failed to copy examples:", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy examples to clipboard.",
      });
    }
  };

  const canCopy = exampleCode !== null && exampleCode.trim() !== "" && !isLoading && !error;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              Example GraphQL Operations
            </CardTitle>
            <CardDescription>
              Sample queries and mutations based on the generated schema.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!canCopy}
            aria-label="Copy example operations"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Generating schema and examples...</p>
            <p>This may take a moment.</p>
          </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive" className="my-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error During Generation</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertDescription className="mt-2">Example operations could not be generated due to this error.</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && !schemaGenerated && !exampleCode && ( 
           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/30 h-full">
            <Info className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Examples Yet</h3>
            <p className="text-muted-foreground">
              Connect to a data source and generate a schema to see example GraphQL operations here.
            </p>
          </div>
        )}

        {!isLoading && !error && exampleCode && exampleCode.trim() !== "" && ( 
          <ScrollArea className="flex-grow h-0 rounded-md border bg-muted/30">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
              <code>{exampleCode}</code>
            </pre>
          </ScrollArea>
        )}
        
        {!isLoading && !error && schemaGenerated && (!exampleCode || exampleCode.trim() === "") && ( 
           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/30 h-full">
            <FileWarning className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Examples Provided</h3>
            <p className="text-muted-foreground">
              { schemaGenerated && exampleCode === null ? "The AI did not provide example operations for the generated schema." : "The AI did not provide example operations."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This can sometimes happen with complex or very generic data source inputs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
