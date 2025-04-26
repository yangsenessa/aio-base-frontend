import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { AIMessage, getInitialMessage, sendMessage, createDirectMessage } from '@/services/types/aiTypes';
import { AttachedFile } from '@/components/chat/ChatFileUploader';
import { toast } from '@/components/ui/use-toast';
import { AIOProtocolHandler } from '@/runtime/AIOProtocolHandler';
import { v4 as uuidv4 } from 'uuid';

// Add new interface for pending protocol data
interface PendingProtocolData {
  inputValue: any;
  operationKeywords: string[];
  executionPlan?: any;
  stepCount: number;
}

interface ChatContextType {
  message: string;
  setMessage: (message: string) => void;
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  handleSendMessage: (currentMessage: string, currentFiles: AttachedFile[]) => Promise<void>;
  addDirectMessage: (content: string, attachedFiles?: AttachedFile[]) => void;
  handleProtocolStep: (contextId: string, apiEndpoint: string) => Promise<void>;
  initProtocolContext: (inputValue: any, operationKeywords: string[], executionPlan?: any) => string | null;
  activeProtocolContextId: string | null;
  pendingProtocolData: PendingProtocolData | null;
  setPendingProtocolData: React.Dispatch<React.SetStateAction<PendingProtocolData | null>>;
  confirmAndRunProtocol: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper function to extract operation keywords from intent analysis
const extractOperationKeywords = (aiResponse: AIMessage): string[] => {
  try {
    // First, prioritize extraction from execution_plan if available
    if (aiResponse.metadata?.aiResponse?.execution_plan?.steps) {
      const steps = aiResponse.metadata.aiResponse.execution_plan.steps;
      if (Array.isArray(steps) && steps.length > 0) {
        console.log("[ChatContext] Extracting operations from execution_plan steps:", steps);
        
        // Map each step to its action or MCP + action
        return steps.map((step: any) => {
          // Preferred format: action if available
          if (step.action) {
            // If MCP is also available, combine them for more context
            return step.mcp ? `${step.mcp}:${step.action}` : step.action;
          }
          // Fallback to MCP if action isn't available
          return step.mcp || "process";
        });
      }
    }
    
    // Also check for execution_plan in raw content (might be in JSON format)
    if (aiResponse.content && aiResponse.content.includes("execution_plan")) {
      try {
        // First try to handle code block wrapped JSON
        let contentToParse = aiResponse.content;
        if (contentToParse.includes('```')) {
          // Remove code block markers and any language specifier
          const lines = contentToParse.split('\n');
          contentToParse = lines.filter(line => !line.trim().startsWith('```')).join('\n');
        }
        
        // Try to extract JSON from the content
        const jsonMatch = contentToParse.match(/\{[\s\S]*?\}/);
        console.log('[ChatContext] JSON match execution plan:', jsonMatch);
        
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          console.log('[ChatContext] Parsed JSON execution plan:', parsedJson);
          
          if (parsedJson.execution_plan?.steps && Array.isArray(parsedJson.execution_plan.steps)) {
            console.log("[ChatContext] Extracted execution_plan from content JSON");
            
            return parsedJson.execution_plan.steps.map((step: any) => {
              return step.action || step.mcp || "process";
            });
          }
        }
      } catch (error) {
        console.log("[ChatContext] Could not parse JSON from content:", error);
        // Continue to other extraction methods
      }
    }
    
    // If we couldn't extract from execution_plan, try to extract from intent_analysis
    if (aiResponse.content && aiResponse.content.includes("intent_analysis")) {
      try {
        let contentToParse = aiResponse.content;
        if (contentToParse.includes('```')) {
          const lines = contentToParse.split('\n');
          contentToParse = lines.filter(line => !line.trim().startsWith('```')).join('\n');
        }
        
        const jsonMatch = contentToParse.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          if (parsedJson.intent_analysis?.task_decomposition) {
            return parsedJson.intent_analysis.task_decomposition.map((task: any) => {
              return task.action || "process";
            });
          }
        }
      } catch (error) {
        console.log("[ChatContext] Could not parse intent_analysis from content:", error);
      }
    }
    
    // If all else fails, return a default operation
    return ["process"];
  } catch (error) {
    console.error("[ChatContext] Error extracting operation keywords:", error);
    return ["process"];
  }
};

// Helper function to check if a message is an intent analysis
const isIntentAnalysisMessage = (message: AIMessage): boolean => {
  if (message.sender !== 'ai') return false;
  
  // Check metadata
  if (message.metadata?.aiResponse?.intent_analysis) {
    return true;
  }
  
  // Check content
  if (message.content) {
    return (
      message.content.includes("Intent Analysis:") ||
      message.content.includes("intent_analysis") ||
      message.content.includes("Understanding your request") ||
      message.content.includes("request_understanding")
    );
  }
  
  return false;
};

