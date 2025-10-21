import express from 'express';
import {
  getProjectEvidences,
  getProjectEvidence,
  createProjectEvidence,
  updateProjectEvidence,
  deleteProjectEvidence,
  addTeacherFeedback,
  toggleProjectEvidenceStatus,
  uploadToGoogleDrive,
  getGoogleDriveInfo,
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

// POST /api/project-evidences/:id/feedback - Add teacher feedback
router.post('/:id/feedback', addTeacherFeedback);

// PATCH /api/project-evidences/:id/toggle-status - Toggle project evidence status
router.patch('/:id/toggle-status', toggleProjectEvidenceStatus);

// POST /api/project-evidences/:id/upload-to-drive - Upload existing project evidence to Google Drive
router.post('/:id/upload-to-drive', uploadToGoogleDrive);

// GET /api/project-evidences/:id/google-drive-info - Get Google Drive file information
router.get('/:id/google-drive-info', getGoogleDriveInfo);

export default router;
