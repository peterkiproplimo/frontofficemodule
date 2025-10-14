// models/Complaint.js
import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({

  message: { type: String, required: true },
  sender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

});

const reportSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    
    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Technical", "Service", "Billing", "Other"], // example categories
      default: "Other",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    reporterName: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: String,
      required: false,
      trim: true,
    },

    reporterContact: {
      type: String,
      required: true,
      trim: true,
    },

    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },

    replies: [ReplySchema], // 👈 add this line


  },
  { timestamps: true }
);

export default mongoose.model("Complaint", reportSchema);
