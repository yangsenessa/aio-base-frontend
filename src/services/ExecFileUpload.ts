import OSS from 'ali-oss';
import { SERVER_PATHS } from './apiService';

// Aliyun OSS Configuration
const ossConfig = {
  region: import.meta.env.VITE_OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: import.meta.env.VITE_OSS_ACCESS_KEY_ID || '',
  accessKeySecret: import.meta.env.VITE_OSS_ACCESS_KEY_SECRET || '',
  bucket: import.meta.env.VITE_OSS_BUCKET || 'open-collab-space',
};

// Initialize OSS client
const ossClient = new OSS(ossConfig);

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
 * Uploads an executable file to Aliyun OSS
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
  
  // Full path in OSS
  const ossPath = `${targetDir}/${filename}`;

  try {
    // Convert File to Buffer for OSS upload
    const buffer = await file.arrayBuffer();
    
    // Upload to OSS
    const result = await ossClient.put(ossPath, Buffer.from(buffer));
    
    if (result.res.status === 200) {
      return {
        success: true,
        filepath: ossPath,
        filename: filename,
        message: 'File uploaded successfully to OSS'
      };
    } else {
      return {
        success: false,
        message: 'Failed to upload file to OSS'
      };
    }
  } catch (error) {
    console.error('Error uploading file to OSS:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file to OSS'
    };
  }
};

/**
 * Downloads an executable file from Aliyun OSS
 * @param filepath The OSS path of the file to download
 */
export const downloadExecutableFile = async (
  filepath: string
): Promise<FileDownloadResponse> => {
  if (!filepath) {
    return { success: false, message: 'No filepath provided' };
  }

  try {
    // Get the file from OSS
    const result = await ossClient.get(filepath);
    
    // Extract filename from path
    const pathParts = filepath.split('/');
    const filename = pathParts[pathParts.length - 1];
    
    // Convert response to Blob
    const blob = new Blob([result.content], { 
      type: 'application/octet-stream' 
    });

    return {
      success: true,
      data: blob,
      filename,
      message: 'File downloaded successfully from OSS'
    };
  } catch (error) {
    console.error('Error downloading file from OSS:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to download file from OSS'
    };
  }
};

/**
 * Checks if a file exists on Aliyun OSS
 * @param filepath The OSS path of the file to check
 */
export const checkFileExists = async (filepath: string): Promise<boolean> => {
  try {
    // Check if object exists in OSS
    const result = await ossClient.head(filepath);
    return result.res.status === 200;
  } catch (error) {
    // If file doesn't exist, OSS throws an error
    console.error('Error checking file existence in OSS:', error);
    return false;
  }
};

/**
 * Gets a direct download URL for a file in Aliyun OSS
 * @param filepath The OSS path of the file
 */
export const getFileDownloadUrl = (filepath: string): string => {
  // Generate a signed URL that expires in 1 hour (3600 seconds)
  const signedUrl = ossClient.signatureUrl(filepath, {
    expires: 3600,
    response: {
      'content-disposition': `attachment; filename=${encodeURIComponent(filepath.split('/').pop() || '')}`
    }
  });
  
  return signedUrl;
};
