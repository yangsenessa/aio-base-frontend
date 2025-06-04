import { getActor } from './actorManager';
import { loggedCanisterCall } from './callUtils';

// Define types to match backend
export type IOValueType = 'Text' | 'Number' | 'Boolean' | 'Object' | 'Array' | 'Null';

export interface IOValue {
    data_type: string;
    value: {
        Text: string;
    } | {
        Number: number;
    } | {
        Boolean: boolean;
    } | {
        Object: string;
    } | {
        Array: string;
    } | {
        Null: null;
    };
}

export interface ProtocolCall {
    id: number;
    protocol: string;
    agent: string;
    call_type: string;
    method: string;
    input: IOValue;
    output: IOValue;
    status: string;
    error_message: [] | [string];
}

export interface TraceLog {
    trace_id: string;
    context_id: string;
    calls: ProtocolCall[];
}

export interface TraceStatistics {
    total_count: bigint;
    success_count: bigint;
    error_count: bigint;
}

/**
 * Record a trace call
 */
export const recordTraceCall = async (
    trace_id: string,
    context_id: string,
    protocol: string,
    agent: string,
    call_type: string,
    method: string,
    input: IOValue,
    output: IOValue,
    status: string,
    error_message?: string
): Promise<{Ok: null} | {Err: string}> => {
    return loggedCanisterCall('recordTraceCall', {
        trace_id,
        context_id,
        protocol,
        agent,
        call_type,
        method,
        input,
        output,
        status,
        error_message
    }, async () => {
        const actor = await getActor();
        return actor.record_trace_call(
            trace_id,
            context_id,
            protocol,
            agent,
            call_type,
            method,
            input,
            output,
            status,
            error_message ? [error_message] : []
        );
    });
};

/**
 * Get a trace by ID
 */
export const getTrace = async (trace_id: string): Promise<TraceLog | undefined> => {
    return loggedCanisterCall('getTrace', { trace_id }, async () => {
        const actor = await getActor();
        const result = await actor.get_trace(trace_id);
        return result[0];
    });
};

/**
 * Get a trace by context ID
 */
export const getTraceByContext = async (context_id: string): Promise<TraceLog | undefined> => {
    return loggedCanisterCall('getTraceByContext', { context_id }, async () => {
        const actor = await getActor();
        const result = await actor.get_trace_by_context(context_id);
        return result[0];
    });
};

/**
 * Get all traces
 */
export const getAllTraces = async (): Promise<TraceLog[]> => {
    return loggedCanisterCall('getAllTraces', {}, async () => {
        const actor = await getActor();
        return actor.get_all_traces();
    });
};

/**
 * Get paginated traces
 */
export const getTracesPaginated = async (offset: bigint, limit: bigint): Promise<TraceLog[]> => {
    return loggedCanisterCall('getTracesPaginated', { offset, limit }, async () => {
        const actor = await getActor();
        return actor.get_traces_paginated(offset, limit);
    });
};

/**
 * Get traces by protocol
 */
export const getTracesByProtocol = async (protocol: string): Promise<TraceLog[]> => {
    return loggedCanisterCall('getTracesByProtocol', { protocol }, async () => {
        const actor = await getActor();
        return actor.get_traces_by_protocol(protocol);
    });
};

/**
 * Get traces by method
 */
export const getTracesByMethod = async (method: string): Promise<TraceLog[]> => {
    return loggedCanisterCall('getTracesByMethod', { method }, async () => {
        const actor = await getActor();
        return actor.get_traces_by_method(method);
    });
};

/**
 * Get traces by status
 */
export const getTracesByStatus = async (status: string): Promise<TraceLog[]> => {
    return loggedCanisterCall('getTracesByStatus', { status }, async () => {
        const actor = await getActor();
        return actor.get_traces_by_status(status);
    });
};

/**
 * Get traces with filters
 */
export const getTracesWithFilters = async (
    protocols?: string[],
    methods?: string[],
    statuses?: string[]
): Promise<TraceLog[]> => {
    return loggedCanisterCall('getTracesWithFilters', { protocols, methods, statuses }, async () => {
        const actor = await getActor();
        return actor.get_traces_with_filters(
            protocols ? [protocols] : [],
            methods ? [methods] : [],
            statuses ? [statuses] : []
        );
    });
};

/**
 * Get trace statistics
 */
export const getTracesStatistics = async (): Promise<TraceStatistics> => {
    return loggedCanisterCall('getTracesStatistics', {}, async () => {
        const actor = await getActor();
        return actor.get_traces_statistics();
    });
};
