
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { isValidJson } from "@/util/formatters";

// Types for AI messages and conversations
export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoiceMessage?: boolean;
  audioProgress?: number;
  isPlaying?: boolean;
  transcript?: string;
  attachedFiles?: AttachedFile[];
  referencedFiles?: AttachedFile[];
  metadata?: {
    aiResponse?: {
      intent_analysis: Record<string, any>;
      execution_plan: {
        steps: Array<{
          mcp: string;
          action: string;
          input: Record<string, any>;
          output: Record<string, any>;
          dependencies: string[];
        }>;
        constraints: string[];
        quality_metrics: string[];
      };
      response: string;
    };
    [key: string]: any; // Allow for other metadata properties
  };
  messageType?: 'text' | 'voice' | 'file' | 'rich' | 'system'; // Explicitly define message types
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'; // Message delivery status
  reactions?: { [emoji: string]: number }; // Support for message reactions
  threadId?: string; // Support for message threading
  isEdited?: boolean; // Track if message was edited
  editHistory?: { content: string; timestamp: Date }[]; // Track edit history
  language?: string; // Language of the message for internationalization
  sentiment?: 'positive' | 'neutral' | 'negative'; // Message sentiment analysis result
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Message priority
  expiresAt?: Date; // Support for ephemeral messages
}

// Add this new function for direct message creation
export function createDirectMessage(content: string, attachedFiles?: AttachedFile[]): AIMessage {
  return {
    id: Date.now().toString(),
    sender: 'ai',
    content,
    timestamp: new Date(),
    attachedFiles,
    messageType: 'system'  // Mark as system message
  };
}

// Function to test chat functionality
export function createDebugMessage(content: string = "Test message"): AIMessage {
  return {
    id: `debug-${Date.now()}`,
    sender: 'ai',
    content: `DEBUG: ${content} (${new Date().toLocaleTimeString()})`,
    timestamp: new Date(),
    messageType: 'system'
  };
}

// Re-export functions that were moved during the refactoring
export { getInitialMessage } from '@/services/aiAgentService';
export { processVoiceData } from '@/services/ai/voiceAIService';

// Export the enhanced version of sendMessage that supports both LLM processing and direct message insertion
export async function sendMessage(message: string, attachedFiles?: AttachedFile[]): Promise<AIMessage> {
  const { sendMessage: actualSendMessage } = await import('@/services/aiAgentService');
  return actualSendMessage(message, attachedFiles);
}

