import React from 'react';
import { Mic, Info, MessageCircle } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';
import ProtocolMessage from './ProtocolMessage';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { 
  isValidJson, 
  extractJsonFromText, 
  processAIResponseContent,
  cleanJsonString,
  safeJsonParse,
  hasModalStructure,
  fixMalformedJson,
  getResponseFromModalJson,
  extractJsonFromMarkdownSections,
  isAIOProtocolMessage,
  aggressiveBackslashFix,
  extractResponseFromJson,
  extractResponseFromRawJson,
  removeJsonComments
} from '@/util/formatters';

// Add logging utility
const logCheckpoint = (message: string, data?: any) => {
  console.log(`[MessageContent] ${message}`, data ? data : '');
};

interface MessageContentProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageContent = ({ message, onPlaybackChange }: MessageContentProps) => {
  // Debug logging for message structure
  React.useEffect(() => {
    if (message.sender === 'ai') {
      logCheckpoint('Processing AI message', {
        id: message.id,
        hasMetadata: !!message.metadata,
        hasStructuredResponse: !!message.metadata?.aiResponse,
        hasProtocolContext: !!message.metadata?.protocolContext,
        contentPreview: message.content?.substring(0, 100)
      });
      
      if (message.metadata?.aiResponse) {
        logCheckpoint('AI Response structure', {
          intentKeys: Object.keys(message.metadata.aiResponse.intent_analysis || {}),
          executionSteps: message.metadata.aiResponse.execution_plan?.steps?.length || 0
        });
      }
      
      if (message.metadata?.protocolContext) {
        logCheckpoint('Protocol Context', message.metadata.protocolContext);
      }
    }
  }, [message]);

  // Check if this is a protocol message
  const isProtocolMessage = React.useMemo(() => {
    return isAIOProtocolMessage(message);
  }, [message]);

  // Enhanced check for JSON content in the message
  const hasJsonContent = React.useMemo(() => {
    if (!message.content) return false;
    logCheckpoint('Checking for JSON content');
    
    // Check for standard JSON-like content
    if (message.content.includes('{') && message.content.includes('}')) {
      try {
        // Apply general purpose fixing and parsing
        const fixedJson = fixMalformedJson(message.content);
        const parsed = safeJsonParse(fixedJson);
        
        if (parsed) {
          logCheckpoint('Valid JSON content detected after fixing');
          return true;
        }
      } catch (error) {
        logCheckpoint('Error parsing potential JSON content', { error: error.message });
      }
    }
    
    logCheckpoint('Plain text content detected, bypassing JSON formatting');
    return false;
  }, [message.content]);

