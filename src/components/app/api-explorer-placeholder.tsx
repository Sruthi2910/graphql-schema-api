
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code2, Loader2, Info, AlertTriangle, FileWarning } from "lucide-react";

interface ApiExamplesViewerProps {
  schemaGenerated: boolean; // True if schema generation was attempted and didn't throw a top-level error
  exampleCode: string | null;
  isLoading: boolean;
  error: string | null; // Error from the main page generation process
}

export function ApiExplorerPlaceholder({ schemaGenerated, exampleCode, isLoading, error }: ApiExamplesViewerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-6 w-6" />
          Example GraphQL Operations
        </CardTitle>
        <CardDescription>
          Sample queries and mutations based on the generated schema. You can copy these to test your API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Generating schema and examples...</p>
            <p>This may take a moment.</p>
          </div>
        )}

        {!isLoading && error && ( /* If there was a general error generating anything */
          <Alert variant="destructive" className="my-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error During Generation</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertDescription className="mt-2">Example operations could not be generated due to this error.</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && !schemaGenerated && ( /* Initial state, nothing generated yet */
           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/30 h-full">
            <Info className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Examples Yet</h3>
            <p className="text-muted-foreground">
              Connect to a data source and generate a schema to see example GraphQL operations here.
            </p>
          </div>
        )}

        {!isLoading && !error && schemaGenerated && exampleCode && ( /* Success: Schema and examples generated */
          <ScrollArea className="flex-grow h-0 rounded-md border bg-muted/30">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
              <code>{exampleCode}</code>
            </pre>
          </ScrollArea>
        )}
        
        {!isLoading && !error && schemaGenerated && !exampleCode && ( /* Schema generated, but no examples returned by AI */
           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/30 h-full">
            <FileWarning className="h-16 w-16 text-amber-500 mb-4" /> {/* Using a warning icon */}
            <h3 className="text-xl font-semibold mb-2">Schema Generated, Examples Missing</h3>
            <p className="text-muted-foreground">
              The GraphQL schema was generated successfully, but the AI did not provide example operations.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This can sometimes happen with complex or very generic data source inputs. You can still use the generated schema.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
