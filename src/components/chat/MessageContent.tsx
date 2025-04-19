import React from 'react';
import { Mic, Info, MessageCircle } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';
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
  extractJsonFromMarkdownSections
} from '@/util/formatters';  // Changed import to use formatters directly

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
        contentPreview: message.content?.substring(0, 100)
      });
      
      if (message.metadata?.aiResponse) {
        logCheckpoint('AI Response structure', {
          intentKeys: Object.keys(message.metadata.aiResponse.intent_analysis || {}),
          executionSteps: message.metadata.aiResponse.execution_plan?.steps?.length || 0
        });
      }
    }
  }, [message]);

  // Check if content has JSON format
  const hasJsonContent = React.useMemo(() => {
    logCheckpoint('Checking for JSON content');
    
    if (message.sender !== 'ai' || !message.content) {
      logCheckpoint('Not an AI message or no content');
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
  }, [message]);

  // Check if the content appears to be a structured AI message
  const isStructuredResponse = React.useMemo(() => {
    logCheckpoint('Checking for structured response');
    
    if (message.sender !== 'ai' || !message.content) {
      logCheckpoint('Not an AI message or no content');
      return false;
    }
    
    // Check for markdown structured format first
    if (
      message.content.includes("**Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**")
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
    
    // Check for raw JSON with AIO protocol structure
    if (message.content.trim().startsWith('{')) {
      try {
        const fixedJson = fixMalformedJson(message.content);
        const parsedJson = safeJsonParse(fixedJson);
        const hasStructure = parsedJson && hasModalStructure(parsedJson);
        logCheckpoint('Raw JSON structure check result', { hasStructure });
        return hasStructure;
      } catch (error) {
        logCheckpoint('Raw JSON parsing failed', { error });
        return false;
      }
    }
    
    // For code blocks
    if (message.content.includes('```json') || message.content.includes('```')) {
      try {
        const cleanJson = cleanJsonString(content);
        const parsedJson = safeJsonParse(cleanJson);
        const hasStructure = parsedJson && hasModalStructure(parsedJson);
        logCheckpoint('Code block structure check result', { hasStructure });
        return hasStructure;
      } catch (error) {
        logCheckpoint('Code block parsing failed', { error });
        return false;
      }
    }
    
    // For markdown formatted content
    const hasMarkdownStructure = message.content.includes("**Intent Analysis:**") || 
                               message.content.includes("**Execution Plan:**") || 
                               message.content.includes("**Response:**");
    logCheckpoint('Markdown structure check result', { hasMarkdownStructure });
    return hasMarkdownStructure;
  }, [message]);

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
      // First try to extract from markdown sections
      if (
        content.includes("**Analysis:**") || 
        content.includes("**Execution Plan:**") || 
        content.includes("**Response:**")
      ) {
        const structuredData = extractJsonFromMarkdownSections(content);
        if (structuredData) {
          logCheckpoint('Successfully extracted from markdown sections');
          return {
            content: structuredData.response || content,
            intentAnalysis: structuredData.intent_analysis || {},
            executionPlan: structuredData.execution_plan || null
          };
        }
      }
      
      const fixedContent = fixMalformedJson(content);
      
      // For raw JSON content
      if (content.trim().startsWith('{')) {
        try {
          const parsedJson = safeJsonParse(fixedContent);
          
          if (parsedJson && hasModalStructure(parsedJson)) {
            const responseText = getResponseFromModalJson(parsedJson) || content;
            logCheckpoint('Successfully extracted from raw JSON');
            
            return {
              content: responseText,
              intentAnalysis: parsedJson.intent_analysis || {},
              executionPlan: parsedJson.execution_plan || null
            };
          }
        } catch (error) {
          logCheckpoint('Failed to parse raw JSON content', { error });
        }
      }
      
      // For code blocks
      if (content.includes('```json') || content.includes('```')) {
        try {
          const cleanJson = cleanJsonString(content);
          const parsedJson = safeJsonParse(cleanJson);
          
          if (parsedJson && hasModalStructure(parsedJson)) {
            const responseText = getResponseFromModalJson(parsedJson) || content;
            logCheckpoint('Successfully extracted from code block');
            
            return {
              content: responseText,
              intentAnalysis: parsedJson.intent_analysis || {},
              executionPlan: parsedJson.execution_plan || null
            };
          }
        } catch (error) {
          logCheckpoint('Failed to parse code block JSON', { error });
        }
      }
      
      logCheckpoint('No structured data found');
      return null;
    } catch (error) {
      logCheckpoint('Failed to extract structured data', { error });
      return null;
    }
  };

  // Render structured AI response with both button and response content
  const renderStructuredResponse = () => {
    logCheckpoint('Rendering structured AI response');
    
    try {
      // Extract structured data and response content
      const structuredData = extractStructuredData(message.content);
      const responseContent = extractResponseContent(message.content);
      
      if (structuredData) {
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
                  content={message.content}
                  intentAnalysis={structuredData.intentAnalysis}
                  executionPlan={structuredData.executionPlan}
                  isModal={true}
                />
              </DialogContent>
            </Dialog>
            
            {/* Help Text */}
            <div className="text-center text-xs text-muted-foreground">
              Click to expand details
            </div>
            
            {/* Actual Response Content */}
            <div className="prose prose-invert max-w-none">
              {responseContent}
            </div>
          </div>
        );
      }
      
      // Fallback if no structured data found
      return (
        <div className="prose prose-invert max-w-none">
          {processAIResponseContent(message.content)}
        </div>
      );
    } catch (error) {
      console.error("Error rendering structured response:", error);
      // Ultimate fallback
      return (
        <div className="prose prose-invert max-w-none">
          {message.content || "Error displaying response"}
        </div>
      );
    }
  };

  const renderMessageContent = () => {
    logCheckpoint('Rendering message content');
    
    // Handle voice messages
    if (message.isVoiceMessage) {
      logCheckpoint('Rendering voice message');
      return <span>🎤 {message.content}</span>;
    }
    
    // Handle user messages
    if (message.sender === 'user') {
      logCheckpoint('Rendering user message');
      return message.content;
    }
    
    // Handle AI responses
    // Case 1: Properly structured response with metadata
    if (message.metadata?.aiResponse) {
      const aiResponse = message.metadata.aiResponse;
      const hasStructuredData = 
        Object.keys(aiResponse.intent_analysis || {}).length > 0 ||
        (aiResponse.execution_plan?.steps?.length > 0);
      
      if (hasStructuredData) {
        try {
          // Use the structured data for rendering both button and response
          return renderStructuredResponse();
        } catch (error) {
          console.error("Error rendering structured AI response:", error);
          // Fallback to plain text on error
          return <div className="prose prose-invert max-w-none">{message.content}</div>;
        }
      }
    }
    
    // Case 2: Message looks structured but needs parsing
    if (isStructuredResponse || hasJsonContent) {
      logCheckpoint('Attempting to parse structured content');
      
      try {
        return renderStructuredResponse();
      } catch (error) {
        console.error("Error processing structured content:", error);
        // Fallback to plain text on error
        return <div className="prose prose-invert max-w-none">{message.content}</div>;
      }
    }
    
    // Case 3: Normal text response or fallback
    try {
      logCheckpoint('Rendering normal text response');
      if (message.content.trim().length === 0) {
        // Safeguard against empty responses
        return <div className="prose prose-invert max-w-none">No response received.</div>;
      }
      const processedContent = processAIResponseContent(message.content);
      return <div className="prose prose-invert max-w-none">{processedContent}</div>;
    } catch (error) {
      console.error("Error processing AI response content:", error);
      // Fallback to original content on any error
      return <div className="prose prose-invert max-w-none">{message.content || "Error: Could not display response"}</div>;
    }
  };
  
  return (
    <>
      <div className={cn(
        "text-sm transition-all", 
        message.isVoiceMessage ? "italic" : ""
      )}>
        {renderMessageContent()}
      </div>
      
      {message.isVoiceMessage && (
        <div className="mt-2 animate-fade-in">
          <MessageAudioPlayer 
            messageId={message.id}
            audioProgress={message.audioProgress}
            isPlaying={message.isPlaying}
            onPlaybackChange={onPlaybackChange}
          />
        </div>
      )}
      
      {message.attachedFiles && message.attachedFiles.length > 0 && (
        <div className="mt-2 space-y-2 transition-all animate-fade-in">
          {message.attachedFiles.map(file => (
            <FilePreview 
              key={file.id} 
              file={file} 
              compact={true}
              inMessage={true}
            />
          ))}
        </div>
      )}
      
      {/* Referenced files section */}
      {message.sender === 'ai' && message.referencedFiles && message.referencedFiles.length > 0 && (
        <div className="mt-4 space-y-3 pt-2 border-t border-white/10 animate-fade-in">
          <div className="text-xs opacity-70">Files referenced:</div>
          <div className="grid grid-cols-1 gap-2">
            {message.referencedFiles.map(file => (
              <FilePreview 
                key={file.id} 
                file={file} 
                inAIResponse={true}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs opacity-70 mt-1 transition-opacity">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </>
  );
};

export default MessageContent;
