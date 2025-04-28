import { AIOProtocolStepInfo } from './AIOProtocolHandler';
import { AIOProtocalFramework } from './AIOProtocalFramework';

interface StepExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Executes a single step in the protocol
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

  try {
    // Prepare the request body
    const requestBody = {
      context_id: contextId,
      curr_value: currentValue,
      operation: operation || '',
      call_index: callIndex,
      mcp: stepInfo.mcp || '',
      input_schema: stepInfo.inputSchema || {},
      dependencies: stepInfo.dependencies || []
    };

    // Make the API call
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
    }

    // Parse the response
    const result = await response.json();

    // Validate the response
    if (!result || !result.data) {
      throw new Error('API returned invalid or empty response');
    }

    // Record successful trace
    framework.recordTrace(
      contextId,
      { ...stepInfo, stepIndex: callIndex },
      currentValue,
      result.data,
      'ok'
    );

    // Return the successful result
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
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
