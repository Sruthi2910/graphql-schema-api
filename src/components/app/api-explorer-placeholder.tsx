
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Code2, Loader2, AlertTriangle, Copy, Eye } from "lucide-react";

interface ApiExamplesViewerProps {
  schemaGenerated: boolean; 
  exampleCode: string | null;
  isLoading: boolean;
  error: string | null; 
}

export function ApiExplorerPlaceholder({ schemaGenerated, exampleCode, isLoading, error }: ApiExamplesViewerProps) {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  // For copy and enabling view button if we only want it for *actual* code
  const hasActualExampleCodeToCopy = exampleCode !== null && exampleCode.trim() !== "" && !exampleCode.startsWith("# Query") && !exampleCode.startsWith("# Mutation") && !exampleCode.startsWith("#");
  const examplesForViewDialog = exampleCode || (error ? `Error: ${error}` : "# No API examples available.");


  const handleCopy = async () => {
    if (!hasActualExampleCodeToCopy || !navigator.clipboard) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: !hasActualExampleCodeToCopy ? "No actual API examples to copy." : "Clipboard API not available.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(exampleCode!);
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

  const renderCardContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Generating API examples...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error During Example Generation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertDescription className="mt-2">Example operations could not be generated.</AlertDescription>
        </Alert>
      );
    }
    
    let placeholderMessage = "API examples will appear here once a GraphQL schema is successfully generated and examples are available.";
    if (schemaGenerated && !error) { // Schema is generated and no error on examples
        if (exampleCode !== null && exampleCode.trim() !== "") { // Examples were attempted or exist
            if (hasActualExampleCodeToCopy) {
                placeholderMessage = "API examples generated. Click 'View API Examples' to display or 'Copy' them.";
            } else { // AI returned empty or placeholder examples
                placeholderMessage = "No specific API examples were generated for the current schema. Try editing the schema and regenerating examples.";
            }
        } else if (exampleCode === null && !isLoading) { // After generation attempt, explicitly no examples
             placeholderMessage = "No API examples were generated for the current schema. This can sometimes happen. Try editing the schema and regenerating examples.";
        }
    } else if (!schemaGenerated && !error && !isLoading) { // Before any generation or if schema failed
        placeholderMessage = "Generate a schema first to see API examples.";
    }


    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <Code2 className="h-16 w-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">API Examples Area</p>
            <p className="text-sm">{placeholderMessage}</p>
        </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              API Examples
            </CardTitle>
            <CardDescription>
              View and copy sample queries and mutations generated from the schema.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading} // Only disable if loading
                  aria-label="View API examples"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View API Examples
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Generated API Examples</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow rounded-md border bg-muted/30 min-h-[300px]">
                  <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
                    <code>{examplesForViewDialog}</code>
                  </pre>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={isLoading || error !== null || !hasActualExampleCodeToCopy}
                      aria-label="Copy example operations"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Examples
                    </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isLoading || error !== null || !hasActualExampleCodeToCopy}
              aria-label="Copy example operations from header"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Examples
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0 sm:p-6 sm:pt-0">
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
