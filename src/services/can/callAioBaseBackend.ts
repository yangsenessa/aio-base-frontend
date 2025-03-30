
import { idlFactory as aioBaseBackend } from '../../declarations/aio-base-backend';
import { isLocalNet, getCanisterId } from '@/util/env';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { plugStorage } from '@/lib/plug-wallet';
import type { 
  AgentItem, 
  McpItem, 
  TraceItem, 
  _SERVICE 
} from '../../declarations/aio-base-backend/aio-base-backend.did.d.ts';

// Canister IDs - replace with actual values for your environment
const CANISTER_ID = {
  LOCAL: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // Example local canister ID
  PROD: 'ryjl3-tyaaa-aaaaa-aaaba-cai',  // Example production canister ID
};

// Get the appropriate canister ID based on environment
const canisterId = getCanisterId(CANISTER_ID.LOCAL, CANISTER_ID.PROD);

// Identity provider URL
const IDENTITY_PROVIDER = isLocalNet()
  ? `http://localhost:4943` 
  : "https://identity.ic0.app";

// Actor singleton for re-use
let actor: ActorSubclass<_SERVICE> | null = null;
let authClient: AuthClient | null = null;

// Add logging utilities
const logger = {
  info: (context: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][INFO][${context}] ${message}`, data || '');
  },
  error: (context: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}][ERROR][${context}] ${message}`, error || '');
  },
  debug: (context: string, message: string, data?: any) => {
    if (import.meta.env.DEV) {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}][DEBUG][${context}] ${message}`, data || '');
    }
  }
};

// Initialize and get the actor with authentication
const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  if (actor) {
    logger.debug('getActor', 'Returning existing actor instance');
    return actor;
  }
  
  logger.info('getActor', 'Creating new actor instance');
  
  // Check if user is connected with Plug wallet
  const plugPrincipalId = plugStorage.getPrincipal();
  let agent: HttpAgent;
  
  if (plugPrincipalId && window.ic?.plug) {
    logger.info('getActor', 'Attempting to use Plug wallet', { plugPrincipalId });
    
    try {
      logger.debug('getActor', 'Creating agent with Plug wallet', { 
        whitelist: [canisterId],
        host: isLocalNet() ? 'http://localhost:8000' : 'https://ic0.app'
      });
      
      await window.ic.plug.createAgent({
        whitelist: [canisterId],
        host: isLocalNet() ? 'http://localhost:8000' : 'https://ic0.app'
      });
      
      // Since window.ic.plug.agent might not be defined in the type, we need to use a different approach
      const plugAgent = window.ic.plug as any;
      if (!plugAgent.agent) {
        throw new Error("Plug agent not available after createAgent");
      }
      
      agent = plugAgent.agent;
      logger.info('getActor', 'Successfully created agent with Plug wallet');
    } catch (error) {
      logger.error('getActor', 'Error creating agent with Plug wallet', error);
      // Fall back to standard authentication
      logger.info('getActor', 'Falling back to standard authentication');
      authClient = await AuthClient.create();
      agent = new HttpAgent({
        host: isLocalNet() ? 'http://localhost:8000' : 'https://ic0.app',
        identity: authClient.getIdentity(),
      });
      logger.info('getActor', 'Successfully created fallback agent');
    }
  } else {
    // Standard authentication
    logger.info('getActor', 'Using standard authentication (no Plug wallet detected)');
    authClient = await AuthClient.create();
    agent = new HttpAgent({
      host: isLocalNet() ? 'http://localhost:8000' : 'https://ic0.app',
      identity: authClient.getIdentity(),
    });
    logger.info('getActor', 'Successfully created agent with standard authentication');
  }

  if (isLocalNet()) {
    logger.debug('getActor', 'Fetching root key (local development)');
    await agent.fetchRootKey();
  }

  logger.info('getActor', `Creating actor with canister ID: ${canisterId}`);
  actor = Actor.createActor<_SERVICE>(aioBaseBackend, {
    agent,
    canisterId,
  });

  return actor;
};

// Wrapper function for canister calls to add logging
const loggedCanisterCall = async <T>(
  functionName: string, 
  params: any, 
  callFn: () => Promise<T>
): Promise<T> => {
  logger.debug(functionName, 'Calling canister function', params);
  
  try {
    const result = await callFn();
    logger.debug(functionName, 'Canister call successful', { result });
    return result;
  } catch (error) {
    logger.error(functionName, 'Canister call failed', error);
    throw error;
  }
};

// --- Agent Item Operations ---

export const getAgentItem = async (id: bigint): Promise<AgentItem | undefined> => {
  return loggedCanisterCall('getAgentItem', { id }, async () => {
    const result = await (await getActor()).get_agent_item(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const getAllAgentItems = async (): Promise<AgentItem[]> => {
  return loggedCanisterCall('getAllAgentItems', {}, async () => {
    return (await getActor()).get_all_agent_items();
  });
};

export const getUserAgentItems = async (): Promise<AgentItem[]> => {
  return loggedCanisterCall('getUserAgentItems', {}, async () => {
    return (await getActor()).get_user_agent_items();
  });
};

export const getUserAgentItemsPaginated = async (offset: bigint, limit: bigint): Promise<AgentItem[]> => {
  return loggedCanisterCall('getUserAgentItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_user_agent_items_paginated(offset, limit);
  });
};

export const getAgentItemsPaginated = async (offset: bigint, limit: bigint): Promise<AgentItem[]> => {
  return loggedCanisterCall('getAgentItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_agent_items_paginated(offset, limit);
  });
};

export const getAgentItemByName = async (name: string): Promise<AgentItem | undefined> => {
  return loggedCanisterCall('getAgentItemByName', { name }, async () => {
    const result = await (await getActor()).get_agent_item_by_name(name);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const addAgentItem = async (agentItem: AgentItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addAgentItem', { agentItem }, async () => {
    return (await getActor()).add_agent_item(agentItem);
  });
};

export const updateAgentItem = async (id: bigint, agentItem: AgentItem): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('updateAgentItem', { id, agentItem }, async () => {
    return (await getActor()).update_agent_item(id, agentItem);
  });
};

// --- MCP Item Operations ---

export const getMcpItem = async (id: bigint): Promise<McpItem | undefined> => {
  return loggedCanisterCall('getMcpItem', { id }, async () => {
    const result = await (await getActor()).get_mcp_item(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const getAllMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getAllMcpItems', {}, async () => {
    return (await getActor()).get_all_mcp_items();
  });
};

export const getUserMcpItems = async (): Promise<McpItem[]> => {
  return loggedCanisterCall('getUserMcpItems', {}, async () => {
    return (await getActor()).get_user_mcp_items();
  });
};

export const getUserMcpItemsPaginated = async (offset: bigint, limit: bigint): Promise<McpItem[]> => {
  return loggedCanisterCall('getUserMcpItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_user_mcp_items_paginated(offset, limit);
  });
};

export const getMcpItemsPaginated = async (offset: bigint, limit: bigint): Promise<McpItem[]> => {
  return loggedCanisterCall('getMcpItemsPaginated', { offset, limit }, async () => {
    return (await getActor()).get_mcp_items_paginated(offset, limit);
  });
};

export const getMcpItemByName = async (name: string): Promise<McpItem | undefined> => {
  return loggedCanisterCall('getMcpItemByName', { name }, async () => {
    const result = await (await getActor()).get_mcp_item_by_name(name);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const addMcpItem = async (mcpItem: McpItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addMcpItem', { mcpItem }, async () => {
    return (await getActor()).add_mcp_item(mcpItem);
  });
};

export const updateMcpItem = async (id: bigint, mcpItem: McpItem): Promise<{Ok: null} | {Err: string}> => {
  return loggedCanisterCall('updateMcpItem', { id, mcpItem }, async () => {
    return (await getActor()).update_mcp_item(id, mcpItem);
  });
};

// --- Trace Operations ---

export const getTrace = async (id: bigint): Promise<TraceItem | undefined> => {
  return loggedCanisterCall('getTrace', { id }, async () => {
    const result = await (await getActor()).get_trace(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const getTraceById = async (id: string): Promise<TraceItem | undefined> => {
  return loggedCanisterCall('getTraceById', { id }, async () => {
    const result = await (await getActor()).get_trace_by_id(id);
    return result.length > 0 ? result[0] : undefined;
  });
};

export const getUserTraces = async (): Promise<TraceItem[]> => {
  return loggedCanisterCall('getUserTraces', {}, async () => {
    return (await getActor()).get_user_traces();
  });
};

export const getUserTracesPaginated = async (offset: bigint, limit: bigint): Promise<TraceItem[]> => {
  return loggedCanisterCall('getUserTracesPaginated', { offset, limit }, async () => {
    return (await getActor()).get_user_traces_paginated(offset, limit);
  });
};

export const getTracesPaginated = async (offset: bigint, limit: bigint): Promise<TraceItem[]> => {
  return loggedCanisterCall('getTracesPaginated', { offset, limit }, async () => {
    return (await getActor()).get_traces_paginated(offset, limit);
  });
};

export const addTrace = async (traceItem: TraceItem): Promise<{Ok: bigint} | {Err: string}> => {
  return loggedCanisterCall('addTrace', { traceItem }, async () => {
    return (await getActor()).add_trace(traceItem);
  });
};

// --- Misc Operations ---

export const greet = async (name: string): Promise<string> => {
  return loggedCanisterCall('greet', { name }, async () => {
    return (await getActor()).greet(name);
  });
};


