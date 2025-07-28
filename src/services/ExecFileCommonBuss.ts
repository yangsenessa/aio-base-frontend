import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { SERVER_PATHS, API_CONFIG } from './api/apiConfig';

// Create axios instance that enforces HTTP
const httpAxios = axios.create({
  baseURL: API_CONFIG.FULL_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Ensure requests use appropriate protocol
httpAxios.interceptors.request.use((config) => {
  // No longer force HTTP, allow HTTPS for production
  return config;
});

// Add response interceptor to handle CORS
httpAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 0) {
      // This is likely a CORS error
      console.error('CORS Error:', error);
      throw new Error('CORS Error: Unable to access the server. Please ensure the server is configured to allow requests from this origin.');
    }
    return Promise.reject(error);
  }
);

// Export the HTTP-enforcing axios instance
export const mcpApiClient = httpAxios;

// Supported file types - Added 'img' as a valid type
export type FileType = 'agent' | 'mcp' | 'img';

// Common response interface
interface ApiResponse {
  success: boolean;
  message: string;
}

// File response interfaces
export interface FileUploadResponse extends ApiResponse {
  filepath?: string;
  filename?: string;
  download_url?: string;
}

export interface FileDownloadResponse extends ApiResponse {
  data?: Blob;
  filename?: string;
  content_type?: string;
}

export interface FileDetailsResponse extends ApiResponse {
  file_id?: string;
  filename?: string;
  file_type?: FileType;
  file_size?: number;
  created_at?: string;
  filepath?: string;
  download_url?: string;
}

export interface FileListResponse extends ApiResponse {
  files?: FileDetailsResponse[];
  total_count?: number;
  page?: number;
  page_size?: number;
}

// Execution response interfaces
export interface ExecutionResponse extends ApiResponse {
  execution_id?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  runtime_ms?: number;
}

// JSON-RPC interfaces
export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id: string | number;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0',
  output?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// Execution parameters
export interface ExecutionParams {
  filepath: string;
  arguments?: string[];
  stdin_data?: string;
  timeout?: number;
  environment?: Record<string, string>;
}


/**
 * Lists all files of a specific type with pagination
 * @param fileType Type of files to list ('agent' or 'mcp')
 * @param params Pagination parameters
 */
export const listFiles = async (
  fileType?: FileType,
  params?: PaginationParams
): Promise<FileListResponse> => {
  try {
    const queryParams: Record<string, any> = { ...params };
    if (fileType) {
      queryParams.file_type = fileType;
    }

    const response = await httpAxios.get(API_CONFIG.ENDPOINTS.FILES, {
      params: queryParams
    });

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        files: response.data.files,
        total_count: response.data.total_count,
        page: response.data.page,
        page_size: response.data.page_size,
        message: 'Files retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to retrieve files'
      };
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to list files'
    };
  }
};

/**
 * Executes a remote procedure call on a file
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 * @param method RPC method name
 * @param params Parameters for the RPC method
 * @param id Request ID (optional, defaults to timestamp)
 * @param timeout Optional timeout in seconds (default 30)
 */
export const executeRpc = async (
  fileType: FileType,
  filename: string,
  method: string,
  params?: any,
  id?: string | number,
  timeout: number = 30
): Promise<JsonRpcResponse> => {
  const requestId = id || Date.now();
  
  const rpcRequest: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestId
  };
  console.log(`[executeRpc] RPC Request:`, JSON.stringify(rpcRequest, null, 2));

  try {
    // Check if running in production environment
    const isProduction = import.meta.env.PROD || window.location.protocol === 'https:';
    
    let baseUrl;
    if (isProduction) {
      // Production environment uses remote MCP service directly with HTTPS
      baseUrl = 'https://mcp.aio2030.fun/api/v1/rpc';
      console.log(`[executeRpc] Using production MCP server: ${baseUrl}`);
    } else {
      // Development environment uses environment variables with HTTPS fallback
      baseUrl = import.meta.env.VITE_AIO_MCP_API_URL.replace(/\/+$/, '');
      
      // Ensure HTTPS for development environment too
      if (baseUrl.startsWith('http://')) {
        baseUrl = baseUrl.replace('http://', 'https://');
        console.log(`[executeRpc] Converted HTTP to HTTPS for development: ${baseUrl}`);
      }
      console.log(`[executeRpc] Using URL: ${baseUrl}`);
    }
    
    // Construct endpoint - handle both base URL and full URL with path
    let endpoint;
    if (baseUrl.includes('/api/v1/rpc')) {
      // If URL already contains the API path, just append the file path
      endpoint = `${baseUrl}/${fileType}/${encodeURIComponent(filename)}`;
    } else {
      // If URL is just the base, construct the full path
      endpoint = `${baseUrl}/api/v1/rpc/${fileType}/${encodeURIComponent(filename)}`;
    }
    
    console.log('[executeRpc] Calling URL:', endpoint);
    console.log('[executeRpc] Request:', rpcRequest);

    const response = await httpAxios.post(endpoint, rpcRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        timeout: timeout
      }
    });

    if (!response.data) {
      throw new Error('Empty response received from server');
    }

    // Return the RPC response directly
    return response.data.result?response.data.result:response.data;
  } catch (error) {
    console.error('Error executing RPC:', error);
    
    // Construct error response in JSON-RPC format
    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : 'RPC execution failed',
        data: error
      },
      id: requestId
    };
  }
};

