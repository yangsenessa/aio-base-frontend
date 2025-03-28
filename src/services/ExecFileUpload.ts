import axios from 'a/fixxios';
import { SERVER_PATHS } from './apiService';

// Define server endpoint for file operations
const FILE_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? '/api/files' 
  : 'http://localhost:3001/api/files';

// Response interfaces
export interface FileUploadResponse {
  success: boolean;
  filepath?: string;
  filename?: string;
  message: string;
}

export interface FileDownloadResponse {
  success: boolean;
  data?: Blob;
  filename?: string;
  message: string;
}

/**
 * Uploads an executable file to the server
 * @param file The file to upload
 * @param type Type of executable ('agent' or 'mcp')
 * @param customFilename Optional custom filename
 */
export const uploadExecutableFile = async (
  file: File,
  type: 'agent' | 'mcp',
  customFilename?: string
): Promise<FileUploadResponse> => {
  if (!file) {
    return { success: false, message: 'No file provided' };
  }

  // Get target directory based on file type
  const targetDir = type === 'agent' 
    ? SERVER_PATHS.AGENT_EXEC_DIR 
    : SERVER_PATHS.MCP_EXEC_DIR;
  
  // Use custom filename or generate one with timestamp
  const filename = customFilename || `${type}-${Date.now()}-${file.name}`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetDir', targetDir);
  formData.append('filename', filename);

  try {
    const response = await axios.post(`${FILE_SERVER_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        filepath: response.data.filepath,
        filename: response.data.filename,
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
 * Downloads an executable file from the server
 * @param filepath The server path of the file to download
 */
export const downloadExecutableFile = async (
  filepath: string
): Promise<FileDownloadResponse> => {
  if (!filepath) {
    return { success: false, message: 'No filepath provided' };
  }

  try {
    const response = await axios.get(`${FILE_SERVER_URL}/download`, {
      params: { filepath },
      responseType: 'blob'
    });

    // Extract filename from path
    const pathParts = filepath.split('/');
    const filename = pathParts[pathParts.length - 1];

    return {
      success: true,
      data: response.data,
      filename,
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
 * Checks if a file exists on the server
 * @param filepath The server path of the file to check
 */
export const checkFileExists = async (filepath: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${FILE_SERVER_URL}/exists`, {
      params: { filepath }
    });
    return response.data.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Gets a direct download URL for a file
 * @param filepath The server path of the file
 */
export const getFileDownloadUrl = (filepath: string): string => {
  return `${FILE_SERVER_URL}/download?filepath=${encodeURIComponent(filepath)}`;
};
