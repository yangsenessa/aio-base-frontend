import { AIMessage } from '@/services/types/aiTypes';
import { toast } from '@/components/ui/use-toast';
import { exec_step } from './AIOProtocalExecutor';

// Protocol calling context
export interface AIOProtocolCallingContext {
  input_value: any; // Initial input value (string, blob, base64, url, json)
  curr_value: any; // Current value after processing
  output_value: any; // Final output value
  opr_keywd: string[]; // Operation keywords
  curr_call_index: number; // Current step in the calling sequence
  step_schemas?: Record<string, any>; // Input schemas for each step (optional)
  step_mcps?: string[]; // MCP for each step (optional)
  execution_plan?: any; // Original execution plan (optional)
  // New tracing fields
  trace_logs?: ProtocolTraceLog[]; // Array of trace logs for each step
  last_trace_time?: number; // Timestamp of the last trace
}

// New interface for trace logs
export interface ProtocolTraceLog {
  trace_id: string;
  calls: ProtocolTraceCall[];
}

export interface ProtocolTraceCall {
  id: number;
  protocol: string;
  agent: string;
  type: 'stdio' | 'mcp';
  method: string;
  input: {
    type: string;
    value: any;
  };
  output: {
    type: string;
    value: any;
  };
  status: 'ok' | 'error';
  error_message?: string;
}

// Result type for protocol calls
export interface AIOProtocolCallResult {
  success: boolean;
  message?: string;
  data?: any;
}

// Step information for protocol calling
export interface AIOProtocolStepInfo {
  mcp?: string;
  action?: string;
  inputSchema?: any;
  dependencies?: string[];
  stepIndex?: number; // Add step index for tracing
}

export class AIOProtocolHandler {
  private static instance: AIOProtocolHandler;
  private contexts: Map<string, AIOProtocolCallingContext> = new Map();
  
  private constructor() {}
  
  public static getInstance(): AIOProtocolHandler {
    if (!AIOProtocolHandler.instance) {
      AIOProtocolHandler.instance = new AIOProtocolHandler();
    }
    return AIOProtocolHandler.instance;
  }
  
  /**
   * Initialize a calling context for the protocol
   * @param contextId Unique identifier for this calling context
   * @param inputValue Initial input value
   * @param operationKeywords Array of operation keywords
   * @param executionPlan Optional execution plan from LLM
   * @returns The context object or null if initialization failed
   */
  public init_calling_context(
    contextId: string,
    inputValue: any,
    operationKeywords: string[] = [],
    executionPlan?: any
  ): AIOProtocolCallingContext | null {
    try {
      // Extract step schemas and MCPs from execution plan if available
      const stepSchemas: Record<string, any> = {};
      const stepMcps: string[] = [];
      
      if (executionPlan?.steps && Array.isArray(executionPlan.steps)) {
        executionPlan.steps.forEach((step: any, index: number) => {
          if (step.inputSchema) {
            stepSchemas[index.toString()] = step.inputSchema;
          }
          if (step.mcp) {
            stepMcps[index] = step.mcp;
          }
        });
        
        console.log(`[AIOProtocolHandler] Extracted schemas and MCPs from execution plan:`, 
          { stepSchemas, stepMcps }
        );
      }
      
      // Create a new context with the input value
      const context: AIOProtocolCallingContext = {
        input_value: inputValue,
        curr_value: inputValue, // Initially, current value is the same as input
        output_value: null,
        opr_keywd: operationKeywords,
        curr_call_index: 0,
        step_schemas: Object.keys(stepSchemas).length > 0 ? stepSchemas : undefined,
        step_mcps: stepMcps.length > 0 ? stepMcps : undefined,
        execution_plan: executionPlan
      };
      
      // Store the context
      this.contexts.set(contextId, context);
      console.log(`[AIOProtocolHandler] Initialized context ${contextId}`, context);
      
      return context;
    } catch (error) {
      console.error('[AIOProtocolHandler] Error initializing context:', error);
      return null;
    }
  }
  
  /**
   * Get information about the current step in the protocol
   * @param contextId Unique identifier for the calling context
   * @returns Information about the current step or null if not found
   */
  public getCurrentStepInfo(contextId: string): AIOProtocolStepInfo | null {
    try {
      const context = this.contexts.get(contextId);
      
      if (!context) {
        console.error(`[AIOProtocolHandler] Context ${contextId} not found`);
        return null;
      }
      
      const currentIndex = context.curr_call_index;
      
      // Get the current operation keyword
      const action = context.opr_keywd[currentIndex];
      
      // Check if we have a schema for this step
      const inputSchema = context.step_schemas?.[currentIndex.toString()];
      
      // Check if we have an MCP for this step
      const mcp = context.step_mcps?.[currentIndex];
      
      // Get dependencies from execution plan if available
      let dependencies: string[] | undefined;
      if (context.execution_plan?.steps?.[currentIndex]?.dependencies) {
        dependencies = context.execution_plan.steps[currentIndex].dependencies;
      }
      
      return {
        action,
        inputSchema,
        mcp,
        dependencies,
        stepIndex: currentIndex
      };
    } catch (error) {
      console.error('[AIOProtocolHandler] Error getting step info:', error);
      return null;
    }
  }
  
