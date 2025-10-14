import express from "express";
import multer from "multer";
import {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  getCertificatesByStudent,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
  getCertificateStats
} from "../controllers/certificateController.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/certificates/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only specific file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

const router = express.Router();

/**
 * @route POST /api/certificates
 * @desc Create new certificate
 */
router.post("/", upload.single('certificateFile'), createCertificate);

/**
 * @route GET /api/certificates
 * @desc Get all certificates with optional filtering
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - studentId: Filter by student ID
 * - certificateType: Filter by certificate type
 * - status: Filter by status
 * - sortBy: Sort field (default: 'issueDate')
 * - sortOrder: Sort order 'asc' or 'desc' (default: 'desc')
 */
router.get("/", getAllCertificates);

/**
 * @route GET /api/certificates/stats
 * @desc Get certificate statistics
 */
router.get("/stats", getCertificateStats);

/**
 * @route GET /api/certificates/student/:studentId
 * @desc Get certificates by student ID
 * Query parameters:
 * - certificateType: Filter by certificate type
 * - status: Filter by status
 */
router.get("/student/:studentId", getCertificatesByStudent);

/**
 * @route GET /api/certificates/:id
 * @desc Get certificate by ID
 */
router.get("/:id", getCertificateById);

/**
 * @route PUT /api/certificates/:id
 * @desc Update certificate
 */
router.put("/:id", upload.single('certificateFile'), updateCertificate);

/**
 * @route PATCH /api/certificates/:id/verify
 * @desc Verify/unverify certificate
 * Body: { isVerified: boolean, verifiedBy: string }
 */
router.patch("/:id/verify", verifyCertificate);

/**
 * @route DELETE /api/certificates/:id
 * @desc Delete certificate
 */
router.delete("/:id", deleteCertificate);

export default router;
