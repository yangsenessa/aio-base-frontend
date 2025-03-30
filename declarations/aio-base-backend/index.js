
import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./aio-base-backend.did.js";
export { idlFactory } from "./aio-base-backend.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */

// Define a safer way to access environment variables that works in browsers
const getEnvVar = (name) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  return undefined;
};

export const canisterId = getEnvVar("CANISTER_ID_AIO_BASE_BACKEND") || 
  (typeof process !== 'undefined' ? process.env.CANISTER_ID_AIO_BASE_BACKEND : undefined) || 
  (typeof window !== 'undefined' && window.__CANISTER_ID_AIO_BASE_BACKEND) || 
  "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Fallback to production canister if not specified

export const createActor = (canisterId, options = {}) => {
  const agent = options.agent || new HttpAgent({ 
    ...options.agentOptions,
    host: (typeof process !== 'undefined' && process.env.DFX_NETWORK !== "ic") ||
          (typeof import.meta !== 'undefined' && import.meta.env.VITE_DFX_NETWORK !== "ic")
      ? "http://localhost:8000"
      : "https://ic0.app",
  });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if ((typeof process !== 'undefined' && process.env.DFX_NETWORK !== "ic") ||
      (typeof import.meta !== 'undefined' && import.meta.env.VITE_DFX_NETWORK !== "ic")) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

// Fallback approach to determine if we're in development
const isDevelopment = () => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return true;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env.DEV) {
    return true;
  }
  if (typeof location !== 'undefined' && location.hostname.includes('localhost')) {
    return true;
  }
  return false;
};

// Conditionally load the development canister ID
if (isDevelopment()) {
  if (typeof window !== 'undefined') {
    window.__CANISTER_ID_AIO_BASE_BACKEND = window.__CANISTER_ID_AIO_BASE_BACKEND || "rrkah-fqaaa-aaaaa-aaaaq-cai";
  }
}

export const aio_base_backend = canisterId ? createActor(canisterId) : undefined;