  // Check if the content appears to be a structured AI message
  const isStructuredResponse = React.useMemo(() => {
    // Skip for protocol messages
    if (isProtocolMessage) return false;
    
    logCheckpoint('Checking for structured response');
    
    // Debug the sender and content to catch why it might be failing
    logCheckpoint('Message details', {
      sender: message.sender, 
      hasContent: !!message.content,
      hasRawJson: !!message._rawJsonContent
    });
    
    if (message.sender !== 'ai' || !message.content) {
      logCheckpoint('Not an AI message or no content');
      return false;
    }
    
    // Check for raw JSON content first (_rawJsonContent is set in MessageBubble)
    if (message._rawJsonContent) {
      logCheckpoint('Raw JSON content available, treating as structured');
      return true;
    }
    
    // Early return for plain text with URLs or download links
    if ((message.content.includes('http://') || message.content.includes('https://')) &&
        !message.content.includes('{') && 
        !message.content.includes('```')) {
      logCheckpoint('URL content detected, bypassing structured formatting');
      return false;
    }
    
    // Check for code block wrapped JSON
    if (message.content.includes('```json') || 
        (message.content.includes('```') && message.content.includes('{'))) {
      logCheckpoint('Code block wrapped JSON detected');
      return true;
    }
    
    // Direct check for both intent_analysis and execution_plan in JSON format
    if (message.content.trim().startsWith('{') && 
        message.content.includes('"intent_analysis"') && 
        message.content.includes('"execution_plan"') &&
        message.content.includes('"response"')) {
      logCheckpoint('Complete intent+execution+response structure detected');
      return true;
    }
    
    // Check for markdown structured format first
    if (
      message.content.includes("**Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**") ||
      message.content.includes("Intent Analysis:") ||
      message.content.includes("Execution Steps")
    ) {
      logCheckpoint('Markdown structured format detected');
      return true;
    }
    
    // Check for existing structured metadata first
    if (message.metadata?.aiResponse) {
      const aiResponse = message.metadata.aiResponse;
      const isStructured = Object.keys(aiResponse.intent_analysis || {}).length > 0 ||
                          (aiResponse.execution_plan?.steps?.length > 0);
      logCheckpoint('Metadata structure check result', { isStructured });
      return isStructured;
    }
    
    // Enhanced check for JSON in code blocks or raw format
    try {
      let jsonContent = null;
      
      // For code blocks with JSON format
      if (message.content.includes('```json') || message.content.includes('```')) {
        jsonContent = cleanJsonString(message.content);
      } 
      // For raw JSON
      else if (message.content.trim().startsWith('{')) {
        jsonContent = fixMalformedJson(message.content);
      }
      
      if (jsonContent) {
        // Try to parse with utilities that handle malformed JSON
        const parsedJson = safeJsonParse(jsonContent);
        
        // Check for intent analysis structure with more flexible detection
        if (parsedJson) {
          // Check for both intent_analysis and execution_plan with response
          if ((parsedJson.intent_analysis || parsedJson.execution_plan) && parsedJson.response) {
            logCheckpoint('Found complete structure with response', {
              hasIntent: !!parsedJson.intent_analysis,
              hasExecution: !!parsedJson.execution_plan
            });
            return true;
          }
          
          const hasIntentStructure = hasModalStructure(parsedJson) || 
            parsedJson.intent_analysis || 
            parsedJson.requestUnderstanding || 
            parsedJson.request_understanding || 
            parsedJson.execution_plan;
          
          logCheckpoint('JSON structure check result', { hasIntentStructure });
          return hasIntentStructure;
        }
      }
    } catch (error) {
      logCheckpoint('Error in JSON structure check', { error });
    }
    
    // Check for common JSON markers in content
    const hasJsonMarkers = (
      message.content.includes('"intent_analysis"') || 
      message.content.includes('"execution_plan"') || 
      message.content.includes('"request_understanding"') ||
      message.content.includes('"requestUnderstanding"') ||
      message.content.includes('"primary_goal"')
    );
    
    logCheckpoint('Content markers check result', { hasJsonMarkers });
    return hasJsonMarkers;
  }, [message, isProtocolMessage]);