// Helper function to extract a user-friendly response from intent analysis
const extractSummaryFromIntentAnalysis = (aiResponse: AIMessage): string => {
  try {
    // From metadata
    if (aiResponse.metadata?.aiResponse?.intent_analysis) {
      const intentAnalysis = aiResponse.metadata.aiResponse.intent_analysis;
      
      // Check for primary goal or request understanding
      if (intentAnalysis.request_understanding?.primary_goal) {
        return `I understand your goal is ${intentAnalysis.request_understanding.primary_goal}. How can I help?`;
      }
      
      if (intentAnalysis.primary_goal) {
        return `I understand your goal is ${intentAnalysis.primary_goal}. How can I help?`;
      }
      
      if (intentAnalysis.request_understanding) {
        return `I understand your request. How can I help?`;
      }
    }
    
    // Try to extract from content if it's JSON
    if (aiResponse.content && (aiResponse.content.includes('"intent_analysis"') || aiResponse.content.includes('"request_understanding"'))) {
      try {
        let content = aiResponse.content;
        
        // Extract from code blocks if present
        if (content.includes('```json')) {
          const parts = content.split('```json');
          if (parts.length > 1) {
            content = parts[1].split('```')[0].trim();
          }
        } else if (content.includes('```')) {
          const parts = content.split('```');
          if (parts.length > 1) {
            content = parts[1].trim();
          }
        }
        
        if (content.trim().startsWith('{')) {
          const parsedJson = JSON.parse(content);
          
          // Check various paths for user-friendly content
          if (parsedJson.response) {
            return parsedJson.response;
          }
          
          if (parsedJson.intent_analysis?.request_understanding?.primary_goal) {
            return `I understand your goal is ${parsedJson.intent_analysis.request_understanding.primary_goal}. How can I help?`;
          }
          
          if (parsedJson.intent_analysis?.primary_goal) {
            return `I understand your goal is ${parsedJson.intent_analysis.primary_goal}. How can I help?`;
          }
        }
      } catch (error) {
        console.log("[ChatContext] Error extracting from JSON content:", error);
      }
    }
    
    // Default fallback
    return aiResponse.content;
  } catch (error) {
    console.error("[ChatContext] Error extracting summary from intent analysis:", error);
    return aiResponse.content;
  }
};

