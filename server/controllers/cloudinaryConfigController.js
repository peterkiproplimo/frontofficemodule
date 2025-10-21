import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryService from '../utils/cloudinaryService.js';
import CloudinaryConfig from '../models/CloudinaryConfig.js';

// Get current Cloudinary configuration
export const getCloudinaryConfig = async (req, res) => {
  try {
    const config = await CloudinaryConfig.findOne({ is_active: true });
    
    if (!config) {
      return res.status(404).json({ message: 'No active Cloudinary configuration found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Error fetching Cloudinary config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Cloudinary configuration by ID
export const getCloudinaryConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await CloudinaryConfig.findById(id);
    
    if (!config) {
      return res.status(404).json({ message: 'Cloudinary configuration not found' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Error fetching Cloudinary config by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new Cloudinary configuration
export const createCloudinaryConfig = async (req, res) => {
  try {
    const {
      cloud_name,
      api_key,
      api_secret,
      upload_preset,
      folder,
      description,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!cloud_name || !api_key || !api_secret) {
      return res.status(400).json({ 
        message: 'Cloud name, API key, and API secret are required' 
      });
    }

    const config = new CloudinaryConfig({
      cloud_name,
      api_key,
      api_secret,
      upload_preset,
      folder,
      description,
      is_active
    });

    await config.save();

    // Refresh the Cloudinary service configuration
    try {
      await cloudinaryService.refreshConfiguration();
    } catch (refreshError) {
      console.warn('Warning: Could not refresh Cloudinary service configuration:', refreshError.message);
    }

    res.status(201).json({ 
      message: 'Cloudinary configuration created successfully',
      config 
    });
  } catch (error) {
    console.error('Error creating Cloudinary config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Cloudinary configuration
export const updateCloudinaryConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cloud_name,
      api_key,
      api_secret,
      upload_preset,
      folder,
      description,
      is_active
    } = req.body;

    const config = await CloudinaryConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: 'Cloudinary configuration not found' });
    }

    // Update fields
    if (cloud_name) config.cloud_name = cloud_name;
    if (api_key) config.api_key = api_key;
    if (api_secret) config.api_secret = api_secret;
    if (upload_preset !== undefined) config.upload_preset = upload_preset;
    if (folder !== undefined) config.folder = folder;
    if (description !== undefined) config.description = description;
    if (is_active !== undefined) config.is_active = is_active;

    await config.save();

    // Refresh the Cloudinary service configuration
    try {
      await cloudinaryService.refreshConfiguration();
    } catch (refreshError) {
      console.warn('Warning: Could not refresh Cloudinary service configuration:', refreshError.message);
    }

    res.json({ 
      message: 'Cloudinary configuration updated successfully',
      config 
    });
  } catch (error) {
    console.error('Error updating Cloudinary config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test Cloudinary connection
export const testCloudinaryConnection = async (req, res) => {
  try {
    const { cloud_name, api_key, api_secret } = req.body;

    if (!cloud_name || !api_key || !api_secret) {
      return res.status(400).json({ 
        message: 'Cloud name, API key, and API secret are required for testing' 
      });
    }

    // Configure Cloudinary with test credentials
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret
    });

    // Test the connection by trying to get account info
    try {
      const result = await cloudinary.api.ping();
      
      if (result.status === 'ok') {
        res.json({ 
          message: 'Connection successful',
          status: 'ok',
          cloud_name: cloud_name
        });
      } else {
        res.status(400).json({ 
          message: 'Connection failed: Invalid credentials',
          status: 'error'
        });
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary API error:', cloudinaryError);
      res.status(400).json({ 
        message: 'Connection failed: Invalid credentials or network error',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all Cloudinary configurations
export const getAllCloudinaryConfigs = async (req, res) => {
  try {
    const configs = await CloudinaryConfig.find().sort({ createdAt: -1 });
    res.json({ configs });
  } catch (error) {
    console.error('Error fetching all Cloudinary configs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Cloudinary configuration
export const deleteCloudinaryConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await CloudinaryConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: 'Cloudinary configuration not found' });
    }

    await CloudinaryConfig.findByIdAndDelete(id);

    res.json({ message: 'Cloudinary configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting Cloudinary config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default CloudinaryConfig;
