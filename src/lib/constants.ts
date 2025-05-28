export const DATA_SOURCE_TYPES = [
  "PostgreSQL",
  "MySQL",
  "SQL Server",
  "Oracle",
  "MongoDB",
  "Salesforce",
  "Other",
] as const;

export type DataSourceType = (typeof DATA_SOURCE_TYPES)[number];