// Enhance AI message with a user-friendly summary while preserving structured data
const enhanceAIMessageWithSummary = (aiResponse: AIMessage): AIMessage => {
  // Only process for intent analysis messages
  if (!isIntentAnalysisMessage(aiResponse)) {
    return aiResponse;
  }
  
  // Get the summary content
  const summaryContent = extractSummaryFromIntentAnalysis(aiResponse);
  
  // Create a copy with the summary as the visible content, preserving the original in metadata
  return {
    ...aiResponse,
    content: aiResponse.content, // Keep the original content for use in the modal
    _displayContent: summaryContent, // Add a property for display content (will be used by MessageContent)
  };
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([getInitialMessage()]);
  const [activeProtocolContextId, setActiveProtocolContextId] = useState<string | null>(null);
  const [pendingProtocolData, setPendingProtocolData] = useState<PendingProtocolData | null>(null);

  const handleSendMessage = async (
    currentMessage: string, 
    currentFiles: AttachedFile[]
  ): Promise<void> => {
    if (currentMessage.trim() === '' && currentFiles.length === 0) return;

    let messageContent = currentMessage.trim();
    
    if (currentFiles.length > 0) {
      const fileNames = currentFiles.map(file => file.name).join(', ');
      
      if (messageContent) {
        messageContent += `\n\nAttached files: ${fileNames}`;
      } else {
        messageContent = `[Attached files: ${fileNames}]`;
      }
    }

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachedFiles: currentFiles.length > 0 ? [...currentFiles] : undefined
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const aiResponse = await sendMessage(messageContent, currentFiles);
      console.log('[ChatContext] AI response:', aiResponse);
      
      // Check if this is an intent analysis message
      if (isIntentAnalysisMessage(aiResponse)) {
        console.log('[ChatContext] Detected intent analysis');
        
        // Get execution plan if available
        let executionPlan = aiResponse.metadata?.aiResponse?.execution_plan;
        console.log('[ChatContext] Execution plan:', executionPlan);
        
        // If not in metadata, try to extract from content
        if (!executionPlan && aiResponse.content && aiResponse.content.includes("execution_plan")) {
          try {
            console.log('[ChatContext] Extracting execution plan from content (handleSendMessage)');
            // Try to extract JSON from the content
            console.log('[ChatContext] Extracting execution plan from content');
            const jsonMatch = aiResponse.content.match(/\{[\s\S]*?\}/);
            console.log('[ChatContext] JSON match execution plan:', jsonMatch);
            if (jsonMatch) {
              const parsedJson = JSON.parse(jsonMatch[0]);
              console.log('[ChatContext] Parsed JSON execution plan:', parsedJson);
              if (parsedJson.execution_plan) {
                executionPlan = parsedJson.execution_plan;
                console.log('[ChatContext] Extracted execution_plan from content JSON');
              }
            }
          } catch (error) {
            console.log("[ChatContext] Could not parse JSON from content:", error);
          }
        }
        
        // Extract operation keywords, preferring execution_plan steps if available
        const operationKeywords = extractOperationKeywords(aiResponse);
        console.log('[ChatContext] Extracted operation keywords:', operationKeywords);
        
        // Store the protocol data for later confirmation
        if (operationKeywords.length > 0) {
          const newPendingData: PendingProtocolData = {
            inputValue: messageContent,
            operationKeywords,
            executionPlan,
            stepCount: operationKeywords.length
          };
          
          setPendingProtocolData(newPendingData);
          
          // Enhance the AI response with a user-friendly summary
          const enhancedResponse = enhanceAIMessageWithSummary(aiResponse);
          
          // Add the enhanced AI response to the chat
          setMessages((prev) => [...prev, enhancedResponse]);
          
          return;
        }
      }
      
      // For non-intent analysis messages, add them directly to the chat
      setMessages((prev) => [...prev, aiResponse]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive"
      });
    }
  };

  // Function to run the protocol after user confirmation
  const confirmAndRunProtocol = () => {
    if (!pendingProtocolData) {
      addDirectMessage("No pending protocol to run. Please send a request first.");
      return;
    }
    
    const { inputValue, operationKeywords, executionPlan } = pendingProtocolData;
    
    // Initialize protocol context with the stored data
    const contextId = initProtocolContext(inputValue, operationKeywords, executionPlan);
    
    if (contextId) {
      setActiveProtocolContextId(contextId);
      
      // Add a message to indicate protocol is starting
      addDirectMessage(`Protocol initialized with ${operationKeywords.length} steps. Starting execution...`);
      
      // Clear the pending protocol data since we're now executing it
      setPendingProtocolData(null);
    }
  };

  // Add a direct message from the system
  const addDirectMessage = (content: string, attachedFiles?: AttachedFile[]): void => {
    const directMessage = createDirectMessage(content, attachedFiles);
    setMessages((prev) => [...prev, directMessage]);
  };

  // Initialize a new AIO protocol context
  const initProtocolContext = (
    inputValue: any,
    operationKeywords: string[] = [],
    executionPlan?: any
  ): string | null => {
    try {
      const contextId = `aio-ctx-${Date.now()}`;
      const protocolHandler = AIOProtocolHandler.getInstance();
      
      // No need to extract execution plan as it should be passed as parameter
      const context = protocolHandler.init_calling_context(
        contextId,
        inputValue,
        operationKeywords,
        executionPlan
      );
      
      if (!context) {
        throw new Error("Failed to initialize protocol context");
      }
      
      console.log('[ChatContext] Initialized protocol context:', contextId, 'with operations:', operationKeywords);
      if (executionPlan) {
        console.log('[ChatContext] Using execution plan:', executionPlan);
      }
      
      return contextId;
    } catch (error) {
      console.error("Error initializing protocol context:", error);
      toast({
        title: "Protocol Error",
        description: "Failed to initialize AIO protocol context",
        variant: "destructive"
      });
      return null;
    }
  };

  // Handle a step in the AIO protocol
  const handleProtocolStep = async (
    contextId: string,
    apiEndpoint: string
  ): Promise<void> => {
    try {
      const protocolHandler = AIOProtocolHandler.getInstance();
      const context = protocolHandler.getContext(contextId);
      
      if (!context) {
        console.error("[ChatContext] Protocol context not found:", contextId);
        toast({
          title: "Protocol Error",
          description: "Protocol context not found",
          variant: "destructive"
        });
        throw new Error("Protocol context not found");
      }
      
      // Check if this is the last step in the sequence
      const isLastStep = context.curr_call_index === context.opr_keywd.length - 1;
      
      console.log(`[ChatContext] Executing protocol step ${context.curr_call_index + 1} of ${context.opr_keywd.length}`);
      
      // Execute the step
      const aiMessage = await protocolHandler.calling_step_by_step(
        contextId, 
        apiEndpoint,
        isLastStep // Mark as final response if it's the last step
      );
      
      // Verify the message is valid before proceeding
      if (!aiMessage) {
        const errorMsg = "No response message returned from protocol step";
        console.error(`[ChatContext] ${errorMsg}`);
        
        // Add error message to chat
        toast({
          title: "Protocol Error",
          description: `Error in step ${context.curr_call_index + 1}: ${errorMsg}`,
          variant: "destructive"
        });
        
        throw new Error(errorMsg);
      }
      
      console.log('[ChatContext] Adding protocol message:', aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("[ChatContext] Error handling protocol step:", error);
      
      // Add error message to chat if not already added
      if (error.message !== "Protocol context not found") {
        toast({
          title: "Protocol Error",
          description: `Error in protocol step: ${error.message}`,
          variant: "destructive"
        });
        
        // Ensure user sees the error in the chat too
        addDirectMessage(`Error in protocol step: ${error.message}`);
      }
      
      // Re-throw to allow the calling code to handle it
      throw error;
    }
  };

  return (
    <ChatContext.Provider 
      value={{ 
        message, 
        setMessage, 
        messages, 
        setMessages, 
        handleSendMessage,
        addDirectMessage,
        initProtocolContext,
        handleProtocolStep,
        activeProtocolContextId,
        pendingProtocolData,
        setPendingProtocolData,
        confirmAndRunProtocol
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    console.error('useChat must be used within a ChatProvider');
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}
