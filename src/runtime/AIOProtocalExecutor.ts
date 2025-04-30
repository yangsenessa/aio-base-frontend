import { AIOProtocolStepInfo } from './AIOProtocolHandler';
import { AIOProtocalFramework } from './AIOProtocalFramework';
import { executeRpc } from '../services/ExecFileCommonBuss';

interface StepExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Executes a single step in the protocol using JSON-RPC
 * @param apiEndpoint The API endpoint to call
 * @param contextId Unique identifier for the calling context
 * @param currentValue Current value from the context
 * @param operation Current operation keyword
 * @param callIndex Current call index
 * @param stepInfo Information about the current step
 * @returns Promise with the execution result
 */
export async function exec_step(
  apiEndpoint: string,
  contextId: string,
  currentValue: any,
  operation: string,
  callIndex: number,
  stepInfo: AIOProtocolStepInfo
): Promise<StepExecutionResult> {
  const framework = AIOProtocalFramework.getInstance();
  const startTime = Date.now();

  // Get the base API URL from environment variables
  const baseApiUrl = import.meta.env.VITE_AIO_MCP_API_URL;
  if (!baseApiUrl) {
    const error = 'VITE_AIO_MCP_API_URL is not defined in environment variables';
    console.error(`[exec_step] ${error}`);
    return {
      success: false,
      error
    };
  }

  // Construct the full endpoint URL
  const fullEndpoint = `${baseApiUrl}${apiEndpoint}`;
  
  console.log(`[exec_step] Starting execution for context ${contextId}, callIndex ${callIndex}`);
  console.log(`[exec_step] Base API URL: ${baseApiUrl}`);
  console.log(`[exec_step] Full endpoint: ${fullEndpoint}`);
  console.log(`[exec_step] Operation: ${operation}`);
  console.log(`[exec_step] Current value:`, currentValue);
  console.log(`[exec_step] Step info:`, stepInfo);

  try {
    // Extract file type and filename from the endpoint
    const endpointParts = apiEndpoint.split('/');
    const fileType = endpointParts[endpointParts.length - 2] as 'agent' | 'mcp' | 'img';
    const filename = endpointParts[endpointParts.length - 1];

    console.log(`[exec_step] Extracted file type: ${fileType}, filename: ${filename}`);

    // Prepare the request parameters
    const params = {
      context_id: contextId,
      curr_value: currentValue,
      operation: operation || '',
      call_index: callIndex,
      mcp: stepInfo.mcp || '',
      input_schema: stepInfo.inputSchema || {},
      dependencies: stepInfo.dependencies || []
    };

    console.log(`[exec_step] Prepared RPC parameters:`, params);

    // Execute the RPC call
    console.log(`[exec_step] Initiating RPC call with action: ${stepInfo.action}`);
    const rpcResponse = await executeRpc(
      fileType,
      filename,
      stepInfo.action || 'help',
      params,
      `${contextId}_${callIndex}`
    );

    console.log(`[exec_step] RPC response received:`, rpcResponse);

    // Handle RPC error response
    if (rpcResponse.error) {
      console.error(`[exec_step] RPC error occurred:`, rpcResponse.error);
      throw new Error(rpcResponse.error.message);
    }

    // Validate the response data
    if (!rpcResponse.result || !rpcResponse.result.data) {
      console.error(`[exec_step] Invalid RPC response:`, rpcResponse);
      throw new Error('RPC returned invalid or empty response');
    }

    const executionTime = Date.now() - startTime;
    console.log(`[exec_step] Execution completed successfully in ${executionTime}ms`);
    console.log(`[exec_step] Result data:`, rpcResponse.result.data);

    // Record successful trace
    framework.recordTrace(
      contextId,
      { ...stepInfo, stepIndex: callIndex },
      currentValue,
      rpcResponse.result.data,
      'ok'
    );

    // Return the successful result
    return {
      success: true,
      data: rpcResponse.result.data
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[exec_step] Execution failed after ${executionTime}ms:`, error);

    // Record error trace
    framework.recordTrace(
      contextId,
      { ...stepInfo, stepIndex: callIndex },
      currentValue,
      null,
      'error',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );

    // Return the error result
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
