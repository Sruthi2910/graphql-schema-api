
"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app/app-header";
import { DataSourceForm, type DataSourceFormValues } from "@/components/app/data-source-form";
import { SchemaViewer } from "@/components/app/schema-viewer";
import { ApiExplorerPlaceholder } from "@/components/app/api-explorer-placeholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateGraphQLSchema, type GenerateGraphQLSchemaOutput, type GenerateGraphQLSchemaInput } from "@/ai/flows/generate-graphql-schema";

export default function GraphQLFactoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<string | null>(null);
  const [exampleQueriesMutations, setExampleQueriesMutations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schema");

  // Store original form values for regeneration context
  const [lastFormValues, setLastFormValues] = useState<DataSourceFormValues | null>(null);

  const handleFormSubmit = async (values: DataSourceFormValues) => {
    setIsLoading(true);
    setError(null);
    setGeneratedSchema(null);
    setExampleQueriesMutations(null);
    setLastFormValues(values); // Store current form values

    try {
      const input: GenerateGraphQLSchemaInput = {
        dataSourceType: values.dataSourceType,
        connectionString: values.connectionString,
        objectIdentifier: values.objectIdentifier,
      };
      const result: GenerateGraphQLSchemaOutput = await generateGraphQLSchema(input);
      
      if (result) {
        setGeneratedSchema(result.graphqlSchema || ""); // Ensure empty string if AI returns null/undefined
        setExampleQueriesMutations(result.exampleQueriesMutations || null);

        const hasSchema = result.graphqlSchema && result.graphqlSchema.trim() !== "";
        const hasExamples = result.exampleQueriesMutations && result.exampleQueriesMutations.trim() !== "";
        let toastDescription = "";

        if (hasSchema && hasExamples) {
            toastDescription = "GraphQL schema and example operations generated successfully.";
        } else if (hasSchema && !hasExamples) {
            toastDescription = "GraphQL schema generated. No example operations were provided for it.";
        } else if (!hasSchema && hasExamples) { // Should not happen if schema is prerequisite for examples
            toastDescription = "Example operations generated, but the schema was empty. This is unexpected.";
        } else { 
            toastDescription = "Process complete. The AI did not return a schema. Example operations cannot be generated without a schema.";
             if (result.graphqlSchema === "" && result.exampleQueriesMutations) {
                toastDescription = "Schema is empty, but example operations were generated. This might indicate an issue.";
            } else if (result.graphqlSchema === "") {
                 toastDescription = "The AI returned an empty schema. Try adjusting your input.";
            }
        }
        toast({
          title: "Generation Complete",
          description: toastDescription,
        });
        
        if (hasExamples) {
            setActiveTab("explorer");
        } else {
            setActiveTab("schema");
        }

      } else {
        throw new Error("AI did not return any result structure.");
      }
    } catch (err) {
      console.error("Error generating schema:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate schema: ${errorMessage}`);
      setGeneratedSchema(null); 
      setExampleQueriesMutations(null); 
      toast({
        variant: "destructive",
        title: "Schema Generation Failed",
        description: errorMessage,
      });
      setActiveTab("schema"); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchemaEditAndRegenerate = async (editedSchema: string) => {
    if (!lastFormValues) {
        toast({
            variant: "destructive",
            title: "Cannot Regenerate Examples",
            description: "Initial data source information is missing. Please submit the form first.",
        });
        return;
    }
    setIsLoading(true);
    setError(null);
    // Optimistically update schema display, API examples will follow
    setGeneratedSchema(editedSchema); 
    setExampleQueriesMutations(null); // Clear old examples

    try {
        const input: GenerateGraphQLSchemaInput = {
            dataSourceType: lastFormValues.dataSourceType,
            connectionString: lastFormValues.connectionString,
            objectIdentifier: lastFormValues.objectIdentifier,
            editedSchema: editedSchema,
        };
        const result: GenerateGraphQLSchemaOutput = await generateGraphQLSchema(input);

        if (result) {
            // The flow should return the editedSchema back in result.graphqlSchema
            setGeneratedSchema(result.graphqlSchema || editedSchema); // Fallback to editedSchema if AI doesn't echo
            setExampleQueriesMutations(result.exampleQueriesMutations || null);

            const hasExamples = result.exampleQueriesMutations && result.exampleQueriesMutations.trim() !== "";
            toast({
                title: "API Examples Regenerated",
                description: hasExamples ? "Example operations regenerated based on your edited schema." : "No example operations were generated for the edited schema.",
            });
            setActiveTab("explorer"); // Switch to show new examples
        } else {
            throw new Error("AI did not return any result structure for regeneration.");
        }
    } catch (err) {
        console.error("Error regenerating API examples:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during regeneration.";
        setError(`Failed to regenerate API examples: ${errorMessage}`);
        // Keep the edited schema, but clear examples and show error
        setExampleQueriesMutations(null); 
        toast({
            variant: "destructive",
            title: "API Example Regeneration Failed",
            description: errorMessage,
        });
        setActiveTab("explorer"); // Stay or switch to explorer to see error context if relevant
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
          {/* Left Panel: Configuration */}
          <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <DataSourceForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* Right Panel: Results (Schema & Explorer) */}
          <div className="lg:w-3/5 xl:w-2/3 flex-grow flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="schema">GraphQL Schema</TabsTrigger>
                <TabsTrigger value="explorer">API Examples</TabsTrigger>
              </TabsList>
              <TabsContent value="schema" className="flex-grow">
                <SchemaViewer 
                  schema={generatedSchema} 
                  isLoading={isLoading} 
                  error={error}
                  isEditingAllowed={generatedSchema !== null} // Allow editing if a schema (even empty) exists
                  onSchemaEditAndRegenerate={handleSchemaEditAndRegenerate}
                  initialConnectionString={lastFormValues?.connectionString || ""}
                  initialDataSourceType={lastFormValues?.dataSourceType || ""}
                  initialObjectIdentifier={lastFormValues?.objectIdentifier}
                />
              </TabsContent>
              <TabsContent value="explorer" className="flex-grow">
                <ApiExplorerPlaceholder 
                  schemaGenerated={generatedSchema !== null && generatedSchema.trim() !== "" && !error}
                  exampleCode={exampleQueriesMutations}
                  isLoading={isLoading && !generatedSchema} // Show loader only if initial examples are loading
                  error={error}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        GraphQL Factory - AI Powered Schema Generation
      </footer>
    </div>
  );
}
