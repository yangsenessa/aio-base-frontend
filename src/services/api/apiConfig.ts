
// Core API configuration and utilities

// Flag to toggle between mock API and real ICP Canister calls
let useMockApi = true;

// Define the server-side directories where executables will be stored
export const SERVER_PATHS = {
  AGENT_EXEC_DIR: '/opt/aio/agents',
  MCP_EXEC_DIR: '/opt/aio/mcp-servers'
};

/**
 * Configure whether to use mock API or real ICP canister calls
 * @param usesMock Boolean flag to toggle mock API
 */
export const setUseMockApi = (usesMock: boolean): void => {
  useMockApi = usesMock;
  console.log(`API Service using ${useMockApi ? 'mock' : 'ICP Canister'} data`);
};

/**
 * Check if the API is currently using mock data
 * @returns Boolean indicating if mock API is in use
 */
export const isUsingMockApi = (): boolean => {
  return useMockApi;
};
