import { exportAioIndexToJson } from '../services/can/mcpOperations';

// Type definitions for the AIO index structure
interface MethodInputSchema {
    type: string;
    properties: Record<string, {
        type: string;
        description: string;
    }>;
    required: string[];
}

interface Method {
    name: string;
    description: string;
    input_schema: MethodInputSchema;
    parameters?: string[];
}

interface Source {
    author: string;
    version: string;
    github: string;
}

interface EvaluationMetrics {
    completeness_score: number;
    accuracy_score: number;
    relevance_score: number;
    translation_quality: number;
}

interface AIOIndex {
    description: string;
    capability_tags: string[];
    functional_keywords: string[];
    scenario_phrases: string[];
    methods: Method[];
    source: Source;
    evaluation_metrics: EvaluationMetrics;
}

// Parameter generation related types
export interface SchemaProperty {
    type: string;
    description?: string;
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
}

export interface InputSchema {
    type: string;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    items?: SchemaProperty;
}

/**
 * Generates default value based on schema type
 * @param type Schema type
 * @returns Default value for the type
 */
export function generateDefaultValue(type: string): any {
    switch (type) {
        case 'string':
            return '';
        case 'number':
        case 'integer':
            return 0;
        case 'boolean':
            return false;
        case 'array':
            return [];
        case 'object':
            return {};
        default:
            return null;
    }
}

/**
 * Generates parameters based on input schema
 * @param schema Input schema
 * @param currentValue Current value to consider
 * @returns Generated parameters
 */
export function generateParamsFromSchema(schema: InputSchema | undefined, currentValue: any): any {
    
    console.log("[AIOProtocolAdapter] Generating parameters from schema:", schema);
    console.log("[AIOProtocolAdapter] Current value:", currentValue);

    if (!schema) {
        return currentValue;
    }

    // Handle direct value if schema expects simple type
    if (schema.type !== 'object' && currentValue !== undefined) {
        return currentValue;
    }

    // Handle array type
    if (schema.type === 'array') {
        if (Array.isArray(currentValue)) {
            return currentValue;
        }
        return schema.items ? [generateParamsFromSchema(schema.items as InputSchema, undefined)] : [];
    }

    // Handle object type
    if (schema.type === 'object' && schema.properties) {
        console.log("[AIOProtocolAdapter] Handling object type:", schema.properties);
        const params: Record<string, any> = {};
        
        // Process each property in the schema
        for (const [key, prop] of Object.entries(schema.properties)) {
            // For required fields, generate a default value
            if (schema.required?.includes(key) && !currentValue) {
                if (prop.type === 'object' && prop.properties) {
                    params[key] = generateParamsFromSchema(prop as InputSchema, undefined);
                } else {
                    params[key] = generateDefaultValue(prop.type);
                }
            }
            params[key] = currentValue;
        }

        console.log("[AIOProtocolAdapter] Generated parameters:", params);
        return params;
    }

    // Return current value if no specific handling needed
    return currentValue;
}

/**
 * Get AIO index data for a given MCP name
 * @param mcp_name The name of the MCP to get the AIO index for
 * @returns Promise resolving to the parsed JSON object or null if there's an error
 */
export async function getAIOIndexByMcpId(mcp_name: string): Promise<AIOIndex | null> {
    try {
        const result = await exportAioIndexToJson(mcp_name);
        
        if ('Ok' in result) {
            // Parse the JSON string into an object
            return JSON.parse(result.Ok) as AIOIndex;
        } else {
            console.error(`Failed to get AIO index for MCP "${mcp_name}":`, result.Err);
            return null;
        }
    } catch (error) {
        console.error(`Error getting AIO index for MCP "${mcp_name}":`, error);
        return null;
    }
}

/**
 * Get the description of the MCP
 * @param aioIndex The AIO index object
 * @returns The description string
 */
export function getDescription(aioIndex: AIOIndex): string {
    return aioIndex.description;
}

/**
 * Get the capability tags of the MCP
 * @param aioIndex The AIO index object
 * @returns Array of capability tags
 */
export function getCapabilityTags(aioIndex: AIOIndex): string[] {
    return aioIndex.capability_tags;
}

/**
 * Get the functional keywords of the MCP
 * @param aioIndex The AIO index object
 * @returns Array of functional keywords
 */
export function getFunctionalKeywords(aioIndex: AIOIndex): string[] {
    return aioIndex.functional_keywords;
}

/**
 * Get the scenario phrases of the MCP
 * @param aioIndex The AIO index object
 * @returns Array of scenario phrases
 */
export function getScenarioPhrases(aioIndex: AIOIndex): string[] {
    return aioIndex.scenario_phrases;
}

/**
 * Get all methods defined in the MCP
 * @param aioIndex The AIO index object
 * @returns Array of Method objects
 */
export function getMethods(aioIndex: AIOIndex): Method[] {
    return aioIndex.methods;
}

/**
 * Get a specific method by name
 * @param aioIndex The AIO index object
 * @param methodName The name of the method to find
 * @returns The Method object if found, null otherwise
 */
export function getMethodByName(aioIndex: AIOIndex, methodName: string): Method | null {
    console.log("[AIOProtocolAdapter] Getting method by name:", methodName);
    console.log("[AIOProtocolAdapter] AIO index:", aioIndex);
    const method = aioIndex.methods.find(m => m.name === methodName);
    if (method) {
        console.log("[AIOProtocolAdapter] Found method schema:", method.input_schema);
    }
    return method || null;
}

/**
 * Get the source information of the MCP
 * @param aioIndex The AIO index object
 * @returns The Source object
 */
export function getSource(aioIndex: AIOIndex): Source {
    return aioIndex.source;
}

/**
 * Get the evaluation metrics of the MCP
 * @param aioIndex The AIO index object
 * @returns The EvaluationMetrics object
 */
export function getEvaluationMetrics(aioIndex: AIOIndex): EvaluationMetrics {
    return aioIndex.evaluation_metrics;
}

/**
 * Get the required parameters for a specific method
 * @param aioIndex The AIO index object
 * @param methodName The name of the method
 * @returns Array of required parameter names or null if method not found
 */
export function getMethodRequiredParameters(aioIndex: AIOIndex, methodName: string): string[] | null {
    const method = getMethodByName(aioIndex, methodName);
    return method ? method.input_schema.required : null;
}
