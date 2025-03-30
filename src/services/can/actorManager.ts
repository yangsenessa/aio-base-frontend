
import { Actor, HttpAgent, ActorSubclass } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory as aioBaseBackend } from "declarations/aio-base-backend";
import { isLocalNet, getCanisterId } from "@/util/env";
import { plugStorage } from "@/lib/plug-wallet";
import type { _SERVICE } from "declarations/aio-base-backend/aio-base-backend.did.d.ts";
import { logger } from "./callUtils";

// Canister IDs - replace with actual values for your environment
const CANISTER_ID = {
  LOCAL: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // Example local canister ID
  PROD: 'ryjl3-tyaaa-aaaaa-aaaba-cai',  // Example production canister ID
};

// Identity provider URL
const IDENTITY_PROVIDER = isLocalNet()
  ? `http://localhost:4943` 
  : "https://identity.ic0.app";

// IC hosts for different environments
const IC_HOST = {
  LOCAL: "http://localhost:8000",
  PROD: "https://ic0.app"
};

// Actor singleton for re-use
let actor: ActorSubclass<_SERVICE> | null = null;
let authClient: AuthClient | null = null;

/**
 * Initialize and get the actor with authentication
 * @returns Promise resolving to the actor
 */
export const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  if (actor) {
    logger.debug('getActor', 'Returning existing actor instance');
    return actor;
  }
  
  logger.info('getActor', 'Creating new actor instance');
  
  // Get canister ID based on environment
  const canisterId = getCanisterId(CANISTER_ID.LOCAL, CANISTER_ID.PROD);
  
  // Get host based on environment
  const host = isLocalNet() ? IC_HOST.LOCAL : IC_HOST.PROD;
  
  // Check if user is connected with Plug wallet
  const plugPrincipalId = plugStorage.getPrincipal();
  let agent: HttpAgent;
  
  if (plugPrincipalId && window.ic?.plug) {
    logger.info('getActor', 'Attempting to use Plug wallet', { plugPrincipalId });
    
    try {
      logger.debug('getActor', 'Creating agent with Plug wallet', { 
        whitelist: [canisterId],
        host: host
      });
      
      await window.ic.plug.createAgent({
        whitelist: [canisterId],
        host: host
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
        host: host,
        identity: authClient.getIdentity(),
      });
      logger.info('getActor', 'Successfully created fallback agent');
    }
  } else {
    // Standard authentication
    logger.info('getActor', 'Using standard authentication (no Plug wallet detected)');
    authClient = await AuthClient.create();
    agent = new HttpAgent({
      host: host,
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
