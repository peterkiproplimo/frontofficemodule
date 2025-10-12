import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {

    enquiryDate: {
      type: Date,
      required: false,
      default: Date.now, // auto set to current date
    },
    enquirySource: {
      type: String,
      enum: ["Walk-in", "Online", "Phone", "Email", "Referral"],
      required: false,
    },
    enquiryType: {
      type: String,
      enum: ["Admission", "Scholarship", "General"],
      required: false,
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Closed"],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // To determine if enquiry is by a Parent or Student
    enquiryType: {
      type: String,
      enum: ["Parent", "Student"],
      required: false,
    },

    // Parent Information
    parentName: {
      type: String,
      required: function () {
        return this.enquirerType === "Parent";
      },
    },
    relationship: {
      type: String,
      enum: ["Father", "Mother", "Guardian", "Other"],
      required: function () {
        return this.enquirerType === "Parent";
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.enquirerType === "Parent";
      },
    },
    email: {
      type: String,
      required: function () {
        return this.enquirerType === "Parent";
      },
    },

    // Student Information
    studentName: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    gradeInterested: {
      type: String,
      required: false,
    },
    previousSchool: {
      type: String,
    },
    
    // Additional Notes
    notes: {
      type: String,
    },
  },
  {
    timestamps: false, // Adds createdAt and updatedAt fields
  }
);

const Enquiry = mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;
