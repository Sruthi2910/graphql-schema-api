'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a GraphQL schema based on a data source connection string.
 *
 * - generateGraphQLSchema - A function that takes a data source connection string and returns a GraphQL schema.
 * - GenerateGraphQLSchemaInput - The input type for the generateGraphQLSchema function.
 * - GenerateGraphQLSchemaOutput - The return type for the generateGraphQLSchema function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGraphQLSchemaInputSchema = z.object({
  dataSourceType: z
    .string() // e.g., 'SQL', 'Salesforce'
    .describe('The type of the data source to connect to.'),
  connectionString: z
    .string()
    .describe(
      'The connection string or API endpoint for the data source.'
    ),
  //   additionalConfiguration: z.record(z.any()).optional().describe('Additional configuration parameters for the data source.'),
});

export type GenerateGraphQLSchemaInput = z.infer<
  typeof GenerateGraphQLSchemaInputSchema
>;

const GenerateGraphQLSchemaOutputSchema = z.object({
  graphqlSchema: z
    .string()
    .describe('The generated GraphQL schema as a string.'),
});

export type GenerateGraphQLSchemaOutput = z.infer<
  typeof GenerateGraphQLSchemaOutputSchema
>;

export async function generateGraphQLSchema(
  input: GenerateGraphQLSchemaInput
): Promise<GenerateGraphQLSchemaOutput> {
  return generateGraphQLSchemaFlow(input);
}

const generateGraphQLSchemaPrompt = ai.definePrompt({
  name: 'generateGraphQLSchemaPrompt',
  input: {schema: GenerateGraphQLSchemaInputSchema},
  output: {schema: GenerateGraphQLSchemaOutputSchema},
  prompt: `You are a GraphQL schema generator expert. Your task is to create a GraphQL schema based on the provided data source information.

Data Source Type: {{{dataSourceType}}}
Connection String: {{{connectionString}}}

Generate a GraphQL schema that reflects the structure and relationships within this data source. Ensure that the schema includes appropriate types, fields, and relationships.

Return ONLY the schema in GraphQL schema definition language.
`, // Corrected the template string here
});

const generateGraphQLSchemaFlow = ai.defineFlow(
  {
    name: 'generateGraphQLSchemaFlow',
    inputSchema: GenerateGraphQLSchemaInputSchema,
    outputSchema: GenerateGraphQLSchemaOutputSchema,
  },
  async input => {
    const {output} = await generateGraphQLSchemaPrompt(input);
    return output!;
  }
);
