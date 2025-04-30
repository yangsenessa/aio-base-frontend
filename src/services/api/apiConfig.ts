
// Core API configuration and utilities

// Off-chain server configuration
const OFF_CHAIN_SERVER = {
  HOST: '8.141.81.75',
  FILE_PORT: 8001,
  RPC_PORT: 8000
};

// API Base URL configuration
export const API_CONFIG = {
  BASE_URL: `http://${OFF_CHAIN_SERVER.HOST}:${OFF_CHAIN_SERVER.FILE_PORT}`,
  API_VERSION: 'v1',
  get FULL_BASE_URL() {
    return this.BASE_URL;
  },
  get RPC_BASE_URL() {
    return `http://${OFF_CHAIN_SERVER.HOST}:${OFF_CHAIN_SERVER.RPC_PORT}/api/${this.API_VERSION}`;
  },
  ENDPOINTS: {
    UPLOAD: {
      MCP: '/upload/mcp',
      AGENT: '/upload/agent',
    },
    RPC: '/api/v1',
    FILES: '/files',
  },
  HEADERS: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept'
  }
};

// Flag to toggle between mock API and real ICP Canister calls
export const setUseMockApi = (usesMock: boolean): void => {
  localStorage.setItem('useMockApi', usesMock.toString());
};

export const isUsingMockApi = (): boolean => {
  return localStorage.getItem('useMockApi') === 'true';
};

// Define the server-side directories where executables will be stored
export const SERVER_PATHS = {
  AGENT_EXEC_DIR: '/opt/aio/agents',
  MCP_EXEC_DIR: '/opt/aio/mcp-servers',
  AGENT_IMAGE_DIR: '/opt/aio/agent-images',
};