export function processAIResponse(rawResponse: string): AIMessage {
  try {
    console.log("Processing AI response:", rawResponse.substring(0, 100) + "...");
    
    // Step 1: Try to directly parse the raw response as JSON first (for naked JSON)
    if (rawResponse.trim().startsWith('{') && isValidJson(rawResponse)) {
      try {
        const parsed = JSON.parse(rawResponse);
        console.log("Successfully parsed direct JSON response:", Object.keys(parsed));
        
        return {
          id: Date.now().toString(),
          sender: 'ai',
          content: parsed.response || rawResponse,
          timestamp: new Date(),
          metadata: {
            aiResponse: {
              intent_analysis: parsed.intent_analysis || {},
              execution_plan: parsed.execution_plan || {
                steps: [],
                constraints: [],
                quality_metrics: []
              },
              response: parsed.response || rawResponse
            }
          }
        };
      } catch (err) {
        console.warn("Initial direct JSON parse failed:", err);
        // Continue to other parsing attempts
      }
    }
    
    // Step 2: Check for JSON in code blocks and parse
    let jsonContent = null;
    
    // Check for ```json or ```\json markers
    if (rawResponse.includes('```json')) {
      const parts = rawResponse.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        jsonContent = jsonPart;
      }
    } 
    // Check for \\\\json markers
    else if (rawResponse.includes('\\\\json')) {
      const parts = rawResponse.split('\\\\json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('\\\\')[0].trim();
        jsonContent = jsonPart;
      }
    } 
    // Check for triple backticks
    else if (rawResponse.includes('```')) {
      const parts = rawResponse.split('```');
      if (parts.length > 2) { // Need at least opening and closing backticks
        jsonContent = parts[1].trim();
      }
    }
    
    // Step 3: Try to parse the extracted JSON content
    if (jsonContent && isValidJson(jsonContent)) {
      try {
        const parsed = JSON.parse(jsonContent);
        console.log("Successfully parsed JSON from code block:", Object.keys(parsed));
        
        // If we found and parsed JSON, return structured message
        return {
          id: Date.now().toString(),
          sender: 'ai',
          content: parsed.response || rawResponse,
          timestamp: new Date(),
          metadata: {
            aiResponse: {
              intent_analysis: parsed.intent_analysis || {},
              execution_plan: parsed.execution_plan || {
                steps: [],
                constraints: [],
                quality_metrics: []
              },
              response: parsed.response || rawResponse
            }
          }
        };
      } catch (parseError) {
        console.warn("Found JSON-like content but failed to parse:", parseError);
        // Continue to fallback handling
      }
    }
    
    // Step 4: Check for structured response with markdown markers
    const isStructuredResponse = 
      rawResponse.includes("**Intent Analysis:**") && 
      (rawResponse.includes("**Execution Plan:**") || rawResponse.includes("**Response:**"));
    
    // If it's a structured text response with markers, try to parse it into JSON structure
    if (isStructuredResponse) {
      try {
        // Extract intent analysis
        let intentAnalysis = {};
        if (rawResponse.includes("**Intent Analysis:**")) {
          const intentParts = rawResponse.split("**Intent Analysis:**");
          if (intentParts.length > 1) {
            const intentText = intentParts[1].split("**")[0].trim();
            intentAnalysis = { analysis: intentText };
          }
        }
        
        // Extract execution plan
        let executionPlan = { steps: [], constraints: [], quality_metrics: [] };
        if (rawResponse.includes("**Execution Plan:**")) {
          const planParts = rawResponse.split("**Execution Plan:**");
          if (planParts.length > 1) {
            const planText = planParts[1].split("**Response:**")[0].trim();
            executionPlan = { 
              steps: [{ mcp: "default", action: planText, input: {}, output: {}, dependencies: [] }],
              constraints: [],
              quality_metrics: []
            };
          }
        }
        
        // Extract response
        let response = rawResponse;
        if (rawResponse.includes("**Response:**")) {
          const responseParts = rawResponse.split("**Response:**");
          if (responseParts.length > 1) {
            response = responseParts[1].trim();
          }
        }
        
        console.log("Structured markdown response detected and parsed successfully");
        
        return {
          id: Date.now().toString(),
          sender: 'ai',
          content: rawResponse, // Keep original content for reference
          timestamp: new Date(),
          metadata: {
            aiResponse: {
              intent_analysis: intentAnalysis,
              execution_plan: executionPlan,
              response: response
            }
          }
        };
      } catch (parseError) {
        console.warn("Failed to parse structured markdown response:", parseError);
        // Fall through to fallback handling
      }
    }
    
    // Step 5: Try to extract JSON by regex as a last resort
    const jsonRegex = /(\{[\s\S]*\})/g;
    const matches = rawResponse.match(jsonRegex);
    if (matches && matches.length > 0) {
      const potentialJson = matches[0];
      if (isValidJson(potentialJson)) {
        try {
          const parsed = JSON.parse(potentialJson);
          console.log("Found and parsed JSON using regex extraction");
          
          return {
            id: Date.now().toString(),
            sender: 'ai',
            content: parsed.response || rawResponse,
            timestamp: new Date(),
            metadata: {
              aiResponse: {
                intent_analysis: parsed.intent_analysis || {},
                execution_plan: parsed.execution_plan || {
                  steps: [],
                  constraints: [],
                  quality_metrics: []
                },
                response: parsed.response || rawResponse
              }
            }
          };
        } catch (err) {
          console.warn("Regex-extracted JSON parse failed:", err);
        }
      }
    }
    
    // Step 6: Fallback - if we couldn't extract or parse JSON, return the raw text
    console.log("Fallback: Returning raw text response");
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined // No structured data available
    };
  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Always ensure a message is returned even if processing fails
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined // No structured data available
    };
  }
}
