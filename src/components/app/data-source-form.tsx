"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DATA_SOURCE_TYPES, type DataSourceType } from "@/lib/constants";
import { Database, PlugZap, Loader2 } from "lucide-react";

const dataSourceFormSchema = z.object({
  dataSourceType: z.enum(DATA_SOURCE_TYPES, {
    required_error: "Please select a data source type.",
  }),
  connectionString: z.string().min(1, "Connection string or API details cannot be empty."),
});

export type DataSourceFormValues = z.infer<typeof dataSourceFormSchema>;

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
    },
  });

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dataSourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Source Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
