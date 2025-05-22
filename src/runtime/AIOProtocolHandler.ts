import { AIMessage } from '@/services/types/aiTypes';
import { toast } from '@/components/ui/use-toast';
import { exec_step } from './AIOProtocalExecutor';
import { extractStepKeywordsByExecution, getAIOIndexByMcpId, getMethodByName } from './AIOProtocalAdapoter';
import { extractJsonResponseToList, extractJsonResponseToValueString } from '../util/json/responseFormatter';
import { getAllInnerKeywords, fetchMcpAndMethodName } from '@/services/can/mcpOperations';
import { mapRealtimeStepKeywords } from '@/services/aiAgentService';

export interface AIOProtocolValueType {
  key: "start" | "prompts" | "result";
  type: "string" | "json" | "blob" | "base64" | "url";
  value: any;
}

// 添加类型判断辅助函数
function getValueType(value: any): "string" | "json" | "blob" | "base64" | "url" {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/') || value.startsWith('data:audio/')) {
      return 'blob';
    }
    if (value.startsWith('data:')) {
      return 'base64';
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'url';
    }
    return 'string';
  }
  return 'json';
}

// Protocol calling context
export interface AIOProtocolCallingContext {
  input_value: any; // Initial input value (string, blob, base64, url, json)
  curr_value: AIOProtocolValueType[]; // Current value after processing
  output_value: any; // Final output value
  opr_keywd: string[]; // Operation keywords
  curr_call_index: number; // Current step in the calling sequence
  step_schemas?: Record<string, any>; // Input schemas for each step (key is methodName)
  step_mcps?: string[]; // MCP for each step (optional)
  execution_plan?: any; // Original execution plan (optional)
  method_index_map?: Record<string, number>; // Maps method names to their step indices
  // New tracing fields
  trace_logs?: ProtocolTraceLog[]; // Array of trace logs for each step
  last_trace_time?: number; // Timestamp of the last trace
  factor_identity?: string; // Factor identity
  status?: string; // Status of the protocol: init, running, finish, error
  error?: {
    message: string;
    code: string;
    details: string;
  };
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
  inputSchema?: any;  // Keep internal protocol using inputSchema
  dependencies?: string[];
  stepIndex?: number;
}

