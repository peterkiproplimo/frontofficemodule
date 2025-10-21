import express from 'express';
import {
  getCloudinaryConfig,
  getCloudinaryConfigById,
  createCloudinaryConfig,
  updateCloudinaryConfig,
  testCloudinaryConnection,
  getAllCloudinaryConfigs,
  deleteCloudinaryConfig
} from '../controllers/cloudinaryConfigController.js';

const router = express.Router();

// GET /api/cloudinary-config - Get current active configuration
router.get('/', getCloudinaryConfig);

// GET /api/cloudinary-config/:id - Get configuration by ID
router.get('/:id', getCloudinaryConfigById);

// GET /api/cloudinary-config/all - Get all configurations
router.get('/all', getAllCloudinaryConfigs);

// POST /api/cloudinary-config - Create new configuration
router.post('/', createCloudinaryConfig);

// PUT /api/cloudinary-config/:id - Update configuration
router.put('/:id', updateCloudinaryConfig);

// DELETE /api/cloudinary-config/:id - Delete configuration
router.delete('/:id', deleteCloudinaryConfig);

// POST /api/cloudinary-config/test - Test connection
router.post('/test', testCloudinaryConnection);

export default router;
