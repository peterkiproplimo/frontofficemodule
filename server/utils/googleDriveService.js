import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initializeDrive();
  }

  async initializeDrive() {
    try {
      // Load credentials from the config file
      const credentialsPath = path.join(__dirname, '../config/real_credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error('Google Drive credentials file not found. Please ensure @credentials.json exists in the config directory.');
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Check if credentials are still placeholder values
      if (credentials.project_id === 'your-project-id' || credentials.client_email === 'your-service-account@your-project-id.iam.gserviceaccount.com') {
        throw new Error('Google Drive credentials are still placeholder values. Please replace with actual credentials from Google Cloud Console.');
      }
      
      // Create JWT auth client
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/drive']
      );

      // Initialize Google Drive API
      this.drive = google.drive({ version: 'v3', auth });
      
      console.log('Google Drive service initialized successfully');
      console.log('Service account email:', credentials.client_email);
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      throw error;
    }
  }

  /**
   * Upload a file to Google Drive
   * @param {string} filePath - Local file path
   * @param {string} fileName - Name for the file in Drive
   * @param {string} folderId - Google Drive folder ID (optional)
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<Object>} - Upload result with file ID and web view link
   */
  async uploadFile(filePath, fileName, folderId = null, mimeType = null) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      // Read file metadata
      const fileStats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);

      // Determine MIME type if not provided
      if (!mimeType) {
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.mp4': 'video/mp4',
          '.avi': 'video/x-msvideo',
          '.mov': 'video/quicktime',
          '.pdf': 'application/pdf',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.txt': 'text/plain'
        };
        mimeType = mimeTypes[ext] || 'application/octet-stream';
      }

      // Prepare file metadata
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      // Prepare media
      const media = {
        mimeType: mimeType,
        body: fileBuffer
      };

      console.log(`Uploading file: ${fileName} to Google Drive...`);

      // Upload file
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime'
      });

      console.log(`File uploaded successfully: ${response.data.name} (ID: ${response.data.id})`);

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        size: response.data.size,
        mimeType: response.data.mimeType,
        createdTime: response.data.createdTime
      };

    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a folder in Google Drive
   * @param {string} folderName - Name of the folder
   * @param {string} parentFolderId - Parent folder ID (optional)
   * @returns {Promise<Object>} - Folder creation result
   */
  async createFolder(folderName, parentFolderId = null) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name,webViewLink'
      });

      console.log(`Folder created successfully: ${response.data.name} (ID: ${response.data.id})`);

      return {
        success: true,
        folderId: response.data.id,
        folderName: response.data.name,
        webViewLink: response.data.webViewLink
      };

    } catch (error) {
      console.error('Error creating folder in Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Google Drive
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteFile(fileId) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      await this.drive.files.delete({
        fileId: fileId
      });

      console.log(`File deleted successfully: ${fileId}`);

      return {
        success: true,
        message: 'File deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file information from Google Drive
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(fileId) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime,modifiedTime'
      });

      return {
        success: true,
        fileInfo: response.data
      };

    } catch (error) {
      console.error('Error getting file info from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List files in a folder
   * @param {string} folderId - Google Drive folder ID
   * @param {number} pageSize - Number of files to return (default: 10)
   * @returns {Promise<Object>} - List of files
   */
  async listFiles(folderId, pageSize = 10) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      const response = await this.drive.files.list({
        q: folderId ? `'${folderId}' in parents` : undefined,
        pageSize: pageSize,
        fields: 'files(id,name,webViewLink,webContentLink,size,mimeType,createdTime)'
      });

      return {
        success: true,
        files: response.data.files
      };

    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find a folder by name
   * @param {string} folderName - Name of the folder to find
   * @returns {Promise<Object>} - Folder information
   */
  async findFolderByName(folderName) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id,name,webViewLink)'
      });

      if (response.data.files && response.data.files.length > 0) {
        const folder = response.data.files[0];
        return {
          success: true,
          folderId: folder.id,
          folderName: folder.name,
          webViewLink: folder.webViewLink
        };
      } else {
        return {
          success: false,
          error: 'Folder not found'
        };
      }

    } catch (error) {
      console.error('Error finding folder by name:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload student project evidence to Google Drive
   * @param {string} filePath - Local file path
   * @param {Object} projectData - Project evidence data
   * @returns {Promise<Object>} - Upload result
   */
  async uploadStudentProject(filePath, projectData) {
    try {
      const fileName = path.basename(filePath);
      const studentName = projectData.student?.name || 'Unknown Student';
      const projectTitle = projectData.title || 'Untitled Project';
      
      // Sanitize folder and file names
      const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
      
      // Use existing "Elimurise School Uploads" folder
      const mainFolderName = 'Elimurise School Uploads';
      
      // Try to find existing folder first
      let mainFolder = await this.findFolderByName(mainFolderName);
      
      // If folder doesn't exist, create it
      if (!mainFolder.success) {
        console.log(`Creating folder: ${mainFolderName}`);
        mainFolder = await this.createFolder(mainFolderName);
        if (!mainFolder.success) {
          return mainFolder;
        }
      }
      
      // Create project subfolder within main folder
      const projectFolderName = `${sanitizeName(studentName)}_${sanitizeName(projectTitle)}`;
      const projectFolder = await this.createFolder(projectFolderName, mainFolder.folderId);
      
      if (!projectFolder.success) {
        return projectFolder;
      }
      
      // Upload the file to the project folder
      const uploadResult = await this.uploadFile(filePath, fileName, projectFolder.folderId);
      
      if (uploadResult.success) {
        // Add additional metadata
        uploadResult.projectFolderId = projectFolder.folderId;
        uploadResult.projectFolderName = projectFolderName;
        uploadResult.folderStructure = {
          mainFolder: mainFolder.folderId,
          projectFolder: projectFolder.folderId
        };
      }
      
      return uploadResult;
      
    } catch (error) {
      console.error('Error uploading student project to Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const googleDriveService = new GoogleDriveService();

export default googleDriveService;
