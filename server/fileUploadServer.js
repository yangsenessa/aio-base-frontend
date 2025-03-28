import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(express.json());

// Create storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = req.body.targetDir || '/tmp/uploads';
    // Log the target directory
    console.log(`Target upload directory: ${targetDir}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const filename = req.body.filename || `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filepath = path.join(req.file.destination, req.file.filename);
    
    console.log(`File uploaded successfully to ${filepath}`);
    
    return res.status(200).json({
      success: true,
      filepath,
      filename: req.file.filename,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
});

// File download endpoint
app.get('/api/files/download', (req, res) => {
  try {
    const filepath = req.query.filepath;
    
    if (!filepath) {
      return res.status(400).json({
        success: false,
        message: 'No filepath provided'
      });
    }
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    console.log(`Serving file download: ${filepath}`);
    return res.download(filepath);
  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to download file'
    });
  }
});

// Check if file exists endpoint
app.get('/api/files/exists', (req, res) => {
  try {
    const filepath = req.query.filepath;
    
    if (!filepath) {
      return res.status(400).json({
        success: false,
        message: 'No filepath provided'
      });
    }
    
    const exists = fs.existsSync(filepath);
    console.log(`Checking if file exists: ${filepath} - ${exists ? 'Yes' : 'No'}`);
    
    return res.status(200).json({
      success: true,
      exists
    });
  } catch (error) {
    console.error('Error checking file existence:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to check file existence'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`File server running on port ${PORT}`);
  
  // Log the endpoints available
  console.log(`
Available Endpoints:
- POST /api/files/upload - Upload files
- GET /api/files/download?filepath=<path> - Download files
- GET /api/files/exists?filepath=<path> - Check if file exists
  `);
});
