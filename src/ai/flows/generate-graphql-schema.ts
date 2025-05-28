
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a GraphQL schema
 * and example operations based on a data source connection string and optional object identifier,
 * or to generate examples from an existing schema.
 *
 * - generateGraphQLSchema - A function that takes data source details (and optionally an edited schema)
 *   and returns a GraphQL schema and example operations.
 * - GenerateGraphQLSchemaInput - The input type for the generateGraphQLSchema function.
 * - GenerateGraphQLSchemaOutput - The return type for the generateGraphQLSchema function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

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
  editedSchema: z
    .string()
    .optional()
    .describe('An optional, user-edited GraphQL schema. If provided, API examples will be generated based on this schema, and schema generation from data source details will be skipped.'),
});

export type GenerateGraphQLSchemaInput = z.infer<
  typeof GenerateGraphQLSchemaInputSchema
>;

const GenerateGraphQLSchemaOutputSchema = z.object({
  graphqlSchema: z
    .string()
    .describe('The GraphQL schema. If an editedSchema was provided in input, this will be the same editedSchema. Otherwise, it is the AI-generated schema.'),
  exampleQueriesMutations: z
    .string()
    .optional()
    .describe('Example GraphQL queries and mutations based on the (potentially edited) schema. This should be formatted as a string containing valid GraphQL operations, potentially with comments.'),
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
  prompt: `You are an expert GraphQL API assistant.

{{#if editedSchema}}
Objective: Generate example GraphQL queries and mutations based ON THE PROVIDED USER SCHEMA.
User-Provided Schema (This is the definitive schema for example generation):
\`\`\`graphql
{{{editedSchema}}}
\`\`\`

Data Source Context (for understanding origin, DO NOT use to override User-Provided Schema):
Data Source Type: {{{dataSourceType}}}
Connection String: {{{connectionString}}}
{{#if objectIdentifier}}Specific Table/Object/Collection Name: {{{objectIdentifier}}}{{/if}}

Instructions for Example Generation (based on User-Provided Schema):
1.  Analyze the User-Provided Schema thoroughly.
2.  Generate example GraphQL operations:
    *   **Queries**:
        *   A query to fetch a list of the primary objects (e.g., \`allUsers\`, \`allProducts\`). Identify primary objects from the schema.
        *   A query to fetch a single primary object by its ID (e.g., \`user(id: ID!)\`, \`product(id: ID!)\`).
    *   **Mutations**:
        *   A mutation to create a new primary object (e.g., \`createUser(input: CreateUserInput!)\`). Ensure input types match the User-Provided Schema.
        *   A mutation to update an existing primary object (e.g., \`updateUser(id: ID!, input: UpdateUserInput!)\`). Ensure input types match the User-Provided Schema.
        *   A mutation to delete a primary object (e.g., \`deleteUser(id: ID!)\`).
    *   If multiple primary types exist, select the most prominent one or provide examples for a couple of key types.
    *   Ensure all examples are syntactically correct GraphQL and strictly align with the User-Provided Schema.
    *   Use placeholder values like \`"<value>"\`, \`123\`, or variables (e.g., \`$name\`) for arguments in operations.

Output Format:
Return a JSON object with the following keys:
- \`graphqlSchema\`: THIS MUST BE THE EXACT SAME \`{{{editedSchema}}}\` that was provided in the input. Do not modify it.
- \`exampleQueriesMutations\`: A string containing ONLY the example GraphQL queries and mutations, clearly separated (e.g., using GraphQL comments \`# Query ...\`). Format this content nicely. Example:
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
Do NOT generate a new schema definition. Focus SOLELY on generating examples for the \`editedSchema\`.

{{else}}
Objective: Generate a GraphQL schema AND example operations based on the provided data source information.

Data Source Type: {{{dataSourceType}}}
Connection String (for context, do not attempt to connect): {{{connectionString}}}
{{#if objectIdentifier}}Specific Table/Object/Collection Name: {{{objectIdentifier}}}{{else}}No specific table/object/collection name provided. You may need to infer a primary entity or generate for multiple common entities based on the data source type.{{/if}}

Instructions for Schema and Example Generation:
1.  Analyze the data source type: '{{{dataSourceType}}}'.
2.  If 'Specific Table/Object/Collection Name' ('objectIdentifier': {{{objectIdentifier}}}) is provided, make that the **primary focus** for schema generation. Infer its likely fields and relationships.
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
6.  Generate example GraphQL operations based on YOUR generated schema:
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
{{/if}}
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

    if (!output) {
        throw new Error("AI did not return any output.");
    }
    
    // If an editedSchema was provided, ensure the output schema is that exact editedSchema.
    // The prompt instructs the AI to do this, but this is a safeguard.
    const finalSchema = input.editedSchema !== undefined ? input.editedSchema : (output.graphqlSchema || "");

    return {
        graphqlSchema: finalSchema,
        exampleQueriesMutations: output.exampleQueriesMutations,
    };
  }
);
