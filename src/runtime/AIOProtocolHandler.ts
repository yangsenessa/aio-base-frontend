import { AIMessage } from '@/services/types/aiTypes';
import { toast } from '@/components/ui/use-toast';

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
        dependencies
      };
    } catch (error) {
      console.error('[AIOProtocolHandler] Error getting step info:', error);
      return null;
    }
  }
  
  /**
   * Process the next step in the protocol calling sequence
   * @param contextId Unique identifier for the calling context
   * @param mcpResponse Response from MCP/LLM
   * @returns Result of the calling step
   */
  public async calling_next(
    contextId: string,
    mcpResponse: any
  ): Promise<AIOProtocolCallResult> {
    try {
      const context = this.contexts.get(contextId);
      
      if (!context) {
        console.error(`[AIOProtocolHandler] Context ${contextId} not found`);
        return { success: false, message: 'Context not found' };
      }
      
      // Update current value based on the MCP/LLM response
      context.curr_value = mcpResponse;
      
      // Increment the call index
      context.curr_call_index += 1;
      
      console.log(`[AIOProtocolHandler] Updated context ${contextId}`, context);
      
      return { 
        success: true, 
        message: 'Step processed successfully', 
        data: mcpResponse 
      };
    } catch (error) {
      console.error('[AIOProtocolHandler] Error in calling_next:', error);
      return { success: false, message: `Error processing step: ${error}` };
    }
  }
  
  /**
   * Execute the protocol calling step by step
   * @param contextId Unique identifier for the calling context
   * @param apiEndpoint The API endpoint to call
   * @param isFinalResponseOverride Optional flag to force marking as final response
   * @returns AI message that can be added to the chat
   */
  public async calling_step_by_step(
    contextId: string,
    apiEndpoint: string,
    isFinalResponseOverride?: boolean
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
      
      console.log(`[AIOProtocolHandler] Executing step ${context.curr_call_index} for context ${contextId}`);
      
      // Get current step info
      const stepInfo = this.getCurrentStepInfo(contextId);
      
      // Call the API endpoint with the current context
      let response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            context_id: contextId,
            curr_value: context.curr_value,
            operation: context.opr_keywd[context.curr_call_index] || '',
            call_index: context.curr_call_index,
            mcp: stepInfo?.mcp || '',
            input_schema: stepInfo?.inputSchema || {},
            dependencies: stepInfo?.dependencies || []
          })
        });
      
        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error('[AIOProtocolHandler] API fetch error:', fetchError);
        throw new Error(`API call failed: ${fetchError.message}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('[AIOProtocolHandler] Error parsing API response:', jsonError);
        throw new Error('Failed to parse API response');
      }
      
      if (!result || !result.data) {
        console.error('[AIOProtocolHandler] API returned invalid response:', result);
        throw new Error('API returned invalid or empty response');
      }
      
      // Update the context with the result
      await this.calling_next(contextId, result.data);
      
      // Determine if this is the final step in the sequence
      const isFinalStep = context.curr_call_index >= context.opr_keywd.length;
      
      // If this is the final step, set the output value
      if (isFinalStep) {
        context.output_value = context.curr_value;
      }
      
      // Check if this should be marked as the final response
      const isFinalResponse = isFinalResponseOverride || isFinalStep;
      
      // Create an AI message from the result
      const aiMessage: AIMessage = {
        id: `aio-protocol-${Date.now()}`,
        sender: 'ai',
        content: typeof result.data === 'string' 
          ? result.data 
          : JSON.stringify(result.data, null, 2),
        timestamp: new Date(),
        metadata: {
          protocolContext: {
            contextId,
            step: context.curr_call_index,
            isComplete: isFinalStep,
            operation: context.opr_keywd[context.curr_call_index - 1] || '',
            mcp: stepInfo?.mcp || '',
            isFinalResponse
          }
        }
      };
      
      return aiMessage;
    } catch (error) {
      console.error('[AIOProtocolHandler] Error in calling_step_by_step:', error);
      toast({
        title: "Protocol Error",
        description: `Error executing protocol step: ${error.message}`,
        variant: "destructive"
      });
      
      // Return null to indicate failure
      return null;
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