// Add helper function to truncate long data in logs
function truncateLogData(data: any, maxLength: number = 20): string {
  if (typeof data === 'string') {
    return data.length > maxLength ? `${data.substring(0, maxLength)}...` : data;
  }
  if (typeof data === 'object') {
    try {
      const str = JSON.stringify(data);
      return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
    } catch {
      return '[Complex Object]';
    }
  }
  return String(data);
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
  public async init_calling_context(
    contextId: string,
    inputValue: any,
    rawContent: string,
    operationKeywords: string[] | any = [],
    executionPlan?: any
  ): Promise<AIOProtocolCallingContext | null> {
    console.log('[AIOProtocolHandler] Initializing calling contextid:', contextId);
    console.log('[AIOProtocolHandler] Input value:', truncateLogData(inputValue));
    console.log('[AIOProtocolHandler] Operation keywords:', operationKeywords);
    console.log('[AIOProtocolHandler] Execution plan:', executionPlan);
    try {
      // Extract step schemas and MCPs from execution plan if available
      const stepSchemas: Record<string, any> = {};
      const stepMcps: string[] = [];
      const methodIndexMap: Record<string, number> = {};
      let realtimeStepKeywords: string[][] = []; 
      // Extract step keywords from execution plan
      let stepKeywords: { step: number; keywords: string[] }[] = [];
      let candidateKeywords: string[] = [];
      let validOperationKeywords: string[] = [];

      // Handle operation keywords if it's an object with steps
      if (operationKeywords && typeof operationKeywords === 'object') {
        if (Array.isArray(operationKeywords)) {
          validOperationKeywords = operationKeywords;
        } else if (operationKeywords.steps && Array.isArray(operationKeywords.steps)) {
          validOperationKeywords = operationKeywords.steps.map((step: any) => {
            return step.mcp ? `${step.mcp}:${step.action}` : step.action;
          });
        }
      }

      if (executionPlan) {
        try {
          // Extract step keywords from execution plan
          stepKeywords = extractStepKeywordsByExecution(rawContent);
          candidateKeywords = await getAllInnerKeywords();
          
          // Map intent steps to MCP keywords in realtime
          console.log('[AIOProtocolHandler] inputValue:', inputValue);
          console.log('[AIOProtocolHandler] stepKeywords:', stepKeywords);
          console.log('[AIOProtocolHandler] candidate keywords:', candidateKeywords);
          const mappedKeywordsJson = await mapRealtimeStepKeywords(inputValue, stepKeywords, candidateKeywords);
          console.log('[AIOProtocolHandler] Mapped keywords JSON:', mappedKeywordsJson);
          
          try {
            // Parse the returned JSON string into an array of arrays
            const mappedKeywords = JSON.parse(mappedKeywordsJson);
            
            // Adapt the mapped keywords into realtimeStepKeywords
            if (Array.isArray(mappedKeywords)) {
              realtimeStepKeywords = mappedKeywords;
              console.log('[AIOProtocolHandler] Realtime step keywords:', realtimeStepKeywords);
            } else {
              console.warn('[AIOProtocolHandler] Mapped keywords is not an array:', mappedKeywords);
            }
          } catch (parseError) {
            console.error('[AIOProtocolHandler] Error parsing mapped keywords JSON:', parseError);
          }
        } catch (error) {
          console.error('[AIOProtocolHandler] Error extracting step keywords:', error);
        }
      }

      // Process each step to get schemas from AIO index
      if (executionPlan?.steps && Array.isArray(executionPlan.steps)) {
        for (let i = 0; i < executionPlan.steps.length; i++) {
          const currStepKeywords = realtimeStepKeywords[i] || [];
          if (stepKeywords) {
            console.log(`[AIOProtocolHandler] Step ${i} pre-keywords:`, stepKeywords);
            console.log(`[AIOProtocolHandler] Step ${i} realtime keywords:`, currStepKeywords);
          }

          const step = executionPlan.steps[i];
         
          // Try to get MCP and Method information for each keyword of the current step
          for (const currKeyword of currStepKeywords) {
            console.log(`[AIOProtocolHandler] Processing keyword: ${currKeyword}`);
            const {mcpName, methodName} = await fetchMcpAndMethodNames([currKeyword]);

            if (mcpName && methodName) {
              try {
                // Fetch AIO index for this MCP
                const aioIndex = await getAIOIndexByMcpId(mcpName);
                
                if (aioIndex) {
                  // Get the method details from AIO index
                  const method = getMethodByName(aioIndex, methodName);
                  
                  if (method) {
                    // Store the input schema using method name as key
                    stepMcps[i] = mcpName;
                    stepSchemas[methodName] = {
                      ...method.input_schema,
                      dependencies: step.dependencies // Add dependencies from execution plan
                    };
                    
                    // 检查是否已经存在相同的methodName
                    if (methodIndexMap[methodName] !== undefined) {
                      console.log(`[AIOProtocolHandler] Method ${methodName} already exists at index ${methodIndexMap[methodName]}, skipping...`);
                    } else {
                      methodIndexMap[methodName] = i;
                      console.log(`[AIOProtocolHandler] Setting method index map for ${methodName} to ${i}`);
                      console.log(`[AIOProtocolHandler] Current method index map:`, methodIndexMap);
                    }
                    
                    console.log(`[AIOProtocolHandler] Found schema for method ${methodName}:`, method.input_schema);
                    
                    // Adapt the operation keyword format if needed
                    if (operationKeywords[i]) {
                      operationKeywords[i] = `${mcpName}::${methodName}`;
                    }
                    // Break after finding first matching method
                    break;
                  } else {
                    console.log(`[AIOProtocolHandler] Method ${methodName} not found in AIO index`);
                    continue;
                  }
                } else {
                  console.log(`[AIOProtocolHandler] AIO index not found for MCP ${mcpName}`);
                  continue;
                }
              } catch (error) {
                console.log(`[AIOProtocolHandler] Skipping method ${methodName} due to error:`, error);
                continue;
              }
            }
          }
        }
      }

      // Filter out any undefined or null entries from operation keywords
      validOperationKeywords = validOperationKeywords.filter((_, index) => 
        stepMcps[index] !== undefined || stepSchemas[operationKeywords[index]?.split('::')[1]]
      );
      
      console.log(`[AIOProtocolHandler] Extracted schemas and MCPs from execution plan:`, 
        { stepSchemas, stepMcps, methodIndexMap, validOperationKeywords }
      );
      
      // Create initial curr_value with start type
      const initialCurrValue: AIOProtocolValueType[] = [{
        key: "start",
        type: getValueType(inputValue),
        value: inputValue
      }];
      
      // Create a new context with filtered operations
      const context: AIOProtocolCallingContext = {
        input_value: inputValue,
        curr_value: initialCurrValue,
        output_value: null,
        opr_keywd: validOperationKeywords.length > 0 ? validOperationKeywords : operationKeywords,
        curr_call_index: 0,
        step_schemas: Object.keys(stepSchemas).length > 0 ? stepSchemas : undefined,
        step_mcps: stepMcps.filter(mcp => mcp !== undefined),
        method_index_map: Object.keys(methodIndexMap).length > 0 ? methodIndexMap : undefined,
        execution_plan: executionPlan,
        factor_identity: inputValue? 'has':undefined,
        status: 'init'
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
      
      // fetch mcp and method name for current step
      const mcp = context.step_mcps?.[currentIndex];
      
      // fetch action and inputSchema for current step
      let action: string | undefined;
      let inputSchema: any;
      
      // Add detailed debug logs
      console.log(`[AIOProtocolHandler] ===== Debug Info =====`);
      console.log(`[AIOProtocolHandler] Context ID: ${contextId}`);
      console.log(`[AIOProtocolHandler] Current index: ${currentIndex}`);
      console.log(`[AIOProtocolHandler] Step MCPs:`, context.step_mcps);
      console.log(`[AIOProtocolHandler] Step schemas:`, truncateLogData(context.step_schemas));
      console.log(`[AIOProtocolHandler] Method index map:`, context.method_index_map);
      console.log(`[AIOProtocolHandler] Operation keywords:`, context.opr_keywd);
      
      // try to get action and inputSchema from operation keywords
      if (context.opr_keywd?.[currentIndex]) {
        const [mcp, act] = context.opr_keywd[currentIndex].split('::');
        if (act) {
          action = act;
          console.log(`[AIOProtocolHandler] Got action from operation keywords: ${action}`);
        }
      }

      // try to get action and inputSchema from step_schemas
      if (context.step_schemas) {
        console.log(`[AIOProtocolHandler] Found step_schemas, iterating through entries...`);
        for (const [methodName, schema] of Object.entries(context.step_schemas)) {
          console.log(`[AIOProtocolHandler] Checking method ${methodName}`);
          console.log(`[AIOProtocolHandler] Method index in map: ${context.method_index_map?.[methodName]}`);
          console.log(`[AIOProtocolHandler] Current index: ${currentIndex}`);
          
          if (context.method_index_map?.[methodName] === currentIndex) {
            action = methodName;
            inputSchema = schema;
            console.log(`[AIOProtocolHandler] Found matching schema for method ${methodName}:`, schema);
            break;
          }
        }
      } else {
        console.log(`[AIOProtocolHandler] No step_schemas found in context`);
      }
      
      // if still no action and inputSchema, try to get it from execution_plan
      if (!action || !inputSchema) {
        if (context.execution_plan?.steps?.[currentIndex]) {
          console.log(`[AIOProtocolHandler] Falling back to execution_plan`);
          const step = context.execution_plan.steps[currentIndex];
          if (!action) action = step.action;
          if (!inputSchema) inputSchema = step.inputSchema;
        }
      }

      // If still no schema, try to get it from step_schemas using action name
      if (!inputSchema && action && context.step_schemas?.[action]) {
        console.log(`[AIOProtocolHandler] Getting schema from step_schemas using action name`);
        inputSchema = context.step_schemas[action];
      }

      // If still no schema, try to use the first available schema as fallback
      if (!inputSchema && context.step_schemas) {
        const firstSchema = Object.values(context.step_schemas)[0];
        if (firstSchema) {
          console.log(`[AIOProtocolHandler] Using first available schema as fallback`);
          // Ensure required field is preserved
          inputSchema = {
            ...firstSchema,
            required: firstSchema.required || ['prompt'] // Default to prompt as required field
          };
          console.log(`[AIOProtocolHandler] Fallback schema with required fields:`, inputSchema);
        }
      }
      
      // Ensure inputSchema has required field
      if (inputSchema && !inputSchema.required) {
        console.log(`[AIOProtocolHandler] Adding default required field to schema`);
        inputSchema = {
          ...inputSchema,
          required: ['prompt']
        };
      }
      
      const stepInfo = {
        action,
        inputSchema,
        mcp: context.step_mcps?.[currentIndex],
        dependencies: context.step_schemas?.[action]?.dependencies,
        stepIndex: currentIndex
      };
      
      console.log(`[AIOProtocolHandler] Final step info:`, truncateLogData(stepInfo));
      return stepInfo;
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
      // only use step_mcps and step_schemas to determine the total steps
      const totalSteps = Math.max(
        context.step_mcps?.length || 0,
        context.step_schemas ? Object.keys(context.step_schemas).length : 0
      );

      // Check if all steps are completed
      if (currentStep > totalSteps) {
        return {
          success: true,
          message: 'All steps completed',
          data: context.output_value
        };
      }

      // Get current step info
      const stepInfo = this.getCurrentStepInfo(contextId);
      
      // Send step start message to chatbox
      if (addDirectMessage) {
        addDirectMessage(`Executing step ${currentStep}/${totalSteps}: ${stepInfo?.action || 'Processing'}...`);
      }
      if (!context.factor_identity) {
        addDirectMessage(`Please describe you precise request in detail 
             ... `);
        return {
          success: true,
          message: '#Factor Identity#'
        };
      }

      // Prepare input value based on current step
      let inputValue;
      if (context.curr_call_index === 0) {
        console.log('[AIOProtocolHandler-curr-value] First step :', context.curr_value);
        // For first step, get the 'start' value
        const startValue = context.curr_value.find(v => v.key === "start");
        if (!startValue) {
          throw new Error("Start value not found in context");
        }
        inputValue = startValue.value;
      } else {
        // For other steps, get the last value from 'prompts'
        const promptsValue = context.curr_value.find(v => v.key === "prompts");
        if (!promptsValue || !Array.isArray(promptsValue.value) || promptsValue.value.length === 0) {
          throw new Error("No previous step result found in prompts");
        }
        inputValue = promptsValue.value[promptsValue.value.length - 1];
      }

      // Execute the step using the executor
      const result = await exec_step(
        apiEndpoint,
        contextId,
        inputValue,
        context.opr_keywd[context.curr_call_index] || '',
        context.curr_call_index,
        stepInfo || {}
      );

      if (!result.success) {
        throw new Error(result.error || 'Step execution failed');
      }

      // Update curr_call_index after successful execution
      context.curr_call_index = currentStep;
      
      // Update context status
      if (currentStep >= totalSteps) {
        context.status = 'finish';
        context.output_value = result.data;
      } else {
        context.status = 'running';
      }

      // Save updated context
      this.contexts.set(contextId, context);
      console.log(`[AIOProtocolHandler] Updated context ${contextId} with new curr_call_index: ${currentStep}`);

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
   * @param addDirectMessage Optional function to send status messages to the chatbox
   * @returns The updated context or null if execution failed
   */
  public async calling_step_by_step(
    contextId: string,
    apiEndpoint: string = "",
    addDirectMessage?: (content: string) => void
  ): Promise<AIOProtocolCallingContext | null> {
    console.log(`[AIOProtocolHandler] Starting step-by-step execution for context ${contextId}`);

    const context = this.contexts.get(contextId);
    if (!context) {
      console.error(`[AIOProtocolHandler] Context ${contextId} not found`);
      return null;
    }

    try {
      // Ensure curr_value is an array
      if (!Array.isArray(context.curr_value)) {
        console.error(`[AIOProtocolHandler] curr_value is not an array for context ${contextId}`);
        return null;
      }

      const totalSteps = Math.max(
        context.step_mcps?.length || 0,
        context.step_schemas ? Object.keys(context.step_schemas).length : 0
      );

      // Execute steps until completion
      let maxAttempts = totalSteps * 2; // Allow some retries but prevent infinite loops
      let attempts = 0;
      
      while (context.curr_call_index < totalSteps && attempts < maxAttempts) {
        attempts++;
        const previousIndex = context.curr_call_index;
        console.log(`[AIOProtocolHandler] Executing step ${previousIndex + 1}/${totalSteps}`);
        
        const result = await this.calling_next(contextId, apiEndpoint, addDirectMessage);
        
        if (!result.success) {
          throw new Error(result.message || 'Step execution failed');
        }

        // Get fresh context after calling_next
        const updatedContext = this.contexts.get(contextId);
        if (!updatedContext) {
          throw new Error("Context lost during execution");
        }

        // Verify that curr_call_index was actually updated
        if (updatedContext.curr_call_index === previousIndex) {
          console.warn(`[AIOProtocolHandler] Step index did not advance at attempt ${attempts}`);
          updatedContext.curr_call_index++; // Force advance to prevent infinite loop
          this.contexts.set(contextId, updatedContext);
        }

        // Update prompts with the result
        const promptsValue = updatedContext.curr_value.find(v => v.key === "prompts");
        if (promptsValue) {
          const currentValue = Array.isArray(promptsValue.value) ? promptsValue.value : [];
          promptsValue.value = [...currentValue, result.data];
        } else {
          const newPrompt: AIOProtocolValueType = {
            key: "prompts",
            type: getValueType(result.data),
            value: [result.data]
          };
          updatedContext.curr_value.push(newPrompt);
        }

        // If this is the last step, add result
        if (updatedContext.curr_call_index >= totalSteps - 1) {
          const resultValue: AIOProtocolValueType = {
            key: "result",
            type: getValueType(result.data),
            value: result.data
          };
          updatedContext.curr_value.push(resultValue);
        }

        // Update context
        this.contexts.set(contextId, updatedContext);
        console.log(`[AIOProtocolHandler] Updated context ${contextId} with curr_call_index: ${updatedContext.curr_call_index}`);
      }

      if (attempts >= maxAttempts) {
        console.log(`[AIOProtocolHandler] Exceeded maximum attempts, current stepinfo is`, JSON.stringify(context.step_mcps, null, 2));
        throw new Error(`Exceeded maximum attempts (${maxAttempts}) for step execution`);
      }

      console.log(`[AIOProtocolHandler] Completed all steps for context ${contextId}`);
      return this.contexts.get(contextId);
    } catch (error) {
      console.error(`[AIOProtocolHandler] Error in step-by-step execution:`, error);
      const errorContext = this.contexts.get(contextId);
      if (errorContext) {
        errorContext.status = 'error';
        errorContext.error = {
          message: error.message || 'Unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR',
          details: error.stack || error.toString()
        };
        this.contexts.set(contextId, errorContext);
        return errorContext;
      }
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

  /**
   * Initialize a protocol context with voice data and AI message
   * @param voiceData The voice input data
   * @param aiMessage The AI message containing execution plan
   * @returns The initialized context ID if successful, null otherwise
   */
  public async protocolStarting(voiceData: any, aiMessage: AIMessage): Promise<string | null> {
    try {
      // Generate a unique context ID using timestamp and random string
      const contextId = `protocol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Initialize the context with voice data as input using the new init_stable_context method
      const context = await this.init_stable_context(
        contextId,
        voiceData,
        [], // operationKeywords will be extracted from execution_plan in init_stable_context
        aiMessage.execution_plan
      );

      if (!context) {
        console.error('[AIOProtocolHandler-stable] Failed to initialize protocol context');
        return null;
      }

      console.log('[AIOProtocolHandler-stable] Successfully initialized protocol context:', contextId);
      return contextId;
    } catch (error) {
      console.error('[AIOProtocolHandler-stable] Error in protocolStarting:', error);
      return null;
    }
  }

  public async init_stable_context(
    contextId: string,
    inputValue: any,
    operationKeywords: string[] | any = [],
    executionPlan?: any
  ): Promise<AIOProtocolCallingContext | null> {
    console.log('[AIOProtocolHandler-stable] Initializing stable contextid:', contextId);
    console.log('[AIOProtocolHandler-stable] Input value:', truncateLogData(inputValue));
    console.log('[AIOProtocolHandler-stable] Operation keywords:', operationKeywords);
    console.log('[AIOProtocolHandler-stable] Execution plan:', executionPlan);
    try {
      // Extract step schemas and MCPs from execution plan if available
      const stepSchemas: Record<string, any> = {};
      const stepMcps: string[] = [];
      const methodIndexMap: Record<string, number> = {};
      let validOperationKeywords: string[] = [];

      // 添加调试日志
      console.log('[AIOProtocolHandler-stable] Execution plan steps:', executionPlan?.steps);
      console.log('[AIOProtocolHandler-stable] Is execution plan steps array:', Array.isArray(executionPlan?.steps));

      // Handle operation keywords if it's an object with steps
      if (operationKeywords && typeof operationKeywords === 'object') {
        if (Array.isArray(operationKeywords)) {
          validOperationKeywords = operationKeywords;
        } else if (operationKeywords.steps && Array.isArray(operationKeywords.steps)) {
          validOperationKeywords = operationKeywords.steps.map((step: any) => {
            return step.mcp ? `${step.mcp}:${step.action}` : step.action;
          });
        }
      }

      if (executionPlan?.steps && Array.isArray(executionPlan.steps)) {
        // Process each step to get schemas from AIO index
        for (let i = 0; i < executionPlan.steps.length; i++) {
          const step = executionPlan.steps[i];
          const mcpName = step.mcp;
          const methodName = step.action;

          // debug
          console.log(`[AIOProtocolHandler-stable] Processing step ${i}:`, { mcpName, methodName });

          if (mcpName && methodName) {
            try {
              // 检查这个 MCP 和 method 组合是否已经存在
              const existingIndex = stepMcps.findIndex((mcp, index) => 
                mcp === mcpName && stepSchemas[executionPlan.steps[index].action]
              );

              if (existingIndex !== -1) {
                console.log(`[AIOProtocolHandler-stable] MCP ${mcpName} with method ${methodName} already exists at index ${existingIndex}, skipping...`);
                continue;
              }

              // Fetch AIO index for this MCP
              const aioIndex = await getAIOIndexByMcpId(mcpName);
              
              // debug
              console.log(`[AIOProtocolHandler-stable] AIO index for MCP ${mcpName}:`, aioIndex);
              
              if (aioIndex) {
                // Get the method details from AIO index
                const method = getMethodByName(aioIndex, methodName);
                
                // debug
                console.log(`[AIOProtocolHandler-stable] Method details for ${methodName}:`, method);
                
                if (method) {
                  // Store the input schema using method name as key, adapting from AIO Index format
                  stepMcps[i] = mcpName;
                  // Convert from input_schema to inputSchema for internal protocol use
                  stepSchemas[methodName] = method.input_schema;
                  methodIndexMap[methodName] = i;
                  console.log(`[AIOProtocolHandler-stable] Setting up schema for method ${methodName}:`);
                  console.log(`[AIOProtocolHandler-stable] - MCP: ${mcpName}`);
                  console.log(`[AIOProtocolHandler-stable] - Schema:`, method.input_schema);
                  console.log(`[AIOProtocolHandler-stable] - Index: ${i}`);
                  console.log(`[AIOProtocolHandler-stable] Current stepSchemas:`, stepSchemas);
                  console.log(`[AIOProtocolHandler-stable] Current methodIndexMap:`, methodIndexMap);
                } else {
                  console.log(`[AIOProtocolHandler-stable] Method ${methodName} not found in AIO index`);
                }
              } else {
                console.log(`[AIOProtocolHandler-stable] AIO index not found for MCP ${mcpName}`);
              }
            } catch (error) {
              console.log(`[AIOProtocolHandler-stable] Skipping method ${methodName} due to error:`, error);
            }
          }
        }
      }

      // 添加调试日志
      console.log('[AIOProtocolHandler-stable] Final stepSchemas:', stepSchemas);
      console.log('[AIOProtocolHandler-stable] Final stepMcps:', stepMcps);

      // Filter out any undefined or null entries from operation keywords
      validOperationKeywords = validOperationKeywords.filter((_, index) => 
        stepMcps[index] !== undefined || stepSchemas[operationKeywords[index]?.split('::')[1]]
      );
      
      console.log(`[AIOProtocolHandler-stable] Extracted schemas and MCPs from execution plan:`, 
        { stepSchemas, stepMcps, methodIndexMap, validOperationKeywords }
      );
      
      // Create initial curr_value with start type
      const initialCurrValue: AIOProtocolValueType[] = [{
        key: "start",
        type: getValueType(inputValue),
        value: inputValue
      }];
      
      // Create a new context with filtered operations
      const context: AIOProtocolCallingContext = {
        input_value: inputValue,
        curr_value: initialCurrValue,
        output_value: null,
        opr_keywd: validOperationKeywords.length > 0 ? validOperationKeywords : operationKeywords,
        curr_call_index: 0,
        step_schemas: Object.keys(stepSchemas).length > 0 ? stepSchemas : undefined,
        step_mcps: stepMcps.filter(mcp => mcp !== undefined),
        method_index_map: Object.keys(methodIndexMap).length > 0 ? methodIndexMap : undefined,
        execution_plan: executionPlan,
        factor_identity: 'has', //voice identify ,not need further input
        status: 'init'
      };
      
      // Store the context
      this.contexts.set(contextId, context);
      console.log(`[AIOProtocolHandler-stable] Initialized context ${contextId}`, context);
      
      return context;
    } catch (error) {
      console.error('[AIOProtocolHandler-stable] Error initializing context:', error);
      return null;
    }
  }
}

/**
 * Fetch MCP and method names for a given keyword
 * @param keyword The keyword to search for
 * @returns Promise resolving to an object containing mcpName and methodName, or undefined if not found
 */
export async function fetchMcpAndMethodNames(keywords: string[]): Promise<{mcpName: string, methodName: string} | undefined> {
  try {
    console.log(`[AIO-Protocol] 🔍 Fetching MCP and method names for keyword: ${keywords}`);
    
    const result = await fetchMcpAndMethodName(keywords);
    
    if (result) {
      console.log(`[AIO-Protocol] ✅ Found MCP: ${result.mcpName}, Method: ${result.methodName}`);
      return result;
    } else {
      console.log(`[AIO-Protocol] ⚠️ No MCP found for keyword: ${keywords}`);
      return undefined;
    }
  } catch (error) {
    console.error(`[AIO-Protocol] ❌ Error fetching MCP and method names:`, error);
    throw error;
  }
} 