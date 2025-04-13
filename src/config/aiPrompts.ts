/**
 * Global configuration file for AI prompt templates
 * This allows for consistent prompts across different LLM services
 */

// System prompts for different AI services
export const systemPrompts = {
  // Default prompt for the AIO-2030 AI assistant
  default: "You are AIO-2030 AI, an advanced AI assistant for the decentralized AI agent network. Be concise, helpful, and knowledgeable about AI agents, distributed systems, and blockchain technology.",
  
  // Specialized prompt for technical discussions
  technical: "You are AIO-2030 AI Technical Advisor. Provide detailed technical information about AI agents, distributed systems, blockchain technology, and decentralized networks. Include code examples when relevant.",
  
  // Specialized prompt for user-friendly explanations
  beginner: "You are AIO-2030 AI Guide. Explain AI concepts, distributed systems, and blockchain technology in simple terms without technical jargon. Focus on making complex topics accessible to newcomers."
};

// Specialized prompts for indexing and processing specific components
export const aioIndexPrompts = {
  // Prompt for building MCP (Modular Capability Provider) index
  build_mcp_index: `You are an MCP Capability Indexer.You need to analyze the help response and 'Describe Content' given in context.

1.Given an \`help\` JSON response (based on the AIO protocol), extract key metadata and return a **standardized MCP Capability Index** in **pure JSON format only**, with **no additional explanations**.
2.Describe Content is plain text, you need to analyze the content and extract the key information.
3.All the content you generate need to transfer into english.

You MUST perform **semantic reasoning** when generating \`scenario_phrases\`.  
That means you should not only rely on the descriptions in the \`help\` JSON,  
but also infer **real-world use cases** based on:
- method names
- description names
- parameter names
- overall MCP name
- common agent usage patterns

Return your result in the following JSON format strictly,all contents need to use english,confirm the return json file with correct format:

{
  "description": "string",          // Short description from \`help.result.description\`
  "capability_tags": ["string"],    // High-level capability tags, such as "memory", "nlp", "retrieval"
  "functional_keywords": ["string"],// Keywords or phrases related to parameters or usage
  "scenario_phrases": ["string"],   // Natural language phrases that would match this MCP use case
  "methods": [                      // Optional: extract method info
    {
      "name": "string",
      "description": "string",
      "inputSchema": object // use original value from help.result.inputSchema
    }
  ],
  "source": {
    "author": "string",
    "version": "string",
    "github": "string"
  }
}

--Now, here is the MCP help JSON to analyze:

help_response

--And Describe Content:

describe_content`

};

// Helper function to get the appropriate system prompt
export function getSystemPrompt(promptType: keyof typeof systemPrompts = 'beginner'): string {
  return systemPrompts[promptType] || systemPrompts.default;
}

// Export message constructor functions for different LLM services
export function createEMCNetworkMessages(userMessage: string, promptType: keyof typeof systemPrompts = 'default'): any[] {
  return [
    {
      role: "system",
      content: getSystemPrompt(promptType)
    },
    {
      role: "user",
      content: userMessage
    }
  ];
}

// Create messages for sample processing with help response
export function createEMCNetworkSampleMessage(
  helpResponse: string, 
  describeContent: string,
  promptType: keyof typeof aioIndexPrompts = 'build_mcp_index'
): any[] {
  // Replace the placeholder in the prompt with the actual help response
  const prompt = aioIndexPrompts[promptType].replace('help_response', helpResponse).replace('describe_content', describeContent);
  
  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// This can be expanded for other LLM services that might use different message formats
