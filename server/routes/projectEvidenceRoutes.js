import express from 'express';
import {
  getProjectEvidences,
  getProjectEvidence,
  createProjectEvidence,
  updateProjectEvidence,
  deleteProjectEvidence,
  addTeacherFeedback,
  getProjectEvidenceFeedback,
  migrateTeacherFeedback,
  toggleProjectEvidenceStatus,
  uploadToCloudinary,
  getCloudinaryInfo,
  getOptimizedUrl,
  testCloudinary,
  testFileUpload,
  upload
} from '../controllers/projectEvidenceController.js';

const router = express.Router();

// GET /api/project-evidences - Get all project evidences with filtering and pagination
router.get('/', getProjectEvidences);

// GET /api/project-evidences/:id - Get single project evidence
router.get('/:id', getProjectEvidence);

// POST /api/project-evidences - Create new project evidence
router.post('/', upload.single('media'), createProjectEvidence);

// PUT /api/project-evidences/:id - Update project evidence
router.put('/:id', updateProjectEvidence);

// DELETE /api/project-evidences/:id - Delete project evidence
router.delete('/:id', deleteProjectEvidence);

// GET /api/project-evidences/:id/feedback - Get all feedback for a project evidence
router.get('/:id/feedback', getProjectEvidenceFeedback);

// POST /api/project-evidences/:id/feedback - Add teacher feedback
router.post('/:id/feedback', addTeacherFeedback);

// PATCH /api/project-evidences/:id/toggle-status - Toggle project evidence status
router.patch('/:id/toggle-status', toggleProjectEvidenceStatus);

// POST /api/project-evidences/migrate-feedback - Migrate old teacherFeedback format to new array format
router.post('/migrate-feedback', migrateTeacherFeedback);

// POST /api/project-evidences/:id/upload-to-cloudinary - Upload existing project evidence to Cloudinary
router.post('/:id/upload-to-cloudinary', uploadToCloudinary);

// GET /api/project-evidences/:id/cloudinary-info - Get Cloudinary file information
router.get('/:id/cloudinary-info', getCloudinaryInfo);

// GET /api/project-evidences/:id/optimized-url - Get optimized URL for Cloudinary file
router.get('/:id/optimized-url', getOptimizedUrl);

// GET /api/project-evidences/test/cloudinary - Test Cloudinary connection
router.get('/test/cloudinary', testCloudinary);

// POST /api/project-evidences/test/upload - Test file upload with Cloudinary
router.post('/test/upload', upload.single('media'), testFileUpload);

export default router;
