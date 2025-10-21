import mongoose from 'mongoose';

const projectEvidenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  caption: {
    type: String,
    required: true,
    trim: true
  },
  reflection: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  competency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competency'
  },
  pci: {
    type: String,
    required: true,
    enum: [
      'Environment',
      'Health',
      'Gender',
      'Values',
      'Human Rights',
      'Child Protection',
      'Life Skills',
      'Citizenship',
      'Peace Education',
      'Technology',
      'Innovation',
      'Entrepreneurship'
    ]
  },
  evidenceType: {
    type: String,
    required: true,
    enum: ['photo', 'video']
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherFeedback: {
    comment: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    authenticityApproved: {
      type: Boolean,
      default: false
    },
    feedbackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedbackDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved', 'rejected'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
projectEvidenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
projectEvidenceSchema.index({ student: 1, subject: 1, competency: 1 });
projectEvidenceSchema.index({ status: 1 });
projectEvidenceSchema.index({ submittedAt: -1 });

const ProjectEvidence = mongoose.model('ProjectEvidence', projectEvidenceSchema);

export default ProjectEvidence;
