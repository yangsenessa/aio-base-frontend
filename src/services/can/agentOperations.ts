
import { getActor } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

/**
 * Get an agent item by ID
 * @param id Agent ID
 * @returns Promise resolving to agent item or undefined
 */
export const getAgentItem = async (id: bigint): Promise<AgentItem | undefined> => {
  return loggedCanisterCall('getAgentItem', { id }, async () => {
    const result = await (await getActor()).get_agent_item(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

/**
 * Get all agent items
 * @returns Promise resolving to array of agent items
 */
export const getAllAgentItems = async (): Promise<AgentItem[]> => {
  return loggedCanisterCall('getAllAgentItems', {}, async () => {
    return (await getActor()).get_all_agent_items();
  });
};

/**
 * Get agent items for the current user
 * @returns Promise resolving to array of agent items
 */
export const getUserAgentItems = async (): Promise<AgentItem[]> => {
  return loggedCanisterCall('getUserAgentItems', {}, async () => {
    return (await getActor()).get_user_agent_items();
  });
};

/**
 * Get paginated agent items for the current user
 * @param offset Pagination offset
 * @param limit Number of items to return
 * @returns Promise resolving to array of agent items
 */
export const getUserAgentItemsPaginated = async (offset: bigint, limit: bigint): Promise<AgentItem[]> => {
  return loggedCanisterCall('getUserAgentItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_user_agent_items_paginated(offset, limit);
  });
};

/**
 * Get paginated agent items
 * @param offset Pagination offset
 * @param limit Number of items to return
 * @returns Promise resolving to array of agent items
 */
export const getAgentItemsPaginated = async (offset: bigint, limit: bigint): Promise<AgentItem[]> => {
  return loggedCanisterCall('getAgentItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_agent_items_paginated(offset, limit);
  });
};

/**
 * Get an agent item by name
 * @param name Agent name
 * @returns Promise resolving to agent item or undefined
 */
export const getAgentItemByName = async (name: string): Promise<AgentItem | undefined> => {
  return loggedCanisterCall('getAgentItemByName', { name }, async () => {
    const result = await (await getActor()).get_agent_item_by_name(name);
    return result.length > 0 ? result[0] : undefined;
  });
};

/**
 * Add a new agent item
 * @param agentItem Agent item to add
 * @returns Promise resolving to result
 */
export const addAgentItem = async (agentItem: AgentItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addAgentItem', { agentItem }, async () => {
    return (await getActor()).add_agent_item(agentItem);
  });
};

/**
 * Update an existing agent item
 * @param id Agent ID
 * @param agentItem Updated agent item
 * @returns Promise resolving to result
 */
export const updateAgentItem = async (id: bigint, agentItem: AgentItem): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('updateAgentItem', { id, agentItem }, async () => {
    return (await getActor()).update_agent_item(id, agentItem);
  });
};
