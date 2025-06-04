import { createProtocolMessage } from '@/services/types/aiTypes';
import { AIOProtocolStepInfo, AIOProtocolCallingContext, ProtocolTraceLog, ProtocolTraceCall } from './AIOProtocolHandler';
import { recordTraceCall, IOValue } from '@/services/can/traceOperations';

export class AIOProtocalFramework {
  private static instance: AIOProtocalFramework;
  private traceBuffer: Map<string, ProtocolTraceLog> = new Map();
  private readonly TRACE_BUFFER_SIZE = 100; // Maximum number of traces to keep in memory
  private readonly TRACE_SUBMIT_INTERVAL = 5000; // Submit traces every 5 seconds

  private constructor() {
    // Start the trace submission timer
    setInterval(() => this.submitTraces(), this.TRACE_SUBMIT_INTERVAL);
  }

  public static getInstance(): AIOProtocalFramework {
    if (!AIOProtocalFramework.instance) {
      AIOProtocalFramework.instance = new AIOProtocalFramework();
    }
    return AIOProtocalFramework.instance;
  }

  /**
   * Generates a unique trace ID
   * @returns A unique trace ID in the format AIO-TR-YYYYMMDD-XXXX
   */
  private generateTraceId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AIO-TR-${dateStr}-${random}`;
  }

  /**
   * Records a trace for a protocol step execution
   * @param contextId The context ID
   * @param stepInfo The step information
   * @param inputValue The input value
   * @param outputValue The output value
   * @param status The execution status
   * @param errorMessage Optional error message
   */
  public async recordTrace(
    contextId: string,
    stepInfo: AIOProtocolStepInfo,
    inputValue: any,
    outputValue: any,
    status: 'ok' | 'error',
    errorMessage?: string
  ): Promise<void> {
    // Get or create trace log for this context
    let traceLog = this.traceBuffer.get(contextId);
    if (!traceLog) {
      traceLog = {
        trace_id: this.generateTraceId(),
        calls: []
      };
      this.traceBuffer.set(contextId, traceLog);
    }

    console.log('[AIOProtocalFramework TraceLog] stepInfo', stepInfo);
    // Create the trace call
    const traceCall: ProtocolTraceCall = {
      id: traceLog.calls.length + 1,
      protocol: stepInfo.mcp ? 'mcp' : 'aio',
      agent: stepInfo.mcp?.split('::')[0] || 'unknown',
      type: stepInfo.mcp ? 'mcp' : 'stdio',
      method: stepInfo.action || 'unknown',
      input: this.createIOValue(inputValue),
      output: this.createIOValue(outputValue),
      status,
      error_message: errorMessage
    };

    // Add the trace call
    traceLog.calls.push(traceCall);

    // Trim buffer if it exceeds maximum size
    if (traceLog.calls.length > this.TRACE_BUFFER_SIZE) {
      traceLog.calls.splice(0, traceLog.calls.length - this.TRACE_BUFFER_SIZE);
    }

    // Submit to backend
    try {
      await recordTraceCall(
        traceLog.trace_id,
        contextId,
        traceCall.protocol,
        traceCall.agent,
        traceCall.type,
        traceCall.method,
        traceCall.input,
        traceCall.output,
        traceCall.status,
        traceCall.error_message
      );
    } catch (error) {
      console.error('[AIOProtocalFramework] Error submitting trace to backend:', error);
    }
  }

  /**
   * Creates an IOValue from any value
   * @param value The value to convert
   * @returns An IOValue object
   */
  private createIOValue(value: any): IOValue {
    if (value === null || value === undefined) {
      return {
        data_type: 'null',
        value: { Null: null }
      };
    }

    if (typeof value === 'string') {
      // Limit string to 100 bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(value);
      const truncatedValue = bytes.length > 100 
        ? new TextDecoder().decode(bytes.slice(0, 100))
        : value;
      
      return {
        data_type: 'text',
        value: { Text: truncatedValue }
      };
    }

    if (typeof value === 'number') {
      return {
        data_type: 'number',
        value: { Number: value }
      };
    }

    if (typeof value === 'boolean') {
      return {
        data_type: 'boolean',
        value: { Boolean: value }
      };
    }

    if (Array.isArray(value)) {
      const jsonStr = JSON.stringify(value);
      // Limit JSON string to 100 bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonStr);
      const truncatedJson = bytes.length > 100 
        ? new TextDecoder().decode(bytes.slice(0, 100))
        : jsonStr;
      
      return {
        data_type: 'array',
        value: { Array: truncatedJson }
      };
    }

    if (value instanceof Blob || value instanceof File) {
      // Get blob size and type
      const size = value.size;
      const type = value.type;
      // Create a limited size representation
      const blobInfo = JSON.stringify({
        type,
        size,
        truncated: size > 100,
        preview: size > 100 ? 'blob-data-truncated' : 'blob-data'
      });
      
      // Limit the blob info string to 100 bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(blobInfo);
      const truncatedInfo = bytes.length > 100 
        ? new TextDecoder().decode(bytes.slice(0, 100))
        : blobInfo;
      
      return {
        data_type: 'blob',
        value: { Object: truncatedInfo }
      };
    }

    // Default to object
    const jsonStr = JSON.stringify(value);
    // Limit JSON string to 100 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonStr);
    const truncatedJson = bytes.length > 100 
      ? new TextDecoder().decode(bytes.slice(0, 100))
      : jsonStr;
    
    return {
      data_type: 'object',
      value: { Object: truncatedJson }
    };
  }

  /**
   * Submits all buffered traces to the backend
   */
  private async submitTraces(): Promise<void> {
    for (const [contextId, traceLog] of this.traceBuffer.entries()) {
      if (traceLog.calls.length === 0) continue;

      try {
        // Submit each call in the trace
        for (const call of traceLog.calls) {
          await recordTraceCall(
            traceLog.trace_id,
            contextId,
            call.protocol,
            call.agent,
            call.type,
            call.method,
            call.input,
            call.output,
            call.status,
            call.error_message
          );
        }
        
        // Clear the buffer after successful submission
        this.traceBuffer.set(contextId, {
          trace_id: this.generateTraceId(),
          calls: []
        });
      } catch (error) {
        console.error('[AIOProtocalFramework] Error submitting traces:', error);
      }
    }
  }

  /**
   * Maps a step info to a protocol message and returns the adapted step info
   * @param stepInfo The step info to map
   * @returns The adapted step info
   */
  public mapStepCallStep(stepInfo: AIOProtocolStepInfo): AIOProtocolStepInfo {
    try {
      // Create a protocol message using the step info
      const protocolMessage = createProtocolMessage();

      // Parse the protocol message content to get the schema
      const protocolContent = JSON.parse(protocolMessage.content);
      
      // Adapt the step info with the protocol message schema
      const adaptedStepInfo: AIOProtocolStepInfo = {
        ...stepInfo,
        inputSchema: protocolContent.inputSchema || stepInfo.inputSchema,
        mcp: stepInfo.mcp || protocolContent.method.split('::')[0],
        action: stepInfo.action || protocolContent.method.split('::')[1]
      };

      return adaptedStepInfo;
    } catch (error) {
      console.error('[AIOProtocalFramework] Error mapping step:', error);
      return stepInfo; // Return original step info if mapping fails
    }
  }
}
