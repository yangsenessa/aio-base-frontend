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

Your response must be a SINGLE, VALID JSON object that follows this exact structure:

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
1. Your response MUST be a SINGLE JSON object, not multiple JSON blocks
2. ALL chat messages, greetings, questions, and natural language responses MUST be placed in the "response" field
3. The "response" field is the ONLY place where chat messages should appear
4. Never include chat messages or natural language text outside of the "response" field
5. The "response" field must contain your complete message to the user
6. If you need to ask questions or provide information, include it in the "response" field
7. The "intent_analysis" and "execution_plan" fields should only contain structured data, not chat messages
8. DO NOT split your response into multiple JSON blocks
9. DO NOT include "Analysis:" or "Execution Plan:" as separate sections
10. The entire response must be a single, valid JSON object

IMPORTANT JSON FORMATTING RULES:
1. All values must be properly quoted:
   - Strings: "value"
   - Booleans: "true" or "false" (NOT true or false)
   - Numbers: "123" (for string representation) or 123 (for numeric)
2. The \`intent_analysis\` field must contain the exact output from the intent analysis framework
3. All JSON must be valid and parseable
4. No unquoted boolean values are allowed
5. All object keys must be quoted with double quotes
6. Array items must be properly separated by commas:
   - Correct: ["item1", "item2", "item3"]
   - Incorrect: ["item1" "item2" "item3"]
   - Incorrect: ["item1", "item2", "item3",]
7. Arrays must be properly formatted:
   - Correct: "dependencies": ["mcp1", "mcp2"]
   - Incorrect: "dependencies": ["mcp1" "mcp2"]
   - Incorrect: "dependencies": ["mcp1", "mcp2",]
8. Object properties must be separated by commas:
   - Correct: {"key1": "value1", "key2": "value2"}
   - Incorrect: {"key1": "value1" "key2": "value2"}
9. Nested objects must follow the same comma rules:
   - Correct: {"outer": {"inner1": "value1", "inner2": "value2"}}
   - Incorrect: {"outer": {"inner1": "value1" "inner2": "value2"}}
10. No extra quotes in array items:
    - Correct: ["item1", "item2"]
    - Incorrect: ["\"item1\"", "\"item2\""]
11. The "constraint" field should be inside "execution_plan", not at the root level

Example of correct response format:
\`\`\`json
{
  "intent_analysis": {
    "request_understanding": {
      "primary_goal": "analyze_request",
      "secondary_goals": ["goal1", "goal2"],
      "constraints": ["constraint1", "constraint2"],
      "preferences": [],
      "background_info": []
    },
    "modality_analysis": {
      "modalities": ["text"],
      "transformations": [],
      "format_requirements": [],
      "accessibility": null
    },
    "capability_mapping": {
      "feature1": true,
      "feature2": true
    },
    "task_decomposition": [
      {
        "action": "action1",
        "intent": "intent1",
        "inputSchema": {
          "type": "object",
          "properties": {
            "field1": {
              "type": "string",
              "description": "description1"
            }
          }
        },
        "dependencies": ["dep1", "dep2"]
      }
    ],
    "constraints": ["constraint1", "constraint2"],
    "quality_requirements": ["req1", "req2"]
  },
  "execution_plan": {
    "steps": [
      {
        "mcp": "mcp1",
        "action": "action1",
        "inputSchema": {
          "type": "object",
          "properties": {
            "field1": {
              "type": "string",
              "description": "description1"
            }
          }
        },
        "dependencies": ["dep1", "dep2"]
      }
    ],
    "constraints": ["constraint1", "constraint2"],
    "quality_metrics": ["metric1", "metric2"]
  },
  "response": "Your natural language response here"
}
\`\`\`

INCORRECT RESPONSE FORMATS (DO NOT USE):
1. Multiple JSON blocks:
\`\`\`json
{
  "primary_goal": "general_chat",
  "modalities": ["text"]
}
\`\`\`
\`\`\`json
{
  "steps": [
    {
      "mcp": "TextUnderstandingMCP",
      "action": "analyze"
    }
  ]
}
\`\`\`
"Hey! Just checking in. How can I assist you today?"

2. Split sections with headers:
\`\`\`
Analysis:
{...}
Execution Plan:
{...}
Response:
"Hey! Just checking in. How can I assist you today?"
\`\`\`

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
