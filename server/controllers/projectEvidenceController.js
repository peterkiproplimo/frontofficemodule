import ProjectEvidence from '../models/ProjectEvidence.js';
import Subject from '../models/Subject.js';
import Competency from '../models/Competency.js';
import Student from '../models/Student.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/project-evidences';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all project evidences with filtering and pagination
export const getProjectEvidences = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      subject,
      competency,
      student,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { caption: { $regex: search, $options: 'i' } },
        { reflection: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by subject
    if (subject) {
      query.subject = subject;
    }

    // Filter by competency
    if (competency) {
      query.competency = competency;
    }

    // Filter by student
    if (student) {
      query.student = student;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.submittedAt = {};
      if (dateFrom) {
        query.submittedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.submittedAt.$lte = new Date(dateTo);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projectEvidences = await ProjectEvidence.find(query)
      .populate('subject', 'name code')
      .populate('competency', 'name code')
      .populate('student', 'name studentId')
      .populate('teacherFeedback.feedbackBy', 'name')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProjectEvidence.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      projectEvidences,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching project evidences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single project evidence
export const getProjectEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const projectEvidence = await ProjectEvidence.findById(id)
      .populate('subject', 'name code')
      .populate('competency', 'name code')
      .populate('student', 'name studentId')
      .populate('teacherFeedback.feedbackBy', 'name');

    if (!projectEvidence) {
      return res.status(404).json({ message: 'Project evidence not found' });
    }

    res.json(projectEvidence);
  } catch (error) {
    console.error('Error fetching project evidence:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new project evidence
export const createProjectEvidence = async (req, res) => {
  try {
    const {
      title,
      description,
      caption,
      reflection,
      subject,
      competency,
      pci,
      evidenceType,
      uploadToGoogleDrive = false
    } = req.body;

    // Check if required fields are present
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    // Verify subject exists (only if provided)
    let subjectExists = null;
    if (subject && subject.trim() !== '') {
      subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(400).json({ message: 'Subject not found' });
      }
    }

    // Verify competency exists (only if provided)
    let competencyExists = null;
    if (competency && competency.trim() !== '') {
      competencyExists = await Competency.findById(competency);
      if (!competencyExists) {
        return res.status(400).json({ message: 'Competency not found' });
      }
    }

    // For now, we'll use a placeholder student ID. In a real app, this would come from authentication
    const studentId = req.user?.id || new mongoose.Types.ObjectId().toString();

    // Get student information for Google Drive folder structure
    let student = null;
    try {
      student = await Student.findById(studentId);
      if (!student) {
        // Create a placeholder student object for Google Drive folder structure
        student = {
          _id: studentId,
          name: 'Unknown Student',
          studentId: 'PLACEHOLDER'
        };
      }
    } catch (error) {
      console.log('Student not found, using placeholder student data');
      // Create a placeholder student object for Google Drive folder structure
      student = {
        _id: studentId,
        name: 'Unknown Student',
        studentId: 'PLACEHOLDER'
      };
    }
    
    let mediaUrl = `/uploads/project-evidences/${req.file.filename}`;
    let googleDriveData = null;

    // Upload to Google Drive if requested
    if (uploadToGoogleDrive === 'true' || uploadToGoogleDrive === true) {
      try {
        const filePath = path.join(process.cwd(), 'uploads/project-evidences', req.file.filename);
        
        const projectData = {
          title,
          description,
          caption,
          reflection,
          subject: subjectExists,
          competency: competencyExists,
          pci,
          evidenceType,
          student: student
        };

        // Google Drive functionality removed - using local storage only
        console.log('Google Drive upload requested but functionality has been removed');
      } catch (driveError) {
        console.error('Google Drive upload error:', driveError);
        // Continue with local storage even if Google Drive upload fails
      }
    }

    const projectEvidence = new ProjectEvidence({
      title,
      description,
      caption,
      reflection,
      ...(subject && subject.trim() !== '' && { subject }),
      ...(competency && competency.trim() !== '' && { competency }),
      pci,
      evidenceType,
      mediaUrl,
      googleDriveData,
      student: studentId,
      status: 'submitted'
    });

    await projectEvidence.save();

    // Populate the response
    await projectEvidence.populate([
      { path: 'subject', select: 'name code' },
      { path: 'competency', select: 'name code' },
      { path: 'student', select: 'name studentId' }
    ]);

    res.status(201).json({
      ...projectEvidence.toObject(),
      message: googleDriveData ? 'Project evidence created and uploaded to Google Drive successfully' : 'Project evidence created successfully'
    });
  } catch (error) {
    console.error('Error creating project evidence:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project evidence
export const updateProjectEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const projectEvidence = await ProjectEvidence.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('subject', 'name code')
      .populate('competency', 'name code')
      .populate('student', 'name studentId')
      .populate('teacherFeedback.feedbackBy', 'name');

    if (!projectEvidence) {
      return res.status(404).json({ message: 'Project evidence not found' });
    }

    res.json(projectEvidence);
  } catch (error) {
    console.error('Error updating project evidence:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project evidence
export const deleteProjectEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const projectEvidence = await ProjectEvidence.findById(id);
    if (!projectEvidence) {
      return res.status(404).json({ message: 'Project evidence not found' });
    }

    // Delete the associated file from local storage
    if (projectEvidence.mediaUrl) {
      const filePath = path.join(process.cwd(), projectEvidence.mediaUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Google Drive deletion removed - using local storage only

    await ProjectEvidence.findByIdAndDelete(id);

    res.json({ message: 'Project evidence deleted successfully' });
  } catch (error) {
    console.error('Error deleting project evidence:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add teacher feedback
export const addTeacherFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating, authenticityApproved } = req.body;

    const projectEvidence = await ProjectEvidence.findById(id);
    if (!projectEvidence) {
      return res.status(404).json({ message: 'Project evidence not found' });
    }

    // Update teacher feedback
    projectEvidence.teacherFeedback = {
      comment,
      rating: parseInt(rating),
      authenticityApproved: authenticityApproved === 'true',
      feedbackBy: req.user?.id || '64a1b2c3d4e5f6789012345', // Placeholder teacher ID
      feedbackDate: new Date()
    };

    // Update status based on feedback
    if (authenticityApproved === 'true') {
      projectEvidence.status = 'approved';
    } else {
      projectEvidence.status = 'reviewed';
    }

    await projectEvidence.save();

    // Populate the response
    await projectEvidence.populate([
      { path: 'subject', select: 'name code' },
      { path: 'competency', select: 'name code' },
      { path: 'student', select: 'name studentId' },
      { path: 'teacherFeedback.feedbackBy', select: 'name' }
    ]);

    res.json(projectEvidence);
  } catch (error) {
    console.error('Error adding teacher feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload to Google Drive functionality removed
export const uploadToGoogleDrive = async (req, res) => {
  try {
    res.status(501).json({ 
      message: 'Google Drive functionality has been removed. Please use local file storage.'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Google Drive file information functionality removed
export const getGoogleDriveInfo = async (req, res) => {
  try {
    res.status(501).json({ 
      message: 'Google Drive functionality has been removed. Please use local file storage.'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle project evidence status
export const toggleProjectEvidenceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const projectEvidence = await ProjectEvidence.findById(id);
    if (!projectEvidence) {
      return res.status(404).json({ message: 'Project evidence not found' });
    }

    // Toggle between approved and rejected
    if (projectEvidence.status === 'approved') {
      projectEvidence.status = 'rejected';
    } else {
      projectEvidence.status = 'approved';
    }

    await projectEvidence.save();

    res.json(projectEvidence);
  } catch (error) {
    console.error('Error toggling project evidence status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
