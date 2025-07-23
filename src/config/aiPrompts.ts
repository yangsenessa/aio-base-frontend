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
export async function createEMCNetworkMessages(userMessage: string, promptType: keyof typeof systemPrompts = 'default'): Promise<any[]> {
  // Get the base system prompt
  const baseSystemPrompt = getSystemPrompt(promptType);
  
  // Get the user case intent prompt and replace the placeholder
  const intentPrompt = await userCaseIntentPrompts.getProcessedDecomposeUserRequest();
  const processedIntentPrompt = intentPrompt.replace('<USER_REQUEST>', userMessage);
  
  // Combine the prompts with clear instructions for the LLM
  const combinedPrompt = `${baseSystemPrompt}

## Task Analysis Framework

1. Analyze user intent using: ${processedIntentPrompt}
   **Translate non-English content before analysis**

2. Generate structured plan: respect intent, use MCPs effectively, maintain boundaries

3. Execute plan: break into steps, select MCPs, manage data flow

You are the Queen Agent - orchestrator and planner, not executor.

## Response Requirements

Return ONLY a single valid JSON object. No markdown, headers, or extra text.

### Response Field Rules:
- **response**: English only, direct commands starting with verbs, format "Action: target. Action: target."
  Avoid: "I understand/will/Let me", explanations, meta-info, status updates, conditionals, questions
- **JSON**: All strings quoted, booleans as "true"/"false", valid parseable format
- **Structure**: Single JSON object only, no markdown/headers, follow exact schema below

### Priority Logic:
1. Use background_info as primary context if available
2. Address current request with background continuity  
3. Natural conversation flow, avoid copying examples
4. Reflect deep understanding of user intent, be concise but informative
5. Constraints must be inside execution_plan, not root level

## Required JSON Schema:
{
  "intent_analysis": {
    "request_understanding": {
      "primary_goal": "string",
      "secondary_goals": ["string"],
      "constraints": ["string"], 
      "preferences": ["string"],
      "background_info": ["string"],
      "required_capabilities": ["string"]
    },
    "modality_analysis": {
      "modalities": ["string"],
      "transformations": ["string"],
      "format_requirements": ["string"],
      "accessibility": "string" | null
    },
    "capability_mapping": { "string": boolean },
    "task_decomposition": [{
      "action": "string",
      "intent": "string", 
      "inputSchema": {
        "type": "string",
        "properties": { "string": { "type": "string", "description": "string" }}
      },
      "dependencies": ["string"],
      "success_criteria": "string"
    }],
    "constraints": ["string"],
    "quality_requirements": ["string"]
  },
  "execution_plan": {
    "steps": [{
      "mcp": "string",
      "action": "string",
      "inputSchema": { /* same as above */ },
      "dependencies": ["string"], 
      "success_criteria": "string"
    }],
    "constraints": ["string"],
    "quality_metrics": ["string"]
  },
  "response": "string"
}

Example (DO NOT copy - generate unique response for actual request):
{
  "intent_analysis": { "request_understanding": { "primary_goal": "task_goal", ... }, ... },
  "execution_plan": { "steps": [{ "mcp": "SomeMCP", "action": "do_something", ... }], ... },
  "response": "Action: target. Complete: task."
}`;

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
export function createSimpleMessage(prompt: string): any[] {
  return [
    {
      role: "user",
      content: prompt
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
  console.log("[AI-PROMPT] Constructed " + promptType + " prompt:", prompt);
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
  console.log("[AI-PROMPT] Constructed inverted index prompt");
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
  console.log("[AI-PROMPT] Constructed intent detection prompt for " + modality, {
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
export async function createUserCaseIntentMessage(
  userRequest: string,
  promptType: keyof typeof userCaseIntentPrompts = 'decompose_user_request'
): Promise<any[]> {
  // Get the processed prompt and replace the placeholder
  const promptTemplate = await userCaseIntentPrompts.getProcessedDecomposeUserRequest();
  const prompt = promptTemplate.replace('<USER_REQUEST>', userRequest);
  
  // Log the constructed prompt for debugging
  console.log("[AI-PROMPT] Constructed user case intent prompt for request:", userRequest);
  return [
    {
      role: "system",
      content: prompt
    }
  ];
}

// This can be expanded for other LLM services that might use different message formats
