import { getActor,getPrincipalFromPlug } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

/**
 * Helper function to safely serialize objects with BigInt values
 */
const serializeWithBigInt = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n'; // Add 'n' suffix to identify BigInt values
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
    const result = await (await getActor()).get_mcp_item(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

/**
 * Get all MCP items
 * @returns Promise resolving to array of MCP items
 */
export const getAllMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getAllMcpItems', {}, async () => {
    return (await getActor()).get_all_mcp_items();
  });
};

/**
 * Get MCP items for the current user
 * @returns Promise resolving to array of MCP items
 */
export const getUserMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getUserMcpItems', {}, async () => {
    return (await getActor()).get_user_mcp_items();
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
    return (await getActor()).get_user_mcp_items_paginated(offset, limit);
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
    return (await getActor()).get_mcp_items_paginated(offset, limit);
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
      const actor = await getActor();
      const result = await actor.get_mcp_item_by_name(name);
      console.log(`[CANISTER_CALL] get_mcp_item_by_name - Output:`, result);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error(`Failed to get MCP item by name "${name}":`, error);
      // Add more specific error handling if needed
      throw error; // Re-throw to let the caller handle it
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
      const actor = await getActor();
      console.log(`[CANISTER_CALL] add_mcp_item - Actor:`, actor);
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
      const actor = await getActor();
      const result = await actor.update_mcp_item(id, mcpItem);
      console.log(`[CANISTER_CALL] update_mcp_item - Output:`, serializeWithBigInt(result));
      return result;
    } catch (error) {
      console.error(`[CANISTER_ERROR] update_mcp_item failed:`, error);
      throw error;
    }
  });
};
