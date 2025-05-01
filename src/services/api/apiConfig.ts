import axios, { AxiosHeaders } from 'axios';

// Core API configuration and utilities

// Get environment variables with fallbacks
const getEnvVar = (name: string, fallback: string): string => {
  return import.meta.env[name] || fallback;
};

// Configure axios defaults
const axiosInstance = axios.create({
  timeout: 300000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data'
  }
});

// Configure axios to accept self-signed certificates
axiosInstance.interceptors.request.use((config) => {
  return {
    ...config,
    httpsAgent: {
      rejectUnauthorized: false
    }
  };
});

// Export the configured axios instance
export { axiosInstance };

// API Base URL configuration
export const API_CONFIG = {
  // Use complete URLs from environment variables
  BASE_URL: getEnvVar('VITE_AIO_MCP_FILE_URL', 'https://localhost:8001'),
  API_VERSION: 'v1',
  get FULL_BASE_URL() {
    return this.BASE_URL;
  },
  get RPC_BASE_URL() {
    return getEnvVar('VITE_AIO_MCP_API_URL', 'https://localhost:8000');
  },
  ENDPOINTS: {
    UPLOAD: {
      MCP: '/upload/mcp',
      AGENT: '/upload/agent',
      IMG: '/upload/img'
    },
    RPC: '/api/v1',
    FILES: '/files',
  },
  HEADERS: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json'
  },
  getFullUploadUrl(type: 'mcp' | 'agent' | 'img'): string {
    return `${this.BASE_URL}${this.ENDPOINTS.UPLOAD[type.toUpperCase() as keyof typeof this.ENDPOINTS.UPLOAD] || this.ENDPOINTS.UPLOAD.AGENT}`;
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