  /**
   * Process the next step in the protocol calling sequence
   * @param contextId Unique identifier for the calling context
   * @param apiEndpoint The API endpoint to call
   * @param addDirectMessage Optional function to send status messages to the chatbox
   * @returns Result of the calling step
   */
  public async calling_next(
    contextId: string,
    apiEndpoint: string,
    addDirectMessage?: (content: string) => void
  ): Promise<AIOProtocolCallResult> {
    try {
      const context = this.contexts.get(contextId);
      
      if (!context) {
        console.error(`[AIOProtocolHandler] Context ${contextId} not found`);
        return { success: false, message: 'Context not found' };
      }

      const currentStep = context.curr_call_index + 1;
      const totalSteps = Math.max(
        context.step_mcps?.length || 0,
        context.step_schemas ? Object.keys(context.step_schemas).length : 0
      );

      // Get current step info
      const stepInfo = this.getCurrentStepInfo(contextId);
      
      // Send step start message to chatbox
      if (addDirectMessage) {
        addDirectMessage(`Executing step ${currentStep}/${totalSteps}: ${stepInfo?.action || 'Processing'}...`);
      }

      // Execute the step using the executor
      const result = await exec_step(
        apiEndpoint,
        contextId,
        context.curr_value,
        context.opr_keywd[context.curr_call_index] || '',
        context.curr_call_index,
        stepInfo || {}
      );

      if (!result.success) {
        throw new Error(result.error || 'Step execution failed');
      }

      // Update the context with the result
      context.curr_value = result.data;
      context.curr_call_index += 1;

      // Send step completion message to chatbox
      if (addDirectMessage) {
        addDirectMessage(`Step ${currentStep}/${totalSteps} completed successfully.`);
      }

      return { 
        success: true, 
        message: 'Step processed successfully', 
        data: result.data 
      };
    } catch (error) {
      console.error('[AIOProtocolHandler] Error in calling_next:', error);
      return { 
        success: false, 
        message: `Error processing step: ${error.message}` 
      };
    }
  }
  
  /**
   * Execute the protocol calling step by step
   * @param contextId Unique identifier for the calling context
   * @param apiEndpoint The API endpoint to call
   * @param isFinalResponseOverride Optional flag to force marking as final response
   * @param addDirectMessage Optional function to send status messages to the chatbox
   * @returns AI message that can be added to the chat
   */
  public async calling_step_by_step(
    contextId: string,
    apiEndpoint: string,
    isFinalResponseOverride?: boolean,
    addDirectMessage?: (content: string) => void
  ): Promise<AIMessage | null> {
    try {
      const context = this.contexts.get(contextId);
      
      if (!context) {
        console.error(`[AIOProtocolHandler] Context ${contextId} not found`);
        toast({
          title: "Protocol Error",
          description: "Calling context not found",
          variant: "destructive"
        });
        return null;
      }

      // Get the total number of steps
      const totalSteps = Math.max(
        context.step_mcps?.length || 0,
        context.step_schemas ? Object.keys(context.step_schemas).length : 0
      );

      if (totalSteps === 0) {
        console.error(`[AIOProtocolHandler] No steps defined for context ${contextId}`);
        toast({
          title: "Protocol Error",
          description: "No steps defined in the protocol",
          variant: "destructive"
        });
        return null;
      }

      // Reset current call index to start from the beginning
      context.curr_call_index = 0;
      let finalResult = null;

      // Send initial status message to chatbox
      if (addDirectMessage) {
        addDirectMessage(`Starting protocol execution with ${totalSteps} steps...`);
      }

      // Execute all steps in sequence
      while (context.curr_call_index < totalSteps) {
        const result = await this.calling_next(contextId, apiEndpoint, addDirectMessage);
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        finalResult = result.data;
      }

      // Set the final output value
      context.output_value = finalResult;
      
      // Send completion message to chatbox
      if (addDirectMessage) {
        addDirectMessage(`Protocol execution completed successfully. All ${totalSteps} steps have been processed.`);
      }
      
      // Create final result message
      const finalMessage: AIMessage = {
        id: `aio-protocol-result-${Date.now()}`,
        sender: 'mcp',
        content: typeof finalResult === 'string' 
          ? finalResult 
          : JSON.stringify(finalResult, null, 2),
        timestamp: new Date(),
        protocolContext: {
          contextId,
          step: totalSteps,
          isComplete: true,
          operation: context.opr_keywd[context.curr_call_index - 1] || '',
          mcp: context.step_mcps?.[context.curr_call_index - 1] || '',
          isFinalResponse: true,
          totalSteps
        }
      };
      
      return finalMessage;
    } catch (error) {
      console.error('[AIOProtocolHandler] Error in calling_step_by_step:', error);
      toast({
        title: "Protocol Error",
        description: `Error executing protocol step: ${error.message}`,
        variant: "destructive"
      });
      
      if (addDirectMessage) {
        addDirectMessage(`Error executing protocol: ${error.message}`);
      }
      
      return {
        id: `aio-protocol-error-${Date.now()}`,
        sender: 'ai',
        content: `Error executing protocol: ${error.message}`,
        timestamp: new Date(),
        protocolContext: {
          contextId,
          step: this.contexts.get(contextId)?.curr_call_index || 0,
          isComplete: false,
          operation: this.contexts.get(contextId)?.opr_keywd[this.contexts.get(contextId)?.curr_call_index || 0] || '',
          mcp: this.contexts.get(contextId)?.step_mcps?.[this.contexts.get(contextId)?.curr_call_index || 0] || '',
          isFinalResponse: true,
          totalSteps: this.contexts.get(contextId)?.step_mcps?.length || 0
        }
      };
    }
  }
  
  /**
   * Get a specific context
   * @param contextId Unique identifier for the calling context
   * @returns The context object or null if not found
   */
  public getContext(contextId: string): AIOProtocolCallingContext | null {
    return this.contexts.get(contextId) || null;
  }
  
  /**
   * Delete a context when it's no longer needed
   * @param contextId Unique identifier for the calling context
   */
  public deleteContext(contextId: string): boolean {
    return this.contexts.delete(contextId);
  }
} 