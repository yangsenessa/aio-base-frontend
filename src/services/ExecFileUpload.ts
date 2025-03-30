import axios from 'axios';
import { SERVER_PATHS } from './api/apiConfig';

// File service API base URL
const FILE_SERVICE_URL = import.meta.env.VITE_FILE_SERVICE_URL || 'https://file-service.example.com/api';

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
 * Uploads an executable file to external file service
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

  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetDir', targetDir);
    formData.append('filename', filename);
    formData.append('fileType', type);

    // Send file to external service
    const response = await axios.post(
      `${FILE_SERVICE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.status === 200 && response.data.success) {
      // Get download URL for the uploaded file
      const filepath = response.data.filepath;
      const downloadUrl = await getFileDownloadUrl(filepath);
      
      return {
        success: true,
        filepath: filepath,
        filename: response.data.filename,
        downloadUrl: downloadUrl,
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
 * Downloads an executable file from external file service
 * @param filepath The path of the file to download
 */
export const downloadExecutableFile = async (
  filepath: string
): Promise<FileDownloadResponse> => {
  if (!filepath) {
    return { success: false, message: 'No filepath provided' };
  }

  try {
    // Request file download from service
    const response = await axios.get(
      `${FILE_SERVICE_URL}/download`, 
      {
        params: { filepath },
        responseType: 'blob'
      }
    );
    
    // Extract filename from path or from headers
    const filename = response.headers['content-disposition']
      ? response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
      : filepath.split('/').pop() || 'download';
    
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
 * Checks if a file exists on the external file service
 * @param filepath The path of the file to check
 */
export const checkFileExists = async (filepath: string): Promise<boolean> => {
  try {
    // Check if file exists via service API
    const response = await axios.get(`${FILE_SERVICE_URL}/exists`, {
      params: { filepath }
    });
    
    return response.data.exists === true;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Gets a direct download URL for a file from the external service
 * @param filepath The path of the file
 */
export const getFileDownloadUrl = async (filepath: string): Promise<string> => {
  try {
    // Get signed URL from service
    const response = await axios.get(`${FILE_SERVICE_URL}/url`, {
      params: { filepath }
    });
    
    return response.data.url;
  } catch (error) {
    console.error('Error getting file download URL:', error);
    // Return direct download endpoint as fallback
    return `${FILE_SERVICE_URL}/download?filepath=${encodeURIComponent(filepath)}`;
  }
};
