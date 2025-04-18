import React from 'react';
import { Mic, Info } from 'lucide-react';
import { AIMessage } from '@/services/types/aiTypes';
import FilePreview from './FilePreview';
import MessageAudioPlayer from './MessageAudioPlayer';
import { cn } from '@/lib/utils';
import AIResponseCard from './AIResponseCard';
import { Button } from '../ui/button';
import { isValidJson, extractJsonFromText } from '@/util/formatters';

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

  // Check if content has JSON format - this might be unparsed but valid JSON
  const hasJsonContent = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for JSON markers in the content
    const hasJsonMarkers = 
      message.content.includes('```json') || 
      message.content.includes('\\\\json') ||
      message.content.trim().startsWith('{') ||
      message.content.includes('intent_analysis');
    
    // If it looks like JSON, actually validate it
    if (hasJsonMarkers) {
      // Try to extract JSON content
      const jsonContent = extractJsonFromText(message.content);
      return !!jsonContent; // Return true if valid JSON was extracted
    }
    
    return false;
  }, [message]);

  // Check if the content appears to be a structured AI message without being properly parsed
  const isUnparsedStructuredResponse = React.useMemo(() => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for intent analysis and execution plan markers in raw text
    return (
      message.content.includes("**Intent Analysis:**") && 
      (message.content.includes("**Execution Plan:**") || message.content.includes("**Response:**"))
    );
  }, [message]);

  const renderMessageContent = () => {
    // Handle voice messages
    if (message.isVoiceMessage) {
      // ... keep existing code (voice message handling)
    }
    
    // Handle AI responses
    if (message.sender === 'ai') {
      // Check if this is a structured response with valid metadata
      const hasValidStructuredData = message.metadata?.aiResponse && (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 ||
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );

      // For properly parsed structured data, use AIResponseCard with modal
      if (hasValidStructuredData) {
        const aiResponse = message.metadata.aiResponse;
        console.log("Rendering modal AIResponseCard with valid data");
        return (
          <AIResponseCard 
            content={aiResponse.response || message.content}
            intentAnalysis={aiResponse.intent_analysis}
            executionPlan={aiResponse.execution_plan}
            isModal={true}
          />
        );
      }
      
      // For raw content that appears to be valid JSON but wasn't parsed into metadata
      if (hasJsonContent) {
        console.log("Content appears to be JSON, attempting to parse and display");
        try {
          // Try to extract clean JSON
          const jsonContent = extractJsonFromText(message.content);
          
          if (jsonContent) {
            // Parse the JSON
            const parsedJson = JSON.parse(jsonContent);
            
            // Extract the response part if available
            const responseText = parsedJson.response || message.content;
            
            console.log("Successfully parsed JSON content, using AIResponseCard with parsed data");
            
            return (
              <AIResponseCard 
                content={responseText}
                intentAnalysis={parsedJson.intent_analysis || {}}
                executionPlan={parsedJson.execution_plan || undefined}
                isModal={true}
              />
            );
          }
        } catch (error) {
          console.error("Failed to parse JSON content:", error);
          // Fall through to raw display if parsing fails
        }
      }
      
      // For an unparsed but structured response, attempt to display it in a more structured way
      if (isUnparsedStructuredResponse) {
        // Extract response part if possible
        let displayContent = message.content;
        if (message.content.includes("**Response:**")) {
          const parts = message.content.split("**Response:**");
          if (parts.length > 1) {
            displayContent = parts[1].trim();
          }
        }
        
        return (
          <div className="space-y-3">
            <AIResponseCard 
              content={displayContent}
              isModal={true}
            />
            <div className="prose prose-invert max-w-none text-sm opacity-90">
              {displayContent}
            </div>
          </div>
        );
      }
      
      // If it looks like raw JSON but wasn't handled above, format it nicely
      if (message.content && (
          message.content.includes('```json') || 
          message.content.includes('\\\\json') ||
          message.content.trim().startsWith('{')
      )) {
        console.log("Displaying formatted raw JSON content");
        return (
          <div className="prose prose-invert max-w-none">
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[300px] p-2 bg-[#1A1F2C] rounded">
              {message.content}
            </pre>
          </div>
        );
      }
      
      // Otherwise, display the raw content
      return <div className="prose prose-invert max-w-none">{message.content}</div>;
    }
    
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
