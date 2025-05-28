
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { FileCode, Loader2, AlertTriangle, Download, Pencil, RefreshCcw, Undo, Eye } from "lucide-react";

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
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (schema !== null) {
        setEditedSchemaContent(schema);
    } else {
        setEditedSchemaContent(""); 
    }
  }, [schema]);

  const currentDisplaySchema = isEditing ? editedSchemaContent : schema;
  const hasActualSchemaContent = currentDisplaySchema !== null && currentDisplaySchema.trim() !== "" && !currentDisplaySchema.startsWith("#");

  const handleDownload = () => {
    if (!hasActualSchemaContent) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "No actual schema content to download.",
      });
      return;
    }
    try {
      const blob = new Blob([currentDisplaySchema!], { type: 'application/graphql;charset=utf-8' });
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

  const renderCardContent = () => {
    if (isLoading && !isEditing) { 
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Processing Schema...</p>
          <p>This may take a moment.</p>
        </div>
      );
    }

    if (error && !isEditing) { 
      return (
        <Alert variant="destructive" className="m-4">
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

    // Default placeholder content when not loading, no error, and not editing
    let placeholderMessage = "Use the form to generate a schema.";
    if (schema !== null) { // Schema generation has been attempted
        if (hasActualSchemaContent) {
            placeholderMessage = "Schema generated. Click 'View Schema' to display, 'Edit Schema' to modify, or 'Download' to save.";
        } else {
            placeholderMessage = "The AI returned an empty schema. Try adjusting your input or edit the schema manually.";
        }
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <FileCode className="h-16 w-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">GraphQL Schema Area</p>
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
              <FileCode className="h-6 w-6" />
              GraphQL Schema
            </CardTitle>
            <CardDescription>
              {isEditing ? "Edit the schema and regenerate API examples." : "View, edit, or download the GraphQL schema."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {!isEditing && (
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading || error !== null || !hasActualSchemaContent}
                    aria-label="View schema"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Schema
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Generated GraphQL Schema</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex-grow rounded-md border bg-muted/30 min-h-[300px]">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
                      <code>{currentDisplaySchema || "# No schema available."}</code>
                    </pre>
                  </ScrollArea>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="mt-4">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}

            {!isEditing && isEditingAllowed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isLoading || error !== null} // Allow edit even if schema is empty to start from scratch
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
                  Save & Regenerate
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
                disabled={isLoading || error !== null || !hasActualSchemaContent} 
                aria-label="Download schema"
            >
                <Download className="mr-2 h-4 w-4" />
                Download
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