  // Extract structured data from JSON content
  const extractStructuredData = (content: string): { 
    intentAnalysis?: Record<string, any>, 
    executionPlan?: Record<string, any> 
  } | null => {
    try {
      logCheckpoint('Extracting structured data from content');
      
      // First try using our special extractJsonFromMarkdownSections utility
      // which handles the **Analysis:** and **Execution Plan:** sections
      if (content.includes("**Analysis:**") || 
          content.includes("**Execution Plan:**") || 
          content.includes("**Response:**")) {
        
        logCheckpoint('Content contains markdown sections, using specialized extractor');
        const extractedData = extractJsonFromMarkdownSections(content);
        
        if (extractedData) {
          logCheckpoint('Successfully extracted data from markdown sections');
          return {
            intentAnalysis: extractedData.intent_analysis,
            executionPlan: extractedData.execution_plan
          };
        }
      }
      
      // Try our full JSON parsing pipeline with all the fixers and cleaners
      try {
        // Clean and fix the JSON
        const cleanedJson = cleanJsonString(content);
        const fixedJson = fixMalformedJson(cleanedJson);
        
        // Try to parse with our safest and most robust parser
        const parsed = safeJsonParse(fixedJson);
        
        if (parsed) {
          logCheckpoint('Successfully parsed JSON using full pipeline');
          
          // Check for different field patterns we might encounter
          return {
            intentAnalysis: parsed.intent_analysis || parsed.intentAnalysis,
            executionPlan: parsed.execution_plan || parsed.executionPlan
          };
        }
      } catch (parseError) {
        logCheckpoint('Failed to parse JSON using full pipeline', { error: parseError.message });
      }
      
      // If all else fails, look for JSON objects directly using regex
      const objectRegex = /{[^{]*?}/g;
      const matches = content.match(objectRegex);
      
      if (matches && matches.length > 0) {
        logCheckpoint('Attempting to extract structured data from JSON fragments');
        
        // Try each match, starting with the largest (most likely complete)
        const sortedMatches = [...matches].sort((a, b) => b.length - a.length);
        
        for (const match of sortedMatches) {
          try {
            // Apply our fixes to the fragment
            const cleanedMatch = cleanJsonString(match);
            const fixedMatch = fixMalformedJson(cleanedMatch);
            const parsed = JSON.parse(fixedMatch);
            
            if (parsed) {
              // Check if this is an intent_analysis or execution_plan fragment
              if (match.includes('"intent_analysis"') || 
                  match.includes('"request_understanding"') || 
                  match.includes('"primary_goal"')) {
                
                logCheckpoint('Found intent analysis fragment');
                return {
                  intentAnalysis: parsed.intent_analysis || parsed,
                  executionPlan: null
                };
              } else if (match.includes('"execution_plan"') || 
                         match.includes('"steps"')) {
                
                logCheckpoint('Found execution plan fragment');
            return {
                  intentAnalysis: null,
                  executionPlan: parsed.execution_plan || parsed
                };
              }
            }
          } catch (matchError) {
            // Continue to the next match
          }
        }
      }
      
      // Create a synthetic structure if all else fails
      if (content.toLowerCase().includes('hello') || 
          content.toLowerCase().includes('how can i assist') ||
          content.toLowerCase().includes('checking in')) {
        
        logCheckpoint('Creating synthetic structured data');
        return {
          intentAnalysis: {
            request_understanding: {
              primary_goal: "greeting",
              secondary_goals: ["check_in"]
            }
          },
          executionPlan: {
            steps: [{
              mcp: "TextUnderstandingMCP",
              action: "respond",
              synthetic: true
            }]
          }
        };
      }
      
      return null;
    } catch (error) {
      logCheckpoint('Error extracting structured data', { error: error.message });
      return null;
    }
  };

  // Render structured AI response with both button and response content
  const renderStructuredResponse = () => {
    logCheckpoint('Rendering structured AI response');
    
    try {
      // Use raw JSON content for analysis if available
      const contentForAnalysis = message._rawJsonContent || message.content;
      
      // Clean the content from comments before processing
      const cleanedContent = removeJsonComments(contentForAnalysis);
      
      // Log the entire content for debugging
      console.log('[MessageContent] Raw JSON for analysis:', cleanedContent);
      
      // Pre-check for response field using simpler method for quick success
      let responseContent = null;
      let structuredData = null;
      
      // 1. Try a quick extraction using regex for immediate display
      if (cleanedContent.includes('"response"')) {
        try {
          // More robust regex to extract response
          const responseMatch = cleanedContent.match(/"response"\s*:\s*"([^"]+)"/);
          if (responseMatch && responseMatch[1]) {
            responseContent = responseMatch[1];
            logCheckpoint('Extracted response using quick regex method', { response: responseContent });
          }
        } catch (e) {
          logCheckpoint('Quick response extraction failed', { error: e.message });
        }
      }
      
      // 2. If quick extraction failed, try more robust methods
      if (!responseContent) {
        try {
          // Apply our JSON cleanup and parsing pipeline
          const cleanedJson = cleanJsonString(cleanedContent);
          const fixedJson = fixMalformedJson(cleanedJson);
          
          try {
            const parsed = safeJsonParse(fixedJson);
            if (parsed && parsed.response) {
              responseContent = parsed.response;
              logCheckpoint('Extracted response using full parse method', { response: responseContent });
            }
          } catch (parseError) {
            logCheckpoint('Full parse method failed', { error: parseError.message });
            
            // Try extracting from markdown sections
            if (cleanedContent.includes("**Response:**")) {
              const extracted = extractJsonFromMarkdownSections(cleanedContent);
              if (extracted && extracted.response) {
                responseContent = extracted.response;
                logCheckpoint('Extracted response from markdown sections', { response: responseContent });
              }
            }
          }
        } catch (e) {
          logCheckpoint('Advanced response extraction failed', { error: e.message });
        }
      }
      
      // 3. Final fallback: create a synthetic response from greeting patterns
      if (!responseContent && cleanedContent) {
        const lowerContent = cleanedContent.toLowerCase();
        if (lowerContent.includes('hello') || 
            lowerContent.includes('hey') || 
            lowerContent.includes('greetings') || 
            lowerContent.includes('hi there') ||
            lowerContent.includes('how can i assist') ||
            lowerContent.includes('how can i help')) {
          
          // Attempt to extract any human-readable text from the message
          const textMatch = cleanedContent.match(/[A-Za-z][\w\s.,!?]+[.!?]/);
          if (textMatch) {
            responseContent = textMatch[0];
            logCheckpoint('Created synthetic response from text pattern', { response: responseContent });
          }
        }
      }
      
      // Extract structured data for the modal view
      structuredData = extractStructuredData(cleanedContent);
        
      // Log the extracted structured data
      logCheckpoint('Extracted structured data', {
        hasIntentAnalysis: !!structuredData?.intentAnalysis,
        intentAnalysisKeys: Object.keys(structuredData?.intentAnalysis || {}),
        hasExecutionPlan: !!structuredData?.executionPlan?.steps?.length,
        executionPlanSteps: structuredData?.executionPlan?.steps?.length || 0
      });
      
      // If we still have no response content, try to use any existing display content
      if (!responseContent && message._displayContent) {
        responseContent = message._displayContent;
        logCheckpoint('Using existing display content as fallback', { response: responseContent });
      }
      
      // Final fallback - use the entire content as is
      if (!responseContent) {
        responseContent = cleanedContent;
        logCheckpoint('Using raw content as fallback response', { responsePreview: responseContent.substring(0, 50) });
      }
      
      // Return the structured response component
      return (
              <AIResponseCard 
          content={responseContent}
                intentAnalysis={structuredData?.intentAnalysis}
                executionPlan={structuredData?.executionPlan}
          rawJson={cleanedContent}
        />
      );
    } catch (error) {
      console.error("Error rendering structured response:", error);
      // Ultimate fallback
      return (
        <div className="prose prose-invert max-w-none">
          {message._displayContent || message.content || "Error displaying response"}
        </div>
      );
    }
  };

