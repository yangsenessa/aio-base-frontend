
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

export const mcpServerFormSchema = z.object({
  name: z.string().min(3, 'Server name must be at least 3 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  author: z.string().min(2, 'Author name required'),
  gitRepo: z.string().url('Must be a valid URL'),
  homepage: z.string().url('Must be a valid URL').optional(),
  entities: z.string().optional(),
  relations: z.string().optional(),
  observations: z.string().optional(),
});

export type MCPServerFormValues = z.infer<typeof mcpServerFormSchema>;
