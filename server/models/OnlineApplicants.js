// models/OnlineApplicants.js
import mongoose from "mongoose";

const onlineApplicantSchema = new mongoose.Schema({
  // ===== Student Info =====
  first_name: { type: String },
  last_name: { type: String },
  surname: { type: String },
  gender: { type: String },
  adm_no: { type: String },

  // ===== Guardian Info =====
  guardian_relationship: { type: String },
  guardian_first_name: { type: String },
  guardian_surname: { type: String },
  guardian_last_name: { type: String },
  guardian_email: { type: String },
  guardian_phone: { type: String },

  // ===== Metadata =====
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("OnlineApplicants", onlineApplicantSchema);
