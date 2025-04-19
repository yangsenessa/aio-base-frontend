import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { isValidJson, fixMalformedJson, hasModalStructure, getResponseFromModalJson, cleanJsonString, safeJsonParse } from "@/util/formatters";

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
    
    // Step 1: Apply JSON fixing before any parsing attempts
    const fixedResponse = fixMalformedJson(rawResponse);
    
    // Step 2: Check if the response is raw JSON (most direct case)
    if (fixedResponse.trim().startsWith('{')) {
      try {
        const parsed = safeJsonParse(fixedResponse);
        console.log("Successfully parsed direct JSON response");
        
        // Check if this is a structured response with the expected fields
        if (parsed && hasModalStructure(parsed)) {
          // Extract response field for display
          const responseText = getResponseFromModalJson(parsed) || rawResponse;
          
          // Handle both legacy and new AIO protocol formats
          const intentAnalysis = parsed.intent_analysis || {};
          const executionPlan = parsed.execution_plan || {
            steps: [],
            constraints: [],
            quality_metrics: []
          };
          
          return {
            id: Date.now().toString(),
            sender: 'ai',
            content: responseText, // Store only the response text as content
            timestamp: new Date(),
            metadata: {
              aiResponse: {
                intent_analysis: intentAnalysis,
                execution_plan: executionPlan,
                response: responseText
              }
            }
          };
        }
      } catch (err) {
        console.warn("Failed to parse direct JSON response:", err);
        // On error, return the original raw response
        return {
          id: Date.now().toString(),
          sender: 'ai',
          content: rawResponse,
          timestamp: new Date()
        };
      }
    }
    
    // Step 3: Check for JSON in code blocks
    let jsonContent = null;
    
    // For code blocks with ```json format
    if (rawResponse.includes('```json')) {
      const parts = rawResponse.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        const fixedJsonPart = fixMalformedJson(jsonPart);
        try {
          const parsed = safeJsonParse(fixedJsonPart);
          
          // Check if this is a structured response with the expected fields
          if (parsed && hasModalStructure(parsed)) {
            // Extract response field
            const responseText = getResponseFromModalJson(parsed) || rawResponse;
            
            // Handle both legacy and new AIO protocol formats
            const intentAnalysis = parsed.intent_analysis || {};
            const executionPlan = parsed.execution_plan || {
              steps: [],
              constraints: [],
              quality_metrics: []
            };
            
            console.log("Parsed JSON from code block with response field");
            return {
              id: Date.now().toString(),
              sender: 'ai',
              content: responseText,
              timestamp: new Date(),
              metadata: {
                aiResponse: {
                  intent_analysis: intentAnalysis,
                  execution_plan: executionPlan,
                  response: responseText
                }
              }
            };
          }
        } catch (e) {
          console.warn("Failed to parse JSON from code block:", e);
          jsonContent = fixedJsonPart; // Keep the fixed content for further attempts
        }
      }
    } 
    // For triple backticks without language specifier
    else if (rawResponse.includes('```')) {
      const parts = rawResponse.split('```');
      if (parts.length > 1) {
        const jsonPart = parts[1].trim();
        jsonContent = fixMalformedJson(jsonPart);
      }
    }
    
    // Step 4: Try to parse any extracted JSON content
    if (jsonContent && jsonContent.trim().startsWith('{')) {
      try {
        const parsed = safeJsonParse(jsonContent);
        
        // Check if this is a structured response with the expected fields
        if (parsed && hasModalStructure(parsed)) {
          // Extract response field
          const responseText = getResponseFromModalJson(parsed) || rawResponse;
          
          // Handle both legacy and new AIO protocol formats
          const intentAnalysis = parsed.intent_analysis || {};
          const executionPlan = parsed.execution_plan || {
            steps: [],
            constraints: [],
            quality_metrics: []
          };
          
          console.log("Parsed JSON from extracted content");
          return {
            id: Date.now().toString(),
            sender: 'ai',
            content: responseText,
            timestamp: new Date(),
            metadata: {
              aiResponse: {
                intent_analysis: intentAnalysis,
                execution_plan: executionPlan,
                response: responseText
              }
            }
          };
        }
      } catch (parseError) {
        console.warn("Failed to parse extracted JSON:", parseError);
      }
    }
    
    // Step 5: Use regex as a last resort for structured content
    const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/g;
    const matches = rawResponse.match(jsonRegex);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        // Look for patterns that suggest this is a structured response
        if (match.includes('"intent_analysis"') || 
            match.includes('"execution_plan"') || 
            match.includes('"response"') ||
            match.includes('"requestUnderstanding"') ||
            match.includes('"modalityAnalysis"') ||
            match.includes('"capabilityMapping"')) {
          
          try {
            const fixedJson = fixMalformedJson(match);
            const parsed = safeJsonParse(fixedJson);
            
            // Check if this is a structured response
            if (parsed && hasModalStructure(parsed)) {
              // Extract response field
              const responseText = getResponseFromModalJson(parsed) || rawResponse;
              
              // Handle both legacy and new AIO protocol formats
              const intentAnalysis = parsed.intent_analysis || {};
              const executionPlan = parsed.execution_plan || {
                steps: [],
                constraints: [],
                quality_metrics: []
              };
              
              console.log("Parsed JSON using regex extraction");
              return {
                id: Date.now().toString(),
                sender: 'ai',
                content: responseText,
                timestamp: new Date(),
                metadata: {
                  aiResponse: {
                    intent_analysis: intentAnalysis,
                    execution_plan: executionPlan,
                    response: responseText
                  }
                }
              };
            }
          } catch (err) {
            console.warn("Failed to parse regex-extracted JSON:", err);
          }
        }
      }
    }
    
    // Step 6: Fallback to raw text response
    console.log("Fallback: returning raw text response");
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined
    };
  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Always ensure a message is returned
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined
    };
  }
}
