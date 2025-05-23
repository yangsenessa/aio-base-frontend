import { getActor, getPrincipalFromPlug } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import type { InvertedIndexItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

// 定义 actor 类型
interface McpActor {
  get_mcp_item: (id: bigint) => Promise<McpItem | undefined>;
  get_all_mcp_items: () => Promise<McpItem[]>;
  get_user_mcp_items: () => Promise<McpItem[]>;
  get_user_mcp_items_paginated: (offset: bigint, limit: bigint) => Promise<McpItem[]>;
  get_mcp_items_paginated: (offset: bigint, limit: bigint) => Promise<McpItem[]>;
  get_mcp_item_by_name: (name: string) => Promise<McpItem | undefined>;
  add_mcp_item: (mcpItem: McpItem, principalId: string) => Promise<{Ok: bigint} | {Err: string}>;
  update_mcp_item: (id: bigint, mcpItem: McpItem) => Promise<{Ok: null} | {Err: string}>;
  delete_mcp_item: (name: string) => Promise<{Ok: null} | {Err: string}>;
  create_aio_index_from_json: (name: string, jsonData: string) => Promise<{Ok: null} | {Err: string}>;
  export_aio_index_to_json: (name: string) => Promise<{Ok: string} | {Err: string}>;
  store_inverted_index: (mcpName: string, jsonStr: string) => Promise<{Ok: null} | {Err: string}>;
  get_all_keywords: () => Promise<string[]>;
  revert_Index_find_by_keywords_strategy: (keywords: string[]) => Promise<string>;
}

/**
 * Helper function to safely serialize objects with BigInt values
 */
const serializeWithBigInt = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }
    return value;
  }, 2);
};

/**
 * Get an MCP item by ID
 * @param id MCP ID
 * @returns Promise resolving to MCP item or undefined
 */
export const getMcpItem = async (id: bigint): Promise<McpItem | undefined> => {
  return loggedCanisterCall('getMcpItem', { id }, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.get_mcp_item(id);
      return result || undefined;
    } catch (error) {
      console.error(`Failed to get MCP item by ID ${id}:`, error);
      throw error;
    }
  });
};

/**
 * Get all MCP items
 * @returns Promise resolving to array of MCP items
 */
export const getAllMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getAllMcpItems', {}, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      return await actor.get_all_mcp_items();
    } catch (error) {
      console.error('Failed to get all MCP items:', error);
      throw error;
    }
  });
};

/**
 * Get MCP items for the current user
 * @returns Promise resolving to array of MCP items
 */
export const getUserMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getUserMcpItems', {}, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      return await actor.get_user_mcp_items();
    } catch (error) {
      console.error('Failed to get user MCP items:', error);
      throw error;
    }
  });
};

/**
 * Get paginated MCP items for the current user
 * @param offset Pagination offset
 * @param limit Number of items to return
 * @returns Promise resolving to array of MCP items
 */
export const getUserMcpItemsPaginated = async (offset: bigint, limit: bigint): Promise<McpItem[]> => {
  return loggedCanisterCall('getUserMcpItemsPaginated', { offset, limit }, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      return await actor.get_user_mcp_items_paginated(offset, limit);
    } catch (error) {
      console.error('Failed to get paginated user MCP items:', error);
      throw error;
    }
  });
};

/**
 * Get paginated MCP items
 * @param offset Pagination offset
 * @param limit Number of items to return
 * @returns Promise resolving to array of MCP items
 */
export const getMcpItemsPaginated = async (offset: bigint, limit: bigint): Promise<McpItem[]> => {
  return loggedCanisterCall('getMcpItemsPaginated', { offset, limit }, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      
      // Convert BigInt to Number to ensure it fits within nat64 range
      const offsetNum = Number(offset);
      const limitNum = Number(limit);
      
      // Validate that values are within safe range for nat64
      if (offsetNum < 0 || limitNum < 0 || !Number.isSafeInteger(offsetNum) || !Number.isSafeInteger(limitNum)) {
        throw new Error("Offset and limit must be positive integers within safe integer range");
      }
      
      console.log(`[CANISTER_CALL] get_mcp_items_paginated - Input: offset=${offsetNum}, limit=${limitNum}`);
      
      const result = await actor.get_mcp_items_paginated(BigInt(offsetNum), BigInt(limitNum));
      console.log(`[CANISTER_CALL] get_mcp_items_paginated - Received ${result.length} items`);
      
      return result;
    } catch (error) {
      console.error('[CANISTER_ERROR] get_mcp_items_paginated failed:', error);
      throw error;
    }
  });
};

/**
 * Get an MCP item by name
 * @param name MCP name
 * @returns Promise resolving to MCP item or undefined
 */
export const getMcpItemByName = async (name: string): Promise<McpItem | undefined> => {
  return loggedCanisterCall('getMcpItemByName', { name }, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.get_mcp_item_by_name(name);
      return result || undefined;
    } catch (error) {
      console.error(`Failed to get MCP item by name "${name}":`, error);
      throw error;
    }
  });
};

/**
 * Add a new MCP item
 * @param mcpItem MCP item to add
 * @returns Promise resolving to result
 */
