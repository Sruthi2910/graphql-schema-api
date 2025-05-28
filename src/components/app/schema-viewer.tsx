
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileCode, Loader2, AlertTriangle, Info, Download, Pencil, Save, Undo, RefreshCcw } from "lucide-react";

interface SchemaViewerProps {
  schema: string | null;
  isLoading: boolean; // Generic loading state for initial load or regeneration
  isEditingAllowed: boolean; // To control if edit functionality is available
  onSchemaEditAndRegenerate: (editedSchema: string) => Promise<void>;
  error: string | null;
  initialDataSourceType: string; // To pass to regeneration
  initialConnectionString: string; // To pass to regeneration
  initialObjectIdentifier?: string; // To pass to regeneration
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
    // When the schema prop changes (e.g., new generation), update the editor content if not actively editing.
    // Also, reset if schema becomes null (e.g., form reset before new generation).
    if (schema !== null) {
        setEditedSchemaContent(schema);
    } else {
        setEditedSchemaContent(""); // Clear editor if schema is nullified
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
      setEditedSchemaContent(schema); // Load current schema into editor
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (schema !== null) {
      setEditedSchemaContent(schema); // Revert to original schema
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
    setIsEditing(false); // Exit edit mode on successful regeneration
  };

  const currentDisplaySchema = isEditing ? editedSchemaContent : schema;
  const canDownload = currentDisplaySchema !== null && currentDisplaySchema.trim() !== "" && !isLoading && !error;

  const renderContent = () => {
    if (isLoading && !isEditing) { // Show main loader only if not in edit mode (regeneration loading is handled by disabling buttons)
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Processing Schema...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error && !isEditing) { // Show error only if not in edit mode
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
                disabled={isLoading} // Disable textarea during regeneration
            />
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
            The AI processed the request but did not return any schema content. Try different inputs or be more specific. You can also manually enter a schema using the 'Edit' button.
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
          Connect to a data source to see the schema here, or edit to paste your own.
        </p>
      </div>
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
              {isEditing ? "Edit the schema and regenerate API examples." : "The AI-generated or edited schema."}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
            {!isEditing && isEditingAllowed && schema !== null && (
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
