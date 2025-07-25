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

// Helper function to clean and sanitize help response data
function sanitizeHelpResponse(helpResponse: string): string {
  try {
    // Parse the JSON to work with the structure
    const parsed = JSON.parse(helpResponse);
    
    // Recursive function to clean objects
    function cleanObject(obj: any): any {
      if (obj === null || obj === undefined) {
        return obj;
      }
      
      if (typeof obj === 'string') {
        // Clean HTML entities
        return obj
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\u0026nbsp;/g, ' ') // Unicode HTML entities
          .trim();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
      }
      
      if (typeof obj === 'object') {
        const cleaned: any = {};
        
        for (const [key, value] of Object.entries(obj)) {
          // Skip problematic keys
          if (key === '_value_' || key === '_content_' || key.includes('&nbsp;') || key.includes('\u0026nbsp;')) {
            continue;
          }
          
          // Detect recursive patterns - skip if the same key appears more than 3 levels deep
          if (typeof value === 'object' && value !== null) {
            const jsonStr = JSON.stringify(value);
            // Check for obvious recursive patterns
            if (jsonStr.includes('{"&nbsp;":{') || jsonStr.includes('{"_value_":')) {
              continue;
            }
          }
          
          // Clean the key name
          const cleanKey = key
            .replace(/&nbsp;/g, '')
            .replace(/\u0026nbsp;/g, '')
            .replace(/&amp;/g, '&')
            .trim();
          
          if (cleanKey && cleanKey.length > 0) {
            cleaned[cleanKey] = cleanObject(value);
          }
        }
        
        return cleaned;
      }
      
      return obj;
    }
    
    // Clean the parsed object
    const cleaned = cleanObject(parsed);
    
    // Return the cleaned JSON string
    return JSON.stringify(cleaned, null, 2);
    
  } catch (error) {
    console.warn('[DATA-CLEAN] Failed to parse help response as JSON, returning cleaned string:', error);
    // Fallback: clean as string if JSON parsing fails
    return helpResponse
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\u0026nbsp;/g, ' ')
      .replace(/"_value_":\s*"[^"]*"/g, '') // Remove _value_ fields
      .trim();
  }
}

// Create messages for sample processing with help response
export function createEMCNetworkSampleMessage(
  helpResponse: string, 
  describeContent: string,
  promptType: keyof typeof aioIndexPrompts = 'build_mcp_index'
): any[] {
  // Clean and sanitize the help response before injection
  const cleanedHelpResponse = sanitizeHelpResponse(helpResponse);
  
  // Log the cleaning process for debugging
  console.log("[DATA-CLEAN] Original help response length:", helpResponse.length);
  console.log("[DATA-CLEAN] Cleaned help response length:", cleanedHelpResponse.length);
  
  // Replace the placeholder in the prompt with the cleaned help response
  const prompt = aioIndexPrompts[promptType]
    .replace('help_response', cleanedHelpResponse)
    .replace('describe_content', describeContent);
  
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
