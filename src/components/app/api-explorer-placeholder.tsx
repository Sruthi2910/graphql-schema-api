
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2, AlertTriangle, Copy } from "lucide-react";

interface ApiExamplesViewerProps {
  schemaGenerated: boolean; 
  exampleCode: string | null;
  isLoading: boolean;
  error: string | null; 
}

export function ApiExplorerPlaceholder({ schemaGenerated, exampleCode, isLoading, error }: ApiExamplesViewerProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!exampleCode || exampleCode.trim() === "" || exampleCode.startsWith("#") || !navigator.clipboard) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: (!exampleCode || exampleCode.trim() === "" || exampleCode.startsWith("#")) ? "No actual API examples to copy." : "Clipboard API not available.",
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

  const canCopy = exampleCode !== null && exampleCode.trim() !== "" && !exampleCode.startsWith("#") && !isLoading && !error;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Generating schema and examples...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-auto">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error During Generation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertDescription className="mt-2">Example operations could not be generated due to this error.</AlertDescription>
        </Alert>
      );
    }

    let codeContent: string;
    if (exampleCode && exampleCode.trim() !== "" && !exampleCode.startsWith("#")) { // Check if it's actual code
      codeContent = exampleCode;
    } else if (schemaGenerated) { 
      codeContent = `# No API examples were generated for the current schema.\n# This can sometimes happen with complex or very generic schemas.\n# You can try editing the schema and regenerating examples.`;
    } else { 
      codeContent = `# API examples will appear here once a GraphQL schema is successfully generated.\n# Please use the form on the left to generate a schema first.`;
    }

    return (
      <ScrollArea className="flex-grow h-0 rounded-md border bg-muted/30">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
          <code>{codeContent}</code>
        </pre>
      </ScrollArea>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              API Examples
            </CardTitle>
            <CardDescription>
              Sample queries and mutations. Placeholders are shown if no examples are available.
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
        {renderContent()}
      </CardContent>
    </Card>
  );
}