  // Main render function
  const renderMessageContent = () => {
    // Add additional debug logging
    logCheckpoint('Beginning message rendering', {
      id: message.id,
      sender: message.sender,
      contentPreview: message.content?.substring(0, 50),
      hasRawJson: !!message._rawJsonContent
    });
    
    // Handle protocol messages
    if (isProtocolMessage) {
      logCheckpoint('Rendering protocol message');
      return <ProtocolMessage message={message} />;
    }
    
    // Handle voice messages specifically
    if (message.isVoiceMessage) {
      logCheckpoint('Rendering voice message');
      return (
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground mb-1">
            <Mic size={14} className="mr-1" />
            <span className="text-xs">Voice Message</span>
          </div>
          
          {message.transcript && (
            <div className="text-sm italic text-muted-foreground mb-2">
              "{message.transcript}"
            </div>
          )}
          
          <MessageAudioPlayer
            messageId={message.id}
            audioProgress={message.audioProgress}
            isPlaying={message.isPlaying}
            onPlaybackChange={onPlaybackChange}
          />
          
          {typeof message.content === 'string' && !message.content.startsWith('🎤') && (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
      );
    }
    
    // Handle messages with file attachments
    if (message.attachedFiles && message.attachedFiles.length > 0) {
      logCheckpoint('Rendering message with attachments');
      return (
        <div className="space-y-3">
          {typeof message.content === 'string' && (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          )}
          
          <div className="grid gap-2">
            {message.attachedFiles.map((file) => (
              <FilePreview key={file.id} file={file} />
            ))}
          </div>
        </div>
      );
    }
    
    // Explicitly check if this is an AI message
    const isAIMessage = message.sender === 'ai';
    if (!isAIMessage) {
      logCheckpoint('Rendering user message');
      return (
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      );
    }
    
    // Check if this is a message with JSON content that should show analysis button
    const shouldShowAnalysisButton = 
      isAIMessage && 
      (message._rawJsonContent || isStructuredResponse || hasJsonContent);
      
    if (shouldShowAnalysisButton) {
      logCheckpoint('Rendering message with analysis button');
      return renderStructuredResponse();
    }
    
    // Extract response value from JSON for raw JSON messages
    // This is for cases where the JSON extraction in MessageBubble wasn't sufficient
    if (isAIMessage && 
        message.content && 
        (message.content.trim().startsWith('{') || message.content.includes('```')) &&
        message.content.includes('"response"')) {
      
      logCheckpoint('Extracting response value from JSON content');
      const responseValue = extractResponseFromRawJson(message.content);
      
      if (responseValue) {
        logCheckpoint('Found response value in JSON', { responseValue });
        return (
          <div className="whitespace-pre-wrap break-words">
            {responseValue}
          </div>
        );
      }
    }
    
    // Enhanced detection for plain text with URLs
    // Regex pattern for URLs, slightly more comprehensive than simple string includes
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const hasUrls = message.content && urlPattern.test(message.content);
    
    // Check if content has code blocks or JSON-like structures
    const hasCodeBlocks = message.content && message.content.includes('```');
    const hasJsonStructure = message.content && 
                            (message.content.includes('{') || 
                             message.content.trim().startsWith('{') ||
                             message.content.includes('"intent_analysis"') ||
                             message.content.includes('"execution_plan"'));
    
    // Improved detection for plain text with URLs
    const isPlainTextWithUrls = hasUrls && !hasCodeBlocks && !hasJsonStructure;
    
    // For plain text responses with URLs (prioritize this check)
    if (isAIMessage && isPlainTextWithUrls) {
      logCheckpoint('Rendering plain text with URLs');
      return (
        <div className="whitespace-pre-wrap break-words">
          {message._displayContent || message.content}
        </div>
      );
    }
    
    // For standard plain text without complex structure or formatting
    const isSimplePlainText = isAIMessage && 
                             !hasJsonStructure && 
                             !hasCodeBlocks && 
                             !isStructuredResponse &&
                             !hasJsonContent;
    
    if (isSimplePlainText) {
      logCheckpoint('Rendering simple plain text');
      return (
        <div className="whitespace-pre-wrap break-words">
          {message._displayContent || message.content}
        </div>
      );
    }
    
    // Final fallback for any other type of message
    logCheckpoint('Rendering fallback text message');
    return (
      <div className="whitespace-pre-wrap break-words">
        {message._displayContent || message.content || "Could not render message content"}
      </div>
    );
  };
  
  // Render the content
  return renderMessageContent();
};

export default MessageContent;
