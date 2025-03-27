
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

// Helper function to get the appropriate system prompt
export function getSystemPrompt(promptType: keyof typeof systemPrompts = 'default'): string {
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

// This can be expanded for other LLM services that might use different message formats
