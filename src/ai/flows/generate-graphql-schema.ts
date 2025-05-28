
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a GraphQL schema 
 * and example operations based on a data source connection string and optional object identifier.
 *
 * - generateGraphQLSchema - A function that takes data source details and returns a GraphQL schema and example operations.
 * - GenerateGraphQLSchemaInput - The input type for the generateGraphQLSchema function.
 * - GenerateGraphQLSchemaOutput - The return type for the generateGraphQLSchema function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGraphQLSchemaInputSchema = z.object({
  dataSourceType: z
    .string()
    .describe('The type of the data source to connect to (e.g., PostgreSQL, Salesforce, MongoDB).'),
  connectionString: z
    .string()
    .describe(
      'The connection string or API endpoint for the data source (used for context, AI will not connect).'
    ),
  objectIdentifier: z
    .string()
    .optional()
    .describe('The specific table, object, or collection name to focus on (e.g., users, Account, products). Leave empty to infer from the data source or generate for multiple entities.'),
});

export type GenerateGraphQLSchemaInput = z.infer<
  typeof GenerateGraphQLSchemaInputSchema
>;

const GenerateGraphQLSchemaOutputSchema = z.object({
  graphqlSchema: z
    .string()
    .describe('The generated GraphQL schema as a string.'),
  exampleQueriesMutations: z
    .string()
    .optional()
    .describe('Example GraphQL queries and mutations based on the generated schema. This should be formatted as a string containing valid GraphQL operations, potentially with comments.'),
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
  prompt: `You are an expert GraphQL schema and API generator. Your task is to create a GraphQL schema and example operations based on the provided data source information.

Data Source Type: {{{dataSourceType}}}
Connection String (for context, do not attempt to connect): {{{connectionString}}}
{{#if objectIdentifier}}Specific Table/Object/Collection Name: {{{objectIdentifier}}}{{else}}No specific table/object/collection name provided. You may need to infer a primary entity or generate for multiple common entities based on the data source type.{{/if}}

Instructions:
1.  Analyze the data source type: '{{{dataSourceType}}}'.
2.  If an 'Specific Table/Object/Collection Name' ('objectIdentifier': {{{objectIdentifier}}}) is provided, make that the **primary focus** for schema generation. Infer its likely fields and relationships.
3.  If no 'objectIdentifier' is provided, you may infer a primary entity (e.g., 'User' for a generic database, 'Product' for an e-commerce setup) or generate a schema for a few plausible entities based on the '{{{dataSourceType}}}'.
4.  For fields, **infer common data types** (e.g., ID, String, Int, Float, Boolean, Date, DateTime, or custom object types for relationships).
    *   A field named 'id', '_id', or 'uuid' should likely be of type \`ID!\`.
    *   Fields like 'email', 'name', 'description', 'title' should be \`String\`.
    *   Fields like 'age', 'quantity', 'count' should be \`Int\`.
    *   Fields like 'price', 'amount', 'rating' should be \`Float\`.
    *   Fields like 'isActive', 'isVerified', 'hasStock' should be \`Boolean\`.
    *   Fields like 'createdAt', 'updatedAt', 'publishedDate' should be \`String\` (representing ISO 8601 DateTime) or a custom \`DateTime\` scalar if you define one. For simplicity, \`String\` is acceptable.
    *   If \`objectIdentifier\` suggests relationships (e.g., a 'userId' field in a 'Post' object), create appropriate linked types and list fields (e.g., \`author: User\`, \`posts: [Post]\`).
5.  Generate a GraphQL schema definition. Include types, fields, input types for mutations, and basic relationships. Ensure all referenced types are defined.
6.  Generate example GraphQL operations:
    *   **Queries**:
        *   A query to fetch a list of the primary objects (e.g., \`allUsers\`, \`all{{{objectIdentifier}}}s\`).
        *   A query to fetch a single primary object by its ID (e.g., \`user(id: ID!)\`, \`{{{objectIdentifier}}}(id: ID!)\`).
    *   **Mutations**:
        *   A mutation to create a new primary object (e.g., \`createUser(input: CreateUserInput!)\`). Define the \`CreateUserInput\` type.
        *   A mutation to update an existing primary object (e.g., \`updateUser(id: ID!, input: UpdateUserInput!)\`). Define the \`UpdateUserInput\` type.
        *   A mutation to delete a primary object (e.g., \`deleteUser(id: ID!)\`).
    *   If no \`objectIdentifier\` was given, pick a sensible primary type from your generated schema for these examples.
    *   Ensure these examples are syntactically correct GraphQL.
    *   Use placeholder values like \`"<value>"\`, \`123\`, or variables (e.g., \`$name\`) for arguments in mutations and queries where appropriate.

Output Format:
Return a JSON object with two keys:
- \`graphqlSchema\`: A string containing ONLY the GraphQL schema definition language.
- \`exampleQueriesMutations\`: A string containing ONLY the example GraphQL queries and mutations, clearly separated (e.g., using GraphQL comments \`# Query ...\`). Format this content nicely. For example:
  \`\`\`graphql
  # Query to get all items
  query GetAllItems {
    # ...
  }

  # Mutation to create an item
  mutation CreateItem(\$input: CreateItemInput!) {
    createItem(input: \$input) {
      # ...
    }
  }
  \`\`\`

Focus on clarity, correctness, and completeness for both the schema and the example operations. Do not add any explanatory text outside of the requested fields.
`,
});

const generateGraphQLSchemaFlow = ai.defineFlow(
  {
    name: 'generateGraphQLSchemaFlow',
    inputSchema: GenerateGraphQLSchemaInputSchema,
    outputSchema: GenerateGraphQLSchemaOutputSchema,
  },
  async input => {
    const {output} = await generateGraphQLSchemaPrompt(input);
    // Ensure output is not null and conforms to the schema, especially the optional field
    if (!output) {
        throw new Error("AI did not return any output.");
    }
    return {
        graphqlSchema: output.graphqlSchema || "", // Provide default if null/undefined
        exampleQueriesMutations: output.exampleQueriesMutations, // This can be undefined as per schema
    };
  }
);
