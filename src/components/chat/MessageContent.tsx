import React from 'react';
import { Mic } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';
import { 
  isValidJson, 
  extractJsonFromText, 
  processAIResponseContent,
  cleanJsonString,
  safeJsonParse,
  hasModalStructure,
  fixMalformedJson,
  getResponseFromModalJson
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
    
    // Check for JSON structure directly in the content
    if (message.content.trim().startsWith('{')) {
      const fixedContent = fixMalformedJson(message.content);
      const isValid = isValidJson(fixedContent);
      logCheckpoint('Raw JSON check result', { isValid });
      return isValid;
    }
    
    // Check for JSON in code blocks
    if (message.content.includes('```json') || message.content.includes('```')) {
      const cleanJson = cleanJsonString(message.content);
      const isValid = isValidJson(cleanJson);
      logCheckpoint('Code block JSON check result', { isValid });
      return isValid;
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
        const cleanJson = cleanJsonString(message.content);
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

  // Helper to extract structured data from content
  const extractStructuredData = (content: string) => {
    logCheckpoint('Extracting structured data');
    
    try {
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

  const renderMessageContent = () => {
    logCheckpoint('Rendering message content');
    
    // Handle voice messages
    if (message.isVoiceMessage) {
      logCheckpoint('Rendering voice message');
      return <span>🎤 {message.content}</span>;
    }
    
    // Handle AI responses
    if (message.sender === 'ai') {
      // Case 1: Properly structured response with metadata
      if (message.metadata?.aiResponse) {
        const aiResponse = message.metadata.aiResponse;
        const hasStructuredData = 
          Object.keys(aiResponse.intent_analysis || {}).length > 0 ||
          (aiResponse.execution_plan?.steps?.length > 0);
        
        if (hasStructuredData) {
          const responseText = aiResponse.response || message.content;
          logCheckpoint('Rendering structured AI response');
          
          return (
            <AIResponseCard 
              content={responseText}
              intentAnalysis={aiResponse.intent_analysis}
              executionPlan={aiResponse.execution_plan}
              isModal={false}
            />
          );
        }
      }
      
      // Case 2: Message looks structured but needs parsing
      if (isStructuredResponse || hasJsonContent) {
        logCheckpoint('Attempting to parse structured content');
        
        const structuredData = extractStructuredData(message.content);
        if (structuredData) {
          logCheckpoint('Successfully parsed structured content');
          
          return (
            <AIResponseCard 
              content={structuredData.content}
              intentAnalysis={structuredData.intentAnalysis}
              executionPlan={structuredData.executionPlan}
              isModal={false}
            />
          );
        }
      }
      
      // Case 3: Normal text response or fallback
      logCheckpoint('Rendering normal text response');
      const processedContent = processAIResponseContent(message.content);
      return <div className="prose prose-invert max-w-none">{processedContent}</div>;
    }
    
    // User messages
    logCheckpoint('Rendering user message');
    return message.content;
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
