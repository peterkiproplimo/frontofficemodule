import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  idNumber: { type: String, required: false }, // e.g., National ID or Passport
  phoneNumber: { type: String, required: false },
  email: { type: String },
  company: { type: String },
  purpose: { type: String, required: false },
  hostName: { type: String, required: false },
  visitDate: { type: Date, default: Date.now },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { type: String, enum: ['Checked In', 'Checked Out'], default: 'Checked In' },
  passId: { type: String, unique: false }, // Unique QR code or barcode
  alertsTriggered: { type: Boolean, default: false }
}, { timestamps: true });


const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
