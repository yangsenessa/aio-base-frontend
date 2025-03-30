
// Helper functions for environment-related utilities

/**
 * Determines if we're running in the local network environment
 */
export const isLocalNet = (): boolean => {
  return typeof import.meta !== 'undefined' ? 
    import.meta.env.VITE_DFX_NETWORK === 'local' : 
    (typeof process !== 'undefined' ? 
      process.env.DFX_NETWORK === 'local' : 
      false);
};

/**
 * Gets a canister ID based on the current environment
 * @param localId The canister ID for local development
 * @param prodId The canister ID for production
 */
export const getCanisterId = (localId: string, prodId: string): string => {
  return isLocalNet() ? localId : prodId;
};

/**
 * Gets an environment variable safely
 * @param name The name of the environment variable
 * @param defaultValue Optional default value if not found
 */
export const getEnvVar = (name: string, defaultValue: string = ''): string => {
  return typeof import.meta !== 'undefined' ? 
    (import.meta.env[name] || defaultValue) : 
    (typeof process !== 'undefined' ? 
      (process.env[name] || defaultValue) : 
      defaultValue);
};
