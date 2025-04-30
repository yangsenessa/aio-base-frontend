import axios from 'axios';
import { SERVER_PATHS, API_CONFIG } from './api/apiConfig';

// Setup logger for file operations
const logFileOp = (operation: string, message: string, data?: any) => {
  if (data) {
    console.log(`[FILE_SERVICE][${operation}] ${message}`, data);
  } else {
    console.log(`[FILE_SERVICE][${operation}] ${message}`);
  }
};

// Response interfaces
export interface FileUploadResponse {
  success: boolean;
  filepath?: string;
  filename?: string;
  downloadUrl?: string;
  message: string;
}

export interface FileDownloadResponse {
  success: boolean;
  data?: Blob;
  filename?: string;
  message: string;
}

/**
 * Creates axios instance with proper configuration for file operations
 */
const createFileServiceAxios = () => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept'
    },
    maxContentLength: 1024 * 1024 * 100, // 100MB max content length
    maxBodyLength: 1024 * 1024 * 100, // 100MB max body length
    timeout: 1800000, // 30 minutes timeout
    withCredentials: false // Don't send cookies for off-chain server
  });

  // Add request interceptor for content type handling
  instance.interceptors.request.use(
    (config) => {
      // Set appropriate Content-Type based on request type
      if (config.method?.toUpperCase() === 'POST' && config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      
      // Add CORS headers to every request
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Origin, Accept';
      
      // Log the request URL for debugging
      logFileOp('REQUEST', `Sending ${config.method?.toUpperCase()} request to off-chain server: ${config.baseURL}${config.url}`, {
        method: config.method,
        headers: config.headers
      });
      
      return config;
    },
    (error) => {
      logFileOp('ERROR', 'Request interceptor error', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    response => {
      logFileOp('RESPONSE', 'Received successful response from off-chain server', {
        status: response.status,
        statusText: response.statusText,
        method: response.config.method
      });
      return response;
    },
    error => {
      if (error.response) {
        logFileOp('ERROR', `Server error response: ${error.response.status}`, {
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // The request was made but no response was received
        logFileOp('ERROR', 'No response received from server. This could be a CORS issue.', {
          request: error.request
        });
      }
      
      if (error.code === 'ERR_NETWORK') {
        logFileOp('ERROR', `Network error occurred. This might be a CORS issue.`, {
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        });
      }
      
      throw error;
    }
  );

  return instance;
};

/**
 * Uploads an executable file to external file service
 * @param file The file to upload
 * @param type Type of executable ('agent', 'mcp', or 'img')
 * @param customFilename Optional custom filename
 */
export const uploadExecutableFile = async (
  file: File,
  type: 'agent' | 'mcp' | 'img',
  customFilename?: string
): Promise<FileUploadResponse> => {
  logFileOp('UPLOAD', 'Starting file upload process', { 
    filename: file?.name, 
    size: file?.size, 
    type, 
    customFilename 
  });
  
  if (!file) {
    logFileOp('UPLOAD', 'Upload aborted: No file provided');
    return { success: false, message: 'No file provided' };
  }

  // Get target directory based on file type
  const targetDir = type === 'agent' 
    ? SERVER_PATHS.AGENT_EXEC_DIR 
    : type === 'mcp'
      ? SERVER_PATHS.MCP_EXEC_DIR
      : SERVER_PATHS.AGENT_EXEC_DIR;
  
  logFileOp('UPLOAD', `Target directory determined`, { targetDir, fileType: type });
  
  // Use custom filename or generate one with timestamp
  const filename = customFilename || `${type}-${Date.now()}-${file.name}`;
  logFileOp('UPLOAD', `Final filename determined`, { filename });

  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetDir', targetDir);
    formData.append('filename', filename);
    formData.append('fileType', type);
    
    logFileOp('UPLOAD', 'FormData created and populated');

    // Create axios instance with proper configuration
    const axiosInstance = createFileServiceAxios();
    
    logFileOp('UPLOAD', `Sending POST request to /upload/${type}`);
    
    const response = await axiosInstance.post(
      `/upload/${type}`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          logFileOp('UPLOAD', `Upload progress: ${percentCompleted}%`);
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

    logFileOp('UPLOAD', 'Received response from server', { 
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.status === 200 
        && response.statusText === 'OK' 
        && response.data) {
      // Get download URL for the uploaded file
      const filepath = response.data.path;
      logFileOp('UPLOAD', 'Upload successful, retrieving download URL', { filepath });
      
      const downloadUrl = await getFileDownloadUrl(filepath);
      logFileOp('UPLOAD', 'Got download URL', { downloadUrl });
      
      const result = {
        success: true,
        filepath: filepath,
        filename: response.data.filename,
        downloadUrl: downloadUrl,
        message: 'File uploaded successfully'
      };
      
      logFileOp('UPLOAD', 'Upload operation completed successfully', result);
      return result;
    } else {
      throw new Error(response.data?.message || 'Upload failed with unknown error');
    }
  } catch (error) {
    logFileOp('UPLOAD', 'Exception during upload', error);
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
};

/**
 * Downloads an executable file from external file service
 * @param filepath The path of the file to download
 */
export const downloadExecutableFile = async (
  filepath: string
): Promise<FileDownloadResponse> => {
  logFileOp('DOWNLOAD', 'Starting file download process', { filepath });
  
  if (!filepath) {
    logFileOp('DOWNLOAD', 'Download aborted: No filepath provided');
    return { success: false, message: 'No filepath provided' };
  }

  try {
    // Parse filepath to extract file information
    const pathParts = filepath.split('/');
    
    // Get the correct file type - don't just use the first path part
    // Look for mcp or agent in the path, default to last directory name before filename
    let fileType = 'unknown';
    if (filepath.includes('/mcp/')) {
      fileType = 'mcp';
    } else if (filepath.includes('/agent/')) {
      fileType = 'agent';
    } else {
      // If can't determine, use directory name
      fileType = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'unknown';
    }
    
    // Last part is the filename
    const filename = pathParts[pathParts.length - 1] || 'unknown';
    
    logFileOp('DOWNLOAD', 'Parsed filepath components', { fileType, filename, originalPath: filepath });
    
    // Use port 8001 for downloads as specified
    const downloadBaseUrl = import.meta.env.VITE_DOWNLOAD_BASE_URL || 'http://localhost:8001';
    
    // Construct the URL according to required pattern with correct type
    const downloadUrl = `${downloadBaseUrl}?type=${fileType}&filename=${encodeURIComponent(filename)}`;
    
    logFileOp('DOWNLOAD', `Sending GET request to ${downloadUrl}`);
    
    // Request file download using the new URL format
    const response = await axios.get(
      downloadUrl,
      {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          logFileOp('DOWNLOAD', `Download progress: ${percentCompleted}%`, { 
            loaded: progressEvent.loaded,
            total: progressEvent.total
          });
        }
      }
    );
    
    logFileOp('DOWNLOAD', 'Received response from server', { 
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length']
    });
    
    // Extract filename from headers if available, otherwise use the one from filepath
    const contentDisposition = response.headers['content-disposition'];
    logFileOp('DOWNLOAD', 'Processing content-disposition header', { contentDisposition });
    
    const downloadedFilename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : filename;
    
    logFileOp('DOWNLOAD', 'Determined filename for downloaded file', { downloadedFilename });
    
    const result = {
      success: true,
      data: response.data,
      filename: downloadedFilename,
      message: 'File downloaded successfully'
    };
    
    logFileOp('DOWNLOAD', 'Download operation completed successfully', { 
      filename: downloadedFilename,
      blobSize: response.data.size,
      blobType: response.data.type
    });
    
    return result;
  } catch (error) {
    logFileOp('DOWNLOAD', 'Exception during download', error);
    console.error('Error downloading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to download file'
    };
  }
};

/**
 * Checks if a file exists on the external file service
 * @param filepath The path of the file to check
 */
export const checkFileExists = async (filepath: string): Promise<boolean> => {
  logFileOp('CHECK_EXISTS', 'Starting file existence check', { filepath });
  
  try {
    logFileOp('CHECK_EXISTS', `Sending GET request to ${API_CONFIG.FULL_BASE_URL}/exists`);
    
    // Check if file exists via service API
    const response = await axios.get(`${API_CONFIG.FULL_BASE_URL}/exists`, {
      params: { filepath }
    });
    
    const exists = response.data.exists === true;
    logFileOp('CHECK_EXISTS', `File existence check result: ${exists ? 'File exists' : 'File does not exist'}`, {
      responseStatus: response.status,
      responseData: response.data
    });
    
    return exists;
  } catch (error) {
    logFileOp('CHECK_EXISTS', 'Exception during file existence check', error);
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Gets a direct download URL for a file from the external service
 * @param filepath The path of the file
 */
export const getFileDownloadUrl = async (filepath: string): Promise<string> => {
  logFileOp('GET_URL', 'Starting to get download URL', { filepath });
  
  if (!filepath) {
    logFileOp('GET_URL', 'No filepath provided, returning empty URL');
    return '';
  }
  
  try {
    // Parse filepath to extract file information
    const pathParts = filepath.split('/');
    
    // Get the correct file type - don't just use the first path part
    // Look for mcp or agent in the path, default to last directory name before filename
    let fileType = 'unknown';
    if (filepath.includes('/mcp/')) {
      fileType = 'mcp';
    } else if (filepath.includes('/agent/')) {
      fileType = 'agent';
    } else {
      // If can't determine, use directory name
      fileType = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'unknown';
    }
    
    // Last part is the filename
    const filename = pathParts[pathParts.length - 1] || 'unknown';
    
    logFileOp('GET_URL', 'Parsed filepath components', { fileType, filename, originalPath: filepath });
    
    // Use direct HTTP URL for downloads
    const url = `${API_CONFIG.FULL_BASE_URL}/download?type=${fileType}&filename=${encodeURIComponent(filename)}`;
    
    logFileOp('GET_URL', 'Created direct download URL', { url });
    
    return url;
  } catch (error) {
    logFileOp('GET_URL', 'Exception while constructing download URL', error);
    console.error('Error creating download URL:', error);
    
    // Return basic fallback URL in case of error - using direct HTTP
    const fallbackUrl = `${API_CONFIG.FULL_BASE_URL}/download?filepath=${encodeURIComponent(filepath)}`;
    logFileOp('GET_URL', 'Using fallback URL format', { fallbackUrl });
    
    return fallbackUrl;
  }
};
