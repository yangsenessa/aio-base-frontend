
// Core API configuration and utilities

// Get environment variables with fallbacks
const getEnvVar = (name: string, fallback: string): string => {
  return import.meta.env[name] || fallback;
};

// Off-chain server configuration
const OFF_CHAIN_SERVER = {
  HOST: getEnvVar('VITE_AIO_MCP_API_URL', 'http://8.141.81.75').replace(/^https?:\/\//, ''),
  FILE_PORT: 8001,
  RPC_PORT: 8000
};

// Extract host without protocol
const getHostWithoutProtocol = (url: string): string => {
  return url.replace(/^https?:\/\//, '').split(':')[0];
};

// API Base URL configuration
export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_FILE_SERVICE_URL', `http://${OFF_CHAIN_SERVER.HOST}:${OFF_CHAIN_SERVER.FILE_PORT}`),
  API_VERSION: 'v1',
  get FULL_BASE_URL() {
    return this.BASE_URL;
  },
  get RPC_BASE_URL() {
    return getEnvVar('VITE_AIO_MCP_API_URL', `http://${OFF_CHAIN_SERVER.HOST}:${OFF_CHAIN_SERVER.RPC_PORT}/api/${this.API_VERSION}`);
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // Add new method to construct full upload URLs
  getFullUploadUrl(type: 'mcp' | 'agent'): string {
    return `${this.BASE_URL}${this.ENDPOINTS.UPLOAD[type]}`;
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
