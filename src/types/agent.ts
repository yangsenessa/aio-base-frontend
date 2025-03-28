
import { z } from 'zod';

export const agentFormSchema = z.object({
  name: z.string().min(3, 'Agent name must be at least 3 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  author: z.string().min(2, 'Author name required'),
  platform: z.enum(['windows', 'linux', 'both']),
  gitRepo: z.string().url('Must be a valid URL'),
  homepage: z.string().url('Must be a valid URL').optional(),
  serverEndpoint: z.string().url('Must be a valid URL').optional(),
  inputParams: z.string().optional(),
  outputExample: z.string().optional(),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

// Updated schema for MCP Server based on the protocol requirements
export const mcpServerFormSchema = z.object({
  name: z.string().min(3, 'Server name must be at least 3 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  author: z.string().min(2, 'Author name required'),
  gitRepo: z.string().url('Must be a valid URL'),
  homepage: z.string().url('Must be a valid URL').optional(),
  // Protocol-specific fields
  type: z.enum(['stdio', 'http', 'mcp']).default('mcp'),
  supportedMethods: z.string().optional(), // Comma-separated list of supported methods
  supportedModalities: z.string().optional(), // Text, image, audio, etc.
  // MCP capabilities - optional flags
  resources: z.boolean().default(false),
  prompts: z.boolean().default(false), 
  tools: z.boolean().default(false),
  sampling: z.boolean().default(false),
  // Implementation details
  entities: z.string().optional(),
  relations: z.string().optional(),
  traceSupport: z.boolean().default(false), // Support for trace_id based tracking
});

export type MCPServerFormValues = z.infer<typeof mcpServerFormSchema>;
