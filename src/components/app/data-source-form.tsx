
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Added for new field
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DATA_SOURCE_TYPES, type DataSourceType } from "@/lib/constants";
import { Database, PlugZap, Loader2 } from "lucide-react";

const dataSourceFormSchema = z.object({
  dataSourceType: z.enum(DATA_SOURCE_TYPES, {
    required_error: "Please select a data source type.",
  }),
  connectionString: z.string().min(1, "Connection string or API details cannot be empty."),
  objectIdentifier: z.string().optional(), // New field, optional at schema level
});

export type DataSourceFormValues = z.infer<typeof dataSourceFormSchema>;

// Helper function to get the appropriate label for objectIdentifier
const getObjectIdentifierLabel = (dataSourceType?: DataSourceType): string => {
  if (!dataSourceType) return "Table/Object/Resource Name";
  switch (dataSourceType) {
    case "PostgreSQL":
    case "MySQL":
    case "SQL Server":
    case "Oracle":
      return "Table Name";
    case "MongoDB":
      return "Collection Name";
    case "Salesforce":
      return "Object Name";
    default:
      return "Primary Table/Object/Resource Name";
  }
};

const getObjectIdentifierPlaceholder = (dataSourceType?: DataSourceType): string => {
  if (!dataSourceType) return "Enter name";
  switch (dataSourceType) {
    case "PostgreSQL":
    case "MySQL":
    case "SQL Server":
    case "Oracle":
      return "e.g., users, products";
    case "MongoDB":
      return "e.g., customers, orders";
    case "Salesforce":
      return "e.g., Account, Contact";
    default:
      return "e.g., my_data_entity";
  }
};


interface DataSourceFormProps {
  onSubmit: (values: DataSourceFormValues) => Promise<void>;
  isLoading: boolean;
}

export function DataSourceForm({ onSubmit, isLoading }: DataSourceFormProps) {
  const form = useForm<DataSourceFormValues>({
    resolver: zodResolver(dataSourceFormSchema),
    defaultValues: {
      dataSourceType: "PostgreSQL",
      connectionString: "",
      objectIdentifier: "",
    },
  });

  const currentDataSourceType = useWatch({
    control: form.control,
    name: "dataSourceType",
  });

  const objectIdentifierLabel = getObjectIdentifierLabel(currentDataSourceType);
  const objectIdentifierPlaceholder = getObjectIdentifierPlaceholder(currentDataSourceType);

  // Refined submit handler to include conditional validation for objectIdentifier
  const handleActualSubmit = async (values: DataSourceFormValues) => {
    // Clear previous manual errors
    form.clearErrors("objectIdentifier");

    const isObjectIdentifierRequired = currentDataSourceType && 
      ['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'Salesforce', 'MongoDB'].includes(currentDataSourceType);

    if (isObjectIdentifierRequired && (!values.objectIdentifier || values.objectIdentifier.trim() === "")) {
      form.setError("objectIdentifier", {
        type: "manual",
        message: `${objectIdentifierLabel} is required for ${currentDataSourceType}.`,
      });
      return; // Stop submission if validation fails
    }
    await onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Connect Data Source
        </CardTitle>
        <CardDescription>
          Provide details for your data source to generate a GraphQL schema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleActualSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dataSourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Source Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("objectIdentifier", ""); // Clear objectIdentifier when type changes
                      form.clearErrors("objectIdentifier"); // Clear errors for objectIdentifier
                    }} 
                    defaultValue={field.value} 
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data source type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DATA_SOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="connectionString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection String / API Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., postgresql://user:pass@host:port/db or API Key + Endpoint"
                      className="min-h-[100px] font-mono text-sm"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the connection string for databases or relevant API information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="objectIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{objectIdentifierLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={objectIdentifierPlaceholder}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify the primary table, object, or collection to focus on. Optional for "Other".
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlugZap className="mr-2 h-4 w-4" />
              )}
              Connect & Generate Schema
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
