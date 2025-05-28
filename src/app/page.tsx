
"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { DataSourceForm, type DataSourceFormValues } from "@/components/app/data-source-form";
import { SchemaViewer } from "@/components/app/schema-viewer";
import { ApiExplorerPlaceholder } from "@/components/app/api-explorer-placeholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { generateGraphQLSchema, type GenerateGraphQLSchemaOutput } from "@/ai/flows/generate-graphql-schema";

export default function GraphQLFactoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<string | null>(null);
  const [exampleQueriesMutations, setExampleQueriesMutations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("schema");


  const handleFormSubmit = async (values: DataSourceFormValues) => {
    setIsLoading(true);
    setError(null);
    setGeneratedSchema(null);
    setExampleQueriesMutations(null);

    try {
      const result: GenerateGraphQLSchemaOutput = await generateGraphQLSchema({
        dataSourceType: values.dataSourceType,
        connectionString: values.connectionString,
        objectIdentifier: values.objectIdentifier,
      });
      
      if (result && typeof result.graphqlSchema === 'string') {
        setGeneratedSchema(result.graphqlSchema);
        if (result.exampleQueriesMutations) {
          setExampleQueriesMutations(result.exampleQueriesMutations);
        }

        const hasSchema = result.graphqlSchema && result.graphqlSchema.trim() !== "";
        const hasExamples = result.exampleQueriesMutations && result.exampleQueriesMutations.trim() !== "";
        let toastDescription = "";

        if (hasSchema && hasExamples) {
            toastDescription = "GraphQL schema and example operations generated successfully.";
        } else if (hasSchema && !hasExamples) {
            toastDescription = "GraphQL schema generated. No example operations were provided by the AI.";
        } else if (!hasSchema && hasExamples) {
            toastDescription = "Example operations generated. The AI did not provide a schema or it was empty.";
        } else { // !hasSchema && !hasExamples
            toastDescription = "Process complete. The AI did not return a schema or examples. This might happen with ambiguous inputs.";
        }

        toast({
          title: "Generation Complete",
          description: toastDescription,
        });
        
        // Switch to API examples tab if they exist, otherwise schema tab.
        if (hasExamples) {
            setActiveTab("explorer");
        } else {
            setActiveTab("schema");
        }

      } else {
        throw new Error(result ? "AI did not return a valid schema output structure." : "AI did not return any result.");
      }
    } catch (err) {
      console.error("Error generating schema:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate schema: ${errorMessage}`);
      setGeneratedSchema(null); // Ensure schema is cleared on error
      setExampleQueriesMutations(null); // Ensure examples are cleared on error
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
                <SchemaViewer schema={generatedSchema} isLoading={isLoading} error={error} />
              </TabsContent>
              <TabsContent value="explorer" className="flex-grow">
                <ApiExplorerPlaceholder 
                  schemaGenerated={generatedSchema !== null && generatedSchema.trim() !== "" && !error}
                  exampleCode={exampleQueriesMutations}
                  isLoading={isLoading}
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
