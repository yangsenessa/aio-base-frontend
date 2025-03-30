
import { getActor } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

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
    const result = await (await getActor()).get_mcp_item_by_name(name);
    return result.length > 0 ? result[0] : undefined;
  });
};

/**
 * Add a new MCP item
 * @param mcpItem MCP item to add
 * @returns Promise resolving to result
 */
export const addMcpItem = async (mcpItem: McpItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addMcpItem', { mcpItem }, async () => {
    return (await getActor()).add_mcp_item(mcpItem);
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
    return (await getActor()).update_mcp_item(id, mcpItem);
  });
};
