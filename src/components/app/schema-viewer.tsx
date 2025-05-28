
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileCode, Loader2, AlertTriangle, Download, Pencil, RefreshCcw, Undo } from "lucide-react";

interface SchemaViewerProps {
  schema: string | null;
  isLoading: boolean; 
  isEditingAllowed: boolean; 
  onSchemaEditAndRegenerate: (editedSchema: string) => Promise<void>;
  error: string | null;
  initialDataSourceType: string; 
  initialConnectionString: string; 
  initialObjectIdentifier?: string; 
}

export function SchemaViewer({ 
  schema, 
  isLoading, 
  isEditingAllowed,
  onSchemaEditAndRegenerate,
  error 
}: SchemaViewerProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedSchemaContent, setEditedSchemaContent] = React.useState<string>("");

  React.useEffect(() => {
    if (schema !== null) {
        setEditedSchemaContent(schema);
    } else {
        setEditedSchemaContent(""); 
    }
  }, [schema]);

  const handleDownload = () => {
    const contentToDownload = isEditing ? editedSchemaContent : schema;
    if (!contentToDownload || contentToDownload.trim() === "") {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "No schema content to download.",
      });
      return;
    }
    try {
      const blob = new Blob([contentToDownload], { type: 'application/graphql;charset=utf-8' });
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
  
  const handleEdit = () => {
    if (schema !== null) {
      setEditedSchemaContent(schema); 
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (schema !== null) {
      setEditedSchemaContent(schema); 
    }
    setIsEditing(false);
  };

  const handleSaveAndRegenerate = async () => {
    if (editedSchemaContent.trim() === "") {
        toast({
            variant: "destructive",
            title: "Cannot Save Empty Schema",
            description: "Please provide some schema content or cancel editing.",
        });
        return;
    }
    await onSchemaEditAndRegenerate(editedSchemaContent);
    setIsEditing(false); 
  };

  const currentDisplaySchema = isEditing ? editedSchemaContent : schema;
  const canDownload = currentDisplaySchema !== null && currentDisplaySchema.trim() !== "" && !isLoading && !error && !(currentDisplaySchema.startsWith("#")); // Don't allow download of placeholder messages

  const renderContent = () => {
    if (isLoading && !isEditing) { 
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Processing Schema...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error && !isEditing) { 
      return (
        <Alert variant="destructive" className="my-auto">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error Processing Schema</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (isEditing) {
        return (
            <Textarea
                value={editedSchemaContent}
                onChange={(e) => setEditedSchemaContent(e.target.value)}
                className="flex-grow h-full font-mono text-sm resize-none min-h-[300px] lg:min-h-0"
                placeholder="Enter or paste your GraphQL schema here..."
                disabled={isLoading} 
            />
        );
    }

    // Default view: display schema or placeholder messages within the code block
    let codeContent: string;
    if (schema && schema.trim() !== "") {
      codeContent = schema;
    } else if (schema !== null && schema.trim() === "") { 
      codeContent = `# GraphQL schema is empty.\n# The AI processed the request but returned no schema content.\n# You can try different inputs or use the 'Edit Schema' button to create one manually.`;
    } else { 
      codeContent = `# No GraphQL schema has been generated yet.\n# Please use the form on the left to connect to a data source and generate a schema.`;
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
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-6 w-6" />
              GraphQL Schema
            </CardTitle>
            <CardDescription>
              {isEditing ? "Edit the schema and regenerate API examples." : "The AI-generated or edited schema. Placeholder messages are shown if no schema is available."}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
            {!isEditing && isEditingAllowed && ( // Show edit button if allowed, even for null/empty schema
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isLoading}
                aria-label="Edit schema"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Schema
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveAndRegenerate}
                  disabled={isLoading || editedSchemaContent.trim() === ""}
                  aria-label="Save changes and regenerate API examples"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Save & Regenerate Examples
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  aria-label="Cancel editing"
                >
                  <Undo className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
             <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!canDownload || isLoading} 
                aria-label="Download schema"
            >
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
