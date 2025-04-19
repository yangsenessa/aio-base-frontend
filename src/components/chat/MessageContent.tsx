
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

interface MessageContentProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageContent = ({ message, onPlaybackChange }: MessageContentProps) => {
  // Debug logging for message structure
  React.useEffect(() => {
    if (message.sender === 'ai') {
      console.log("Message Content - Message ID:", message.id);
      console.log("Message type:", message.sender);
      console.log("Has metadata:", !!message.metadata);
      console.log("Has structured AI response:", !!message.metadata?.aiResponse);
      console.log("Content preview:", message.content?.substring(0, 100));
      
      if (message.metadata?.aiResponse) {
        console.log("Intent analysis keys:", Object.keys(message.metadata.aiResponse.intent_analysis || {}));
        console.log("Execution steps:", message.metadata.aiResponse.execution_plan?.steps?.length || 0);
      }
    }
  }, [message]);

  // Check if content has JSON format
  const hasJsonContent = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for JSON structure directly in the content
    if (message.content.trim().startsWith('{')) {
      // Apply JSON fixing before validation
      const fixedContent = fixMalformedJson(message.content);
      return isValidJson(fixedContent);
    }
    
    // Check for JSON in code blocks
    if (message.content.includes('```json') || message.content.includes('```')) {
      const cleanJson = cleanJsonString(message.content);
      return isValidJson(cleanJson);
    }
    
    // Check for JSON markers
    return message.content.includes('"intent_analysis"') || 
           message.content.includes('"execution_plan"') ||
           message.content.includes('"response"') ||
           message.content.includes('"request_understanding"');
    
  }, [message]);

  // Check if the content appears to be a structured AI message
  const isStructuredResponse = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for existing structured metadata first
    if (message.metadata?.aiResponse) {
      const aiResponse = message.metadata.aiResponse;
      return (
        Object.keys(aiResponse.intent_analysis || {}).length > 0 ||
        (aiResponse.execution_plan?.steps?.length > 0)
      );
    }
    
    // Check for raw JSON with AIO protocol structure
    if (message.content.trim().startsWith('{')) {
      try {
        const fixedJson = fixMalformedJson(message.content);
        const parsedJson = safeJsonParse(fixedJson);
        return parsedJson && hasModalStructure(parsedJson);
      } catch (error) {
        // If parsing fails, check for structural markers
        return (
          message.content.includes('"intent_analysis"') ||
          message.content.includes('"execution_plan"') ||
          message.content.includes('"response"') ||
          message.content.includes('"request_understanding"')
        );
      }
    }
    
    // For code blocks
    if (message.content.includes('```json') || message.content.includes('```')) {
      const cleanJson = cleanJsonString(message.content);
      try {
        const parsedJson = safeJsonParse(cleanJson);
        return parsedJson && hasModalStructure(parsedJson);
      } catch (error) {
        // Silent failure
      }
    }
    
    // For markdown formatted content
    return (
      message.content.includes("**Intent Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**")
    );
  }, [message]);

  // Helper to extract structured data from content
  const extractStructuredData = (content: string) => {
    try {
      // Fix malformed JSON first for all paths
      const fixedContent = fixMalformedJson(content);
      
      // For raw JSON content
      if (content.trim().startsWith('{')) {
        try {
          const parsedJson = safeJsonParse(fixedContent);
          
          if (parsedJson && hasModalStructure(parsedJson)) {
            // Extract just the response field for display
            const responseText = getResponseFromModalJson(parsedJson) || content;
            
            return {
              content: responseText,
              intentAnalysis: parsedJson.intent_analysis || {},
              executionPlan: parsedJson.execution_plan || null
            };
          }
        } catch (error) {
          console.warn("Failed to parse raw JSON content:", error);
        }
      }
      
      // For code blocks
      if (content.includes('```json') || content.includes('```')) {
        try {
          const cleanJson = cleanJsonString(content);
          const parsedJson = safeJsonParse(cleanJson);
          
          if (parsedJson && hasModalStructure(parsedJson)) {
            // Extract just the response field
            const responseText = getResponseFromModalJson(parsedJson) || content;
            
            return {
              content: responseText,
              intentAnalysis: parsedJson.intent_analysis || {},
              executionPlan: parsedJson.execution_plan || null
            };
          }
        } catch (error) {
          console.warn("Failed to parse code block JSON:", error);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Failed to extract structured data:", error);
      return null;
    }
  };

  const renderMessageContent = () => {
    // Handle voice messages
    if (message.isVoiceMessage) {
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
          // Use only the response field from the structured data
          const responseText = aiResponse.response || message.content;
          
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
      
      // Case 2: Message looks structured but needs parsing (JSON or code blocks)
      if (isStructuredResponse || hasJsonContent) {
        console.log("Found structured content, attempting to parse");
        
        const structuredData = extractStructuredData(message.content);
        if (structuredData) {
          console.log("Successfully parsed structured content for modal display");
          
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
      // Process the content to extract just the response if possible
      const processedContent = processAIResponseContent(message.content);
      return <div className="prose prose-invert max-w-none">{processedContent}</div>;
    }
    
    // User messages
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
