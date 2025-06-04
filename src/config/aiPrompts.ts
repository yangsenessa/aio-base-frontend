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

Before responding to any user request, you must:

1. Analyze the user's intent using this framework:
${processedIntentPrompt}

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

Your response MUST be a SINGLE, VALID JSON object that follows this exact structure. DO NOT include any markdown formatting, headers, or additional text outside the JSON object.

CRITICAL RESPONSE RULES:
1. Your response MUST be a SINGLE JSON object, not multiple JSON blocks
2. DO NOT include any markdown formatting, headers, or additional text
3. DO NOT include "Analysis:", "Execution Plan:", or any other section headers
4. DO NOT include any text outside the JSON object
5. The entire response must be a single, valid JSON object that can be parsed
6. The "response" field MUST be a natural language string that:
   - MUST be written in English regardless of the input language
   - MUST use direct command format without unnecessary explanations
   - MUST start each action with a verb
   - MUST avoid phrases like "I understand", "I will", "Let me"
   - MUST be concise and action-oriented
   - MUST separate multiple actions with periods
   - MUST be directly usable as a prompt
   - MUST focus on essential actions only
   - MUST avoid redundant information
   - MUST be clear and unambiguous
   - MUST maintain a consistent format: "Action: target. Action: target."
   - MUST NOT include explanations or justifications
   - MUST NOT include meta-information about the task
   - MUST NOT include status updates or progress indicators
   - MUST NOT include conditional statements
   - MUST NOT include questions or requests for clarification
7. The response should feel like a natural conversation with the user,for example:'red cat on sofa' is usually replaced by your results for current request.
8. The "intent_analysis" and "execution_plan" fields should only contain structured data
9. DO NOT split your response into multiple JSON blocks
10. The response should reflect a deep understanding of the user's intent and requirements
11. Keep the response concise but informative, focusing on what matters to the user

RESPONSE GENERATION PRIORITY:
1. If background_info exists and is not null:
   - Use it as the primary context for response generation
   - Incorporate relevant details from background_info into the response
   - Ensure the response maintains continuity with the background context
2. Always consider the current user request:
   - Address the immediate needs expressed in the request
   - Connect the request with any relevant background context
3. Response structure should:
   - Begin with acknowledging the context (if background_info exists)
   - Address the current request
   - Provide clear next steps
   - Maintain a natural flow between background context and current request

IMPORTANT JSON FORMATTING RULES:
1. All values must be properly quoted:
   - Strings: "value"
   - Booleans: "true" or "false" (NOT true or false)
   - Numbers: "123" (for string representation) or 123 (for numeric)
2. The \`intent_analysis\` field must contain the exact output from the intent analysis framework
3. All JSON must be valid and parseable
4. No unquoted boolean values are allowed
5. All object keys must be quoted with double quotes
6. Array items must be properly separated by commas
7. Arrays must be properly formatted
8. Object properties must be separated by commas
9. Nested objects must follow the same comma rules
10. No extra quotes in array items
11. The "constraint" field should be inside "execution_plan", not at the root level

REQUIRED JSON STRUCTURE:
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
    "capability_mapping": {
      "string": boolean
    },
    "task_decomposition": [
      {
        "action": "string",
        "intent": "string",
        "inputSchema": {
          "type": "string",
          "properties": {
            "string": {
              "type": "string",
              "description": "string"
            }
          }
        },
        "dependencies": ["string"],
        "success_criteria": "string"
      }
    ],
    "constraints": ["string"],
    "quality_requirements": ["string"]
  },
  "execution_plan": {
    "steps": [
      {
        "mcp": "string",
        "action": "string",
        "inputSchema": {
          "type": "string",
          "properties": {
            "string": {
              "type": "string",
              "description": "string"
            }
          }
        },
        "dependencies": ["string"],
        "success_criteria": "string"
      }
    ],
    "constraints": ["string"],
    "quality_metrics": ["string"]
  },
  "response": "string"
}

Example of correct response format (DO NOT COPY THIS EXACT RESPONSE - GENERATE YOUR OWN BASED ON THE ACTUAL REQUEST):
{
  "intent_analysis": {
    "request_understanding": {
      "primary_goal": "generate_image",
      "secondary_goals": [],
      "constraints": ["background_image_available"],
      "preferences": [],
      "background_info": [],
      "required_capabilities": ["image_generation"]
    },
    "modality_analysis": {
      "modalities": ["image"],
      "transformations": [],
      "format_requirements": [],
      "accessibility": null
    },
    "capability_mapping": {
      "image_generation": true
    },
    "task_decomposition": [
      {
        "action": "transform",
        "intent": "generate_description",
        "inputSchema": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Image description"
            }
          }
        },
        "dependencies": [],
        "success_criteria": "Generate accurate and descriptive text for image generation."
      },
      {
        "action": "transform",
        "intent": "convert_to_image",
        "inputSchema": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Image description"
            }
          }
        },
        "dependencies": [],
        "success_criteria": "Convert generated text into a high-quality image."
      }
    ],
    "constraints": ["background_image_available"],
    "quality_requirements": ["image_resolution", "colorAccuracy"]
  },
  "execution_plan": {
    "steps": [
      {
        "mcp": "ImageGenerationMCP",
        "action": "generate_image",
        "inputSchema": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Image description"
            }
          }
        },
        "dependencies": [],
        "success_criteria": "Generate high-quality image with correct color scheme"
      }
    ],
    "constraints": ["background_image_available"],
    "quality_metrics": ["image_resolution", "colorAccuracy"]
  },
  "response": "Generate: red cat on sofa. Apply: color correction. Execute: text-to-image."
}

IMPORTANT: The example response above is just to demonstrate the response pattern. You MUST generate your own unique response based on the actual user request, following the same pattern but with content specific to the user's needs, don't limited in 'cat' or 'image generate'`;

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
