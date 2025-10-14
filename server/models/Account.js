import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  accountType: {
    type: String,
    enum: ['student', 'parent', 'staff', 'admin'],
    default: 'student'
  },
  lastTransaction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
accountSchema.index({ user: 1 });
accountSchema.index({ active: 1 });

const Account = mongoose.model("Account", accountSchema);

export default Account;
