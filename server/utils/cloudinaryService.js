import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import CloudinaryConfig from '../models/CloudinaryConfig.js';

class CloudinaryService {
  constructor() {
    this.config = null;
    this.initializeCloudinary();
  }

  async initializeCloudinary() {
    try {
      // Fetch configuration from database
      await this.loadConfiguration();
      
      if (this.config) {
        cloudinary.config({
          cloud_name: this.config.cloud_name,
          api_key: this.config.api_key,
          api_secret: this.config.api_secret
        });
        
        console.log('Cloudinary service initialized successfully with database config');
        console.log('Cloud name:', this.config.cloud_name);
        console.log('API key:', this.config.api_key);
      } else {
        console.warn('No Cloudinary configuration found in database');
      }
    } catch (error) {
      console.error('Error initializing Cloudinary service:', error);
      throw error;
    }
  }

  async loadConfiguration() {
    try {
      const CLOUDINARY_CONFIG_ID = "68f7c348416e0370007b0935";
      this.config = await CloudinaryConfig.findById(CLOUDINARY_CONFIG_ID);
      
      if (this.config) {
        console.log('Loaded Cloudinary configuration from database');
      } else {
        console.log('No Cloudinary configuration found with ID:', CLOUDINARY_CONFIG_ID);
      }
    } catch (error) {
      console.error('Error loading Cloudinary configuration:', error);
      this.config = null;
    }
  }

  async refreshConfiguration() {
    await this.loadConfiguration();
    if (this.config) {
      cloudinary.config({
        cloud_name: this.config.cloud_name,
        api_key: this.config.api_key,
        api_secret: this.config.api_secret
      });
      console.log('Cloudinary configuration refreshed');
    }
  }

  /**
   * Upload a file to Cloudinary
   * @param {string} filePath - Local file path
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadFile(filePath, options = {}) {
    try {
      console.log('Starting uploadFile...');
      console.log('File path:', filePath);
      console.log('Options:', options);
      
      // Refresh configuration before upload
      await this.refreshConfiguration();
      
      if (!this.config) {
        throw new Error('No Cloudinary configuration found. Please configure Cloudinary settings first.');
      }
      
      const {
        public_id,
        folder = this.config.folder || 'project-evidences',
        resource_type = 'auto',
        transformation = {}
      } = options;

      // Generate public_id if not provided
      const fileName = path.basename(filePath, path.extname(filePath));
      const finalPublicId = public_id || `${folder}/${fileName}_${Date.now()}`;

      console.log(`Uploading file to Cloudinary: ${filePath}`);
      console.log('Final public_id:', finalPublicId);

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: finalPublicId,
        folder: folder,
        resource_type: resource_type,
        transformation: transformation,
        overwrite: true,
        invalidate: true
      });

      console.log(`File uploaded successfully: ${uploadResult.public_id}`);
      console.log('Upload result:', uploadResult);

      return {
        success: true,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        created_at: uploadResult.created_at,
        folder: uploadResult.folder
      };

    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      console.error('Error details:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name
      });
      return {
        success: false,
        error: error.message,
        details: {
          http_code: error.http_code,
          name: error.name
        }
      };
    }
  }

  /**
   * Upload project evidence to Cloudinary with specific folder structure
   * @param {string} filePath - Local file path
   * @param {Object} projectData - Project evidence data
   * @returns {Promise<Object>} - Upload result
   */
  async uploadProjectEvidence(filePath, projectData) {
    try {
      console.log('Starting uploadProjectEvidence...');
      console.log('File path:', filePath);
      console.log('Project data:', projectData);
      
      // Refresh configuration before upload
      await this.refreshConfiguration();
      
      if (!this.config) {
        throw new Error('No Cloudinary configuration found. Please configure Cloudinary settings first.');
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      

      console.log('Project data:', projectData);
      console.log('Student data:', projectData.student);
      console.log('Student keys:', projectData.student ? Object.keys(projectData.student) : 'No student data');
      
      // Handle different student name field structures
      let studentName = 'Unknown Student';
      if (projectData.student) {
        if (projectData.student.name) {
          // Backend Student model structure
          studentName = projectData.student.name;
        } else if (projectData.student.first_name && projectData.student.last_name) {
          // Frontend structure
          studentName = `${projectData.student.first_name} ${projectData.student.last_name}`;
          if (projectData.student.surname) {
            studentName += ` ${projectData.student.surname}`;
          }
        } else if (projectData.student.studentId) {
          // Fallback to student ID
          studentName = projectData.student.studentId;
        }
      }
      
      console.log('Final student name for Cloudinary:', studentName);
      const projectTitle = projectData.title || 'Untitled Project';
      
      // Sanitize folder and file names
      const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
      
      // Create folder structure using configured folder: configured-folder/student-name/project-title
      const baseFolder = this.config.folder || 'project-evidences';
      const folderPath = `${baseFolder}/${sanitizeName(studentName)}/${sanitizeName(projectTitle)}`;
      
      // Determine resource type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      let resourceType = 'auto';
      if (['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(ext)) {
        resourceType = 'video';
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        resourceType = 'image';
      }

      console.log('Folder path:', folderPath);
      console.log('Resource type:', resourceType);

      const uploadOptions = {
        folder: folderPath,
        resource_type: resourceType,
        transformation: {
          quality: 'auto',
          fetch_format: 'auto'
        }
      };

      console.log('Upload options:', uploadOptions);
      const result = await this.uploadFile(filePath, uploadOptions);
      console.log('Upload result:', result);
      
      if (result.success) {
        // Add additional metadata
        result.folderStructure = {
          mainFolder: 'project-evidences',
          studentFolder: sanitizeName(studentName),
          projectFolder: sanitizeName(projectTitle)
        };
        result.projectData = {
          studentName: sanitizeName(studentName),
          projectTitle: sanitizeName(projectTitle)
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('Error uploading project evidence to Cloudinary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @param {string} resourceType - Resource type (image, video, raw)
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteFile(publicId, resourceType = 'image') {
    try {
      // Refresh configuration before delete
      await this.refreshConfiguration();
      
      if (!this.config) {
        throw new Error('No Cloudinary configuration found. Please configure Cloudinary settings first.');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      console.log(`File deleted from Cloudinary: ${publicId}`);

      return {
        success: true,
        result: result
      };

    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file information from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        success: true,
        fileInfo: result
      };

    } catch (error) {
      console.error('Error getting file info from Cloudinary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate optimized URL for delivery
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} - Optimized URL
   */
  generateOptimizedUrl(publicId, options = {}) {
    const defaultOptions = {
      fetch_format: 'auto',
      quality: 'auto',
      ...options
    };

    return cloudinary.url(publicId, defaultOptions);
  }

  /**
   * Generate thumbnail URL
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Thumbnail options
   * @returns {string} - Thumbnail URL
   */
  generateThumbnailUrl(publicId, options = {}) {
    const thumbnailOptions = {
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };

    return cloudinary.url(publicId, thumbnailOptions);
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
