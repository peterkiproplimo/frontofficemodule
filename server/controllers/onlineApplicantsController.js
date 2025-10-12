import OnlineApplicants from "../models/OnlineApplicants.js";

/**
 * @desc Register new online applicant (student + parent data)
 * @route POST /api/online-applicants
 */

export const registerOnlineApplicant = async (req, res) => {
  try {
    
    const {
      first_name,
      last_name,
      surname,
      gender,
      adm_no,
      guardian_relationship,
      guardian_first_name,
      guardian_surname,
      guardian_last_name,
      guardian_email,
      guardian_phone
    } = req.body;

    // ===== Validate required fields =====
    if (!first_name || !last_name || !gender || !guardian_first_name || !guardian_phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ===== Create new applicant record =====
    const applicant = await OnlineApplicants.create({
      first_name,
      last_name,
      surname,
      gender,
      adm_no,
      guardian_relationship,
      guardian_first_name,
      guardian_surname,
      guardian_last_name,
      guardian_email,
      guardian_phone,
    });

    // ===== Respond with success =====
    res.status(201).json({
      message: "Online applicant registered successfully",
      applicant,
    });

  } catch (error) {
    console.error("Error registering applicant:", error);
    res.status(500).json({
      message: "Error registering applicant",
      error: error.message,
    });
  }
};


/**
 * @desc Get single applicant by ID
 * @route GET /api/online-applicants/:id
 */
export const getOnlineApplicantById = async (req, res) => {
    try {
      const { id } = req.params;
      const applicant = await OnlineApplicants.findById(id);
  
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }
  
      res.status(200).json(applicant);
    } catch (error) {
      console.error("Error fetching applicant:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  /**
 * @desc Get all online applicants
 * @route GET /api/online-applicants
 */
export const getAllOnlineApplicants = async (req, res) => {
    try {
      const applicants = await OnlineApplicants.find().sort({ createdAt: -1 }); // newest first
      res.status(200).json(applicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }

};
  