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
  extractResponseFromRawJson
} from '@/util/formatters';  // Added missing imports

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

  // Check if content has JSON format
  const hasJsonContent = React.useMemo(() => {
    // Skip for protocol messages
    if (isProtocolMessage) return false;
    
    logCheckpoint('Checking for JSON content');
    
    if (message.sender !== 'ai' || !message.content) {
      logCheckpoint('Not an AI message or no content');
      return false;
    }
    
    // Early return for plain text - if content doesn't contain any JSON indicators
    // and doesn't contain code blocks, treat as plain text
    if (!message.content.includes('{') && 
        !message.content.includes('"intent_analysis"') && 
        !message.content.includes('"execution_plan"') &&
        !message.content.includes('```')) {
      logCheckpoint('Plain text content detected, bypassing JSON formatting');
      return false;
    }
    
    // Check for markdown structured format
    if (
      message.content.includes("**Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**")
    ) {
      logCheckpoint('Markdown structured format detected');
      return true;
    }
    
    // Check for JSON structure directly in the content
    if (message.content.trim().startsWith('{')) {
      try {
        const fixedContent = fixMalformedJson(message.content);
        const isValid = isValidJson(fixedContent);
        logCheckpoint('Raw JSON check result', { isValid });
        return isValid;
      } catch (error) {
        console.error("Error checking for JSON content:", error);
        return false;
      }
    }
    
    // Check for JSON in code blocks
    if (message.content.includes('```json') || message.content.includes('```')) {
      try {
        const cleanJson = cleanJsonString(message.content);
        const isValid = isValidJson(cleanJson);
        logCheckpoint('Code block JSON check result', { isValid });
        return isValid;
      } catch (error) {
        console.error("Error checking for JSON in code blocks:", error);
        return false;
      }
    }
    
    // Check for JSON markers
    const hasMarkers = message.content.includes('"intent_analysis"') || 
                      message.content.includes('"execution_plan"') ||
                      message.content.includes('"response"') ||
                      message.content.includes('"requestUnderstanding"') ||
                      message.content.includes('"modalityAnalysis"') ||
                      message.content.includes('"capabilityMapping"');
    logCheckpoint('JSON markers check result', { hasMarkers });
    return hasMarkers;
  }, [message, isProtocolMessage]);

  // Check if the content appears to be a structured AI message
  const isStructuredResponse = React.useMemo(() => {
    // Skip for protocol messages
    if (isProtocolMessage) return false;
    
    logCheckpoint('Checking for structured response');
    
    if (message.sender !== 'ai' || !message.content) {
      logCheckpoint('Not an AI message or no content');
      return false;
    }
    
    // Early return for plain text with URLs or download links
    if ((message.content.includes('http://') || message.content.includes('https://')) &&
        !message.content.includes('{') && 
        !message.content.includes('```')) {
      logCheckpoint('URL content detected, bypassing structured formatting');
      return false;
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

  // Extract the response content from structured data
  const extractResponseContent = (content: string): string => {
    logCheckpoint('Extracting response content');
    
    try {
      // First check for markdown response section
      if (content.includes("**Response:**")) {
        const parts = content.split("**Response:**");
        if (parts.length > 1) {
          return parts[1].trim();
        }
      }
      
      // Try to extract from JSON structure
      let jsonContent: any = null;
      
      // For raw JSON
      if (content.trim().startsWith('{')) {
        try {
          const fixedJson = fixMalformedJson(content);
          jsonContent = safeJsonParse(fixedJson);
        } catch (error) {
          logCheckpoint('Failed to parse raw JSON', { error });
        }
      }
      
      // For code blocks
      if (!jsonContent && (content.includes('```json') || content.includes('```'))) {
        try {
          const cleanJson = cleanJsonString(content);
          jsonContent = safeJsonParse(cleanJson);
        } catch (error) {
          logCheckpoint('Failed to parse code block JSON', { error });
        }
      }
      
      // Extract response from JSON content
      if (jsonContent) {
        if (jsonContent.response) {
          return jsonContent.response;
        }
        return getResponseFromModalJson(jsonContent) || "";
      }
      
      // Fallback to the original content
      return content;
    } catch (error) {
      logCheckpoint('Error extracting response content', { error });
      return content;
    }
  };

  // Helper to extract structured data from content
  const extractStructuredData = (content: string) => {
    logCheckpoint('Extracting structured data');
    
    try {
      // First try extraction via markdown sections
      if (
        content.includes("**Analysis:**") || 
        content.includes("**Execution Plan:**") || 
        content.includes("**Response:**") ||
        content.includes("Intent Analysis:") || 
        content.includes("Execution Steps:")
      ) {
        const parsed = extractJsonFromMarkdownSections(content);
        if (parsed) {
          logCheckpoint('Successfully extracted data from markdown sections');
          return {
            intentAnalysis: parsed.intent_analysis || {},
            executionPlan: parsed.execution_plan || {}
          };
        }
      }
      
      // Direct attempt to parse complete JSON when content looks like valid JSON
      if (content.trim().startsWith('{') && 
          content.includes('"intent_analysis"') && 
          content.includes('"execution_plan"')) {
        try {
          const cleanedJson = fixMalformedJson(content);
          const parsedJson = safeJsonParse(cleanedJson);
          
          if (parsedJson && (parsedJson.intent_analysis || parsedJson.execution_plan)) {
            logCheckpoint('Successfully parsed complete JSON structure');
            return {
              intentAnalysis: parsedJson.intent_analysis || {},
              executionPlan: parsedJson.execution_plan || {}
            };
          }
        } catch (error) {
          logCheckpoint('Error parsing complete JSON structure', { error });
          // Continue to other extraction methods
        }
      }
      
      // Then try extraction from JSON content with better error handling
      let jsonText = null;
      let cleanedJson = null;
      
      // Extract from code blocks
      if (content.includes('```json') || content.includes('```')) {
        jsonText = cleanJsonString(content);
      } 
      // Extract from raw JSON
      else if (content.trim().startsWith('{')) {
        jsonText = content;
      }
      
      if (jsonText) {
        // Apply multiple JSON fixing techniques
        cleanedJson = fixMalformedJson(jsonText);
        
        if (!isValidJson(cleanedJson)) {
          // If still invalid, try more aggressive fixing
          cleanedJson = aggressiveBackslashFix(cleanedJson);
        }
        
        // Parse with safe method
        const jsonContent = safeJsonParse(cleanedJson);
        
        if (jsonContent) {
          logCheckpoint('Successfully parsed JSON content', { 
            keys: Object.keys(jsonContent) 
          });
          
          // Extract intent analysis with flexible path detection
          const intentAnalysis = 
            jsonContent.intent_analysis || 
            jsonContent.intent_detector ||
            jsonContent.request_understanding || 
            jsonContent.requestUnderstanding ||
            {};
          
          // Extract execution plan with flexible path detection
          const executionPlan = 
            jsonContent.execution_plan || 
            jsonContent.executionPlan || 
            jsonContent.execution_steps || 
            jsonContent.executionSteps ||
            {};
          
          return { intentAnalysis, executionPlan };
        }
      }
      
      // Try extracting JSON directly from text as a last resort
      const extractedJson = extractJsonFromText(content);
      if (extractedJson) {
        const parsedJson = safeJsonParse(extractedJson);
        if (parsedJson) {
          logCheckpoint('Successfully extracted JSON from text content');
          
          return {
            intentAnalysis: parsedJson.intent_analysis || parsedJson.request_understanding || {},
            executionPlan: parsedJson.execution_plan || {}
          };
        }
      }
      
      logCheckpoint('No structured data found after all attempts');
      return null;
    } catch (error) {
      logCheckpoint('Error extracting structured data', { error });
      return null;
    }
  };

  // Render structured AI response with both button and response content
  const renderStructuredResponse = () => {
    logCheckpoint('Rendering structured AI response');
    
    try {
      // Use raw JSON content for analysis if available
      const contentForAnalysis = message._rawJsonContent || message.content;
      
      // Extract structured data with improved JSON handling
      const structuredData = extractStructuredData(contentForAnalysis);
      
      // Use _displayContent field if available, otherwise extract from content
      let responseContent = message._displayContent;
      
      // Direct extraction of response field from clean JSON
      if (!responseContent && contentForAnalysis.trim().startsWith('{') && 
          contentForAnalysis.includes('"response"')) {
        try {
          const cleaned = fixMalformedJson(contentForAnalysis);
          const parsed = safeJsonParse(cleaned);
          if (parsed && parsed.response) {
            logCheckpoint('Directly extracted response field from JSON');
            responseContent = parsed.response;
          }
        } catch (error) {
          logCheckpoint('Error extracting response directly', { error });
        }
      }
      
      // If that doesn't work, try specialized extraction for raw JSON with response field
      if (!responseContent) {
        responseContent = extractResponseFromRawJson(message.content);
      }
      
      // If that doesn't work, try direct extraction
      if (!responseContent) {
        responseContent = extractResponseContent(message.content);
      }
      
      // If that fails, try using responseFormatter utilities
      if (!responseContent || responseContent === message.content) {
        responseContent = extractResponseFromJson(message.content);
      }
      
      // If still no response, try direct modal extraction
      if (!responseContent && structuredData) {
        const jsonContent = safeJsonParse(fixMalformedJson(contentForAnalysis));
        if (jsonContent) {
          responseContent = getResponseFromModalJson(jsonContent);
        }
      }
      
      // Final fallback 
      if (!responseContent) {
        responseContent = "I've analyzed your request. How can I help you further?";
      }
      
      return (
        <div className="space-y-4">
          {/* Analysis Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-left justify-start">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-primary" />
                  <span>View AI Analysis</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[600px] p-0 bg-transparent border-none" 
              aria-description="AI Analysis Details"
            >
              <AIResponseCard 
                content={contentForAnalysis}
                intentAnalysis={structuredData?.intentAnalysis}
                executionPlan={structuredData?.executionPlan}
                isModal={true}
              />
            </DialogContent>
          </Dialog>
          
          {/* Help Text */}
          <div className="text-center text-xs text-muted-foreground">
            Click to expand details
          </div>
          
          {/* Actual Response Content */}
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {responseContent}
          </div>
        </div>
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
    
    // Check if this is a message with JSON content that should show analysis button
    const shouldShowAnalysisButton = 
      message.sender === 'ai' && 
      (message._rawJsonContent || isStructuredResponse || hasJsonContent);
      
    if (shouldShowAnalysisButton) {
      logCheckpoint('Rendering message with analysis button');
      return renderStructuredResponse();
    }
    
    // Extract response value from JSON for raw JSON messages
    // This is for cases where the JSON extraction in MessageBubble wasn't sufficient
    if (message.sender === 'ai' && 
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
    if (message.sender === 'ai' && isPlainTextWithUrls) {
      logCheckpoint('Rendering plain text with URLs');
      return (
        <div className="whitespace-pre-wrap break-words">
          {message._displayContent || message.content}
        </div>
      );
    }
    
    // For standard plain text without complex structure or formatting
    const isSimplePlainText = message.sender === 'ai' && 
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
        {message._displayContent || message.content}
      </div>
    );
  };
  
  // Render the content
  return renderMessageContent();
};

export default MessageContent;
