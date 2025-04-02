import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { SERVER_PATHS } from './api/apiConfig';

// AIO-MCP Service API base URL
const API_BASE_URL = import.meta.env.VITE_AIO_MCP_API_URL || 'http://localhost:4943/api/v1';

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
  result?: any;
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
 * Uploads an executable file to AIO-MCP server
 * @param file The file to upload
 * @param fileType Type of executable ('agent' or 'mcp')
 * @param customFilename Optional custom filename
 */
export const uploadExecutableFile = async (
  file: File,
  fileType: FileType,
  customFilename?: string
): Promise<FileUploadResponse> => {
  if (!file) {
    return { success: false, message: 'No file provided' };
  }

  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    if (customFilename) {
      formData.append('custom_filename', customFilename);
    }

    // Send file to AIO-MCP server
    const response = await axios.post(
      `${API_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        filepath: response.data.filepath,
        filename: response.data.filename,
        download_url: response.data.download_url,
        message: 'File uploaded successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to upload file'
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
};

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

    const response = await axios.get(`${API_BASE_URL}/files`, {
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
 * Gets details of a specific file
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 */
export const getFileDetails = async (
  fileType: FileType,
  filename: string
): Promise<FileDetailsResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/files/${fileType}/${encodeURIComponent(filename)}`
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        ...response.data,
        message: 'File details retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to retrieve file details'
      };
    }
  } catch (error) {
    console.error('Error getting file details:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get file details'
    };
  }
};

/**
 * Deletes a file from the server
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 */
export const deleteFile = async (
  fileType: FileType,
  filename: string
): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/files/${fileType}/${encodeURIComponent(filename)}`
    );

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to delete file'
      };
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
};

/**
 * Downloads a file from the server
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 */
export const downloadFile = async (
  fileType: FileType,
  filename: string
): Promise<FileDownloadResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/files/${fileType}/${encodeURIComponent(filename)}/download`,
      { responseType: 'blob' }
    );
    
    // Extract filename from content-disposition header or use the provided filename
    const contentDisposition = response.headers['content-disposition'];
    const extractedFilename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
      : filename;
    
    return {
      success: true,
      data: response.data,
      filename: extractedFilename,
      content_type: response.headers['content-type'],
      message: 'File downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to download file'
    };
  }
};

/**
 * Executes a file on the server
 * @param params Execution parameters
 */
export const executeFile = async (
  params: ExecutionParams
): Promise<ExecutionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/execute`, params);

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        execution_id: response.data.execution_id,
        stdout: response.data.stdout,
        stderr: response.data.stderr,
        exit_code: response.data.exit_code,
        runtime_ms: response.data.runtime_ms,
        message: 'File executed successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to execute file'
      };
    }
  } catch (error) {
    console.error('Error executing file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute file'
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
 */
export const executeRpc = async (
  fileType: FileType,
  filename: string,
  method: string,
  params?: any,
  id?: string | number
): Promise<JsonRpcResponse> => {
  const requestId = id || Date.now();
  
  const rpcRequest: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestId
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/rpc/${fileType}/${encodeURIComponent(filename)}`,
      rpcRequest
    );

    // Return the RPC response directly
    return response.data;
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

/**
 * Checks if a file exists on the server
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 */
export const checkFileExists = async (
  fileType: FileType,
  filename: string
): Promise<boolean> => {
  try {
    const response = await axios.head(
      `${API_BASE_URL}/files/${fileType}/${encodeURIComponent(filename)}`
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Gets a direct download URL for a file
 * @param fileType Type of file ('agent' or 'mcp')
 * @param filename Name of the file
 */
export const getFileDownloadUrl = async (
  fileType: FileType,
  filename: string
): Promise<string> => {
  try {
    // Get file details which includes download_url
    const details = await getFileDetails(fileType, filename);
    if (details.success && details.download_url) {
      return details.download_url;
    }
    throw new Error('Download URL not available');
  } catch (error) {
    console.error('Error getting file download URL:', error);
    // Return direct download endpoint as fallback
    return `${API_BASE_URL}/files/${fileType}/${encodeURIComponent(filename)}/download`;
  }
};

// Legacy function for backward compatibility
export const downloadExecutableFile = async (
  filepath: string
): Promise<FileDownloadResponse> => {
  if (!filepath) {
    return { success: false, message: 'No filepath provided' };
  }

  // Extract file type and filename from filepath
  const parts = filepath.split('/');
  if (parts.length < 2) {
    return { success: false, message: 'Invalid filepath format' };
  }

  const filename = parts[parts.length - 1];
  const fileType: FileType = (parts.includes('agent') ? 'agent' : 'mcp');

  return downloadFile(fileType, filename);
};
