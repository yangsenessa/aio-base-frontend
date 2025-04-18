/**
 * Global configuration file for AI prompt templates
 * This allows for consistent prompts across different LLM services
 */

import { systemPrompts } from './systemPrompts';
import { aioIndexPrompts } from './aioIndexPrompts';
import { aioIntentPrompts } from './aioIntentPrompts';
import { userCaseIntentPrompts } from './userCaseIntentPrompts';

// Re-export the prompts
export { systemPrompts, aioIndexPrompts, aioIntentPrompts, userCaseIntentPrompts };

// Helper function to get the appropriate system prompt
export function getSystemPrompt(promptType: keyof typeof systemPrompts = 'beginner'): string {
  return systemPrompts[promptType] || systemPrompts.default;
}

// Export message constructor functions for different LLM services
export function createEMCNetworkMessages(userMessage: string, promptType: keyof typeof systemPrompts = 'default'): any[] {
  // Get the base system prompt
  const baseSystemPrompt = getSystemPrompt(promptType);
  
  // Get the user case intent prompt and replace the placeholder
  const intentPrompt = userCaseIntentPrompts.decompose_user_request.replace('<USER_REQUEST>', userMessage);
  
  // Combine the prompts with clear instructions for the LLM
  const combinedPrompt = `${baseSystemPrompt}

## Task Analysis Framework

Before responding to any user request, you must:

1. Analyze the user's intent using this framework:
${intentPrompt}

2. Generate a structured plan that:
   - Respects the user's original intent
   - Uses available MCPs effectively
   - Maintains clear task boundaries
   - Ensures semantic validity

3. Execute the plan by:
   - Breaking down complex tasks into manageable steps
   - Selecting appropriate MCPs for each step
   - Managing data flow between steps
   - Providing clear, structured responses

Remember: You are the Queen Agent - the orchestrator and planner. Your role is to understand, plan, and coordinate, not to execute tasks directly.

## Response Format

Your response must follow this format:

\`\`\`json
{
  "intent_analysis": {
    // The output from the intent analysis framework
  },
  "execution_plan": {
    "steps": [
      {
        "mcp": "string",
        "action": "string",
        "inputSchema": {},
        "dependencies": ["string"]
      }
    ],
    "constraints": ["string"],
    "quality_metrics": ["string"]
  },
  "response": "string" // Your natural language response to the user
}
\`\`\`

IMPORTANT JSON FORMATTING RULES:
1. All values must be properly quoted:
   - Strings: "value"
   - Booleans: "true" or "false" (NOT true or false)
   - Numbers: "123" (for string representation) or 123 (for numeric)
2. The \`intent_analysis\` field must contain the exact output from the intent analysis framework
3. All JSON must be valid and parseable
4. No unquoted boolean values are allowed
5. All object keys must be quoted with double quotes`;

  return [
    {
      role: "system",
      content: combinedPrompt
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
  // Log the constructed prompt for debugging
  console.log(`[AI-PROMPT] 📝 Constructed ${promptType} prompt:`, prompt);
  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// Create messages for inverted index generation
export function createInvertedIndexMessage(mcpJson: string): any[] {
  // Replace the placeholder in the prompt with the actual MCP JSON
  const prompt = aioIndexPrompts.aioInvertedIndexPrompts.replace('<MCP_JSON_INPUT>', mcpJson);
  // Log the constructed prompt for debugging
  console.log('[AI-PROMPT] 📝 Constructed inverted index prompt');
  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// Create messages for intent detection
export function createIntentDetectMessage(
  modality: string,
  availableMcps: any[] = [],
  promptType: keyof typeof aioIntentPrompts = 'generate_intent_keywords'
): any[] {
  const defaultKeywords = aioIntentPrompts.default_intent_keywords[modality as keyof typeof aioIntentPrompts.default_intent_keywords] || [];
  // 设置默认的availableMcps为[mcp_voice]
  availableMcps = availableMcps.length ? availableMcps : ['mcp_voice'];
  // Get the prompt template based on the prompt type
  const promptTemplate = typeof aioIntentPrompts[promptType] === 'string' 
    ? aioIntentPrompts[promptType] as string
    : '';

  // Replace placeholders in the prompt
  const prompt = promptTemplate
    .replace('<MODALITY_NAME>', modality)
    .replace('<INTENT_KEYWORDS>', JSON.stringify(defaultKeywords))
    .replace('<AVAILABLE_MCPS>', JSON.stringify(availableMcps));

  // Log the constructed prompt for debugging
  console.log(`[AI-PROMPT] 📝 Constructed intent detection prompt for ${modality}`, {
    modality,
    defaultKeywords,
    availableMcps,
    prompt
  });

  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// Create messages for user case intent analysis
export function createUserCaseIntentMessage(
  userRequest: string,
  promptType: keyof typeof userCaseIntentPrompts = 'decompose_user_request'
): any[] {
  // Replace the placeholder in the prompt with the actual user request
  const prompt = userCaseIntentPrompts[promptType].replace('<USER_REQUEST>', userRequest);
  // Log the constructed prompt for debugging
  console.log(`[AI-PROMPT] 📝 Constructed user case intent prompt for request:`, userRequest);
  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// This can be expanded for other LLM services that might use different message formats
