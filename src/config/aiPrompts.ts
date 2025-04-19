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
        "inputSchema": {
          "type": "object",
          "properties": {
            "field_name": {
              "type": "string",
              "description": "Field description"
            }
          }
        },
        "dependencies": ["string"]
      }
    ],
    "constraints": ["string"],
    "quality_metrics": ["string"]
  },
  "response": "string" // Your natural language response to the user
}
\`\`\`

CRITICAL RESPONSE RULES:
1. ALL chat messages, greetings, questions, and natural language responses MUST be placed in the "response" field
2. The "response" field is the ONLY place where chat messages should appear
3. Never include chat messages or natural language text outside of the "response" field
4. The "response" field must contain your complete message to the user
5. If you need to ask questions or provide information, include it in the "response" field
6. The "intent_analysis" and "execution_plan" fields should only contain structured data, not chat messages

IMPORTANT JSON FORMATTING RULES:
1. All values must be properly quoted:
   - Strings: "value"
   - Booleans: "true" or "false" (NOT true or false)
   - Numbers: "123" (for string representation) or 123 (for numeric)
2. The \`intent_analysis\` field must contain the exact output from the intent analysis framework
3. All JSON must be valid and parseable
4. No unquoted boolean values are allowed
5. All object keys must be quoted with double quotes

SCHEMA FORMATTING RULES:
1. Type definitions must be strings, not arrays:
   - Correct: "type": "string"
   - Incorrect: "type": ["string"]
2. For single type values, use the type directly:
   - Correct: "type": "string"
   - Incorrect: "type": ["string"]
3. Schema structure must follow JSON Schema format:
   - Use "type": "object" for objects
   - Use "properties" for object fields
   - Use "type": "array" for arrays
   - Use "items" for array item definitions
4. Example of correct schema:
\`\`\`json
{
  "type": "object",
  "properties": {
    "field_name": {
      "type": "string",
      "description": "Field description"
    }
  }
}
\`\`\``;

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