export const addMcpItem = async (mcpItem: McpItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addMcpItem', { mcpItem }, async () => {
    console.log(`[CANISTER_CALL] add_mcp_item - Input:`, serializeWithBigInt(mcpItem));
    try {
      const actor = await getActor() as unknown as McpActor;
      const principalid = await getPrincipalFromPlug();
      const result = await actor.add_mcp_item(mcpItem, principalid);
      console.log(`[CANISTER_CALL] add_mcp_item - Output:`, serializeWithBigInt(result));
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] add_mcp_item failed:`, error);
      throw error;
    }
  });
};

/**
 * Update an existing MCP item
 * @param id MCP ID
 * @param mcpItem Updated MCP item
 * @returns Promise resolving to result
 */
export const updateMcpItem = async (id: bigint, mcpItem: McpItem): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('updateMcpItem', { id, mcpItem }, async () => {
    console.log(`[CANISTER_CALL] update_mcp_item - Input:`, {
      id: id.toString() + 'n',
      mcpItem: serializeWithBigInt(mcpItem)
    });
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.update_mcp_item(id, mcpItem);
      console.log(`[CANISTER_CALL] update_mcp_item - Output:`, serializeWithBigInt(result));
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] update_mcp_item failed:`, error);
      throw error;
    }
  });
};

/**
 * Delete an MCP item by name
 * @param name MCP name
 * @returns Promise resolving to result
 */
export const deleteMcpItem = async (name: string): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('deleteMcpItem', { name }, async () => {
    console.log(`[CANISTER_CALL] deleteMcpItem - Input: name=${name}`);
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.delete_mcp_item(name);
      console.log(`[CANISTER_CALL] deleteMcpItem - Output:`, result);
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] deleteMcpItem failed:`, error);
      throw error;
    }
  });
};

/**
 * Create a new AIO index from JSON
 * @param name MCP Server name / Agent name
 * @param jsonData JSON string representation of the AIO index
 * @returns Promise resolving to result
 */
export const createAioIndexFromJson = async (name: string, jsonData: string): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('createAioIndexFromJson', { name, jsonData }, async () => {
    console.log(`[CANISTER_CALL] create_aio_index_from_json - Input: id=${name}, data=${jsonData}`);
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.create_aio_index_from_json(name, jsonData);
      console.log(`[CANISTER_CALL] create_aio_index_from_json - Output:`, result);
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] create_aio_index_from_json failed:`, error);
      throw error;
    }
  });
};

/**
 * Export an AIO index to JSON
 * @param name MCP Server name / Agent name
 * @returns Promise resolving to result with JSON string or error
 */
export const exportAioIndexToJson = async (name: string): Promise<{Ok: string} | {Err: string}> => {
  return loggedCanisterCall('exportAioIndexToJson', { name }, async () => {
    console.log(`[CANISTER_CALL] export_aio_index_to_json - Input: id=${name}`);
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.export_aio_index_to_json(name);
      console.log(`[CANISTER_CALL] export_aio_index_to_json - Output:`, 
                  'Ok' in result ? `JSON data length: ${result.Ok.length}` : `Error: ${(result as {Err: string}).Err}`);
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] export_aio_index_to_json failed:`, error);
      throw error;
    }
  });
};

/**
 * Store inverted index from JSON string
 * @param jsonStr JSON string representation of the inverted index
 * @returns Promise resolving to result
 */
export const storeInvertedIndex = async (mcpName: string, jsonStr: string): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('storeInvertedIndex', { mcpName, jsonStr }, async () => {
    console.log(`[CANISTER_CALL] store_inverted_index - Input:`, mcpName, jsonStr);
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.store_inverted_index(mcpName, jsonStr);
      console.log(`[CANISTER_CALL] store_inverted_index - Output:`, result);
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] store_inverted_index failed:`, error);
      throw error;
    }
  });
};

/**
 * Get all inner keywords from the inverted index
 * @returns Promise resolving to array of keywords
 */
export const getAllInnerKeywords = async (): Promise<string[]> => {
  return loggedCanisterCall('getAllInnerKeywords', {}, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.get_all_keywords();
      
      if (typeof result === 'string') {
        try {
          return JSON.parse(result);
        } catch (parseError) {
          console.error('Failed to parse keywords JSON:', parseError);
          return [];
        }
      }
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] get_all_keywords failed:`, error);
      throw error;
    }
  });
};

/**
 * Fetch MCP name and method name from inverted index by keyword
 * @param keyword The keyword to search for
 * @returns Promise resolving to the MCP name or undefined if not found
 */
export const fetchMcpAndMethodName = async (keywords: string[]): Promise<{mcpName: string, methodName: string} | undefined> => {
  return loggedCanisterCall('fetchMcpAndMethodName', { keywords }, async () => {
    try {
      const actor = await getActor() as unknown as McpActor;
      const result = await actor.revert_Index_find_by_keywords_strategy(keywords);
      
      let items: InvertedIndexItem[];
      try {
        const parsedResult = JSON.parse(result);
        if (!parsedResult || Object.keys(parsedResult).length === 0) {
          return undefined;
        }
        items = [parsedResult];
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return undefined;
      }
      
      if (!items.length || !items[0].mcp_name || !items[0].method_name) {
        return undefined;
      }
      
      return {
        mcpName: items[0].mcp_name,
        methodName: items[0].method_name
      };
    } catch (error) {
      console.error('Failed to fetch MCP and method name:', error);
      return undefined;
    }
  });
};
