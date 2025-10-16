import OnlineApplicants from "../models/OnlineApplicants.js";

/**
 * @desc Register new online applicant (student + parent data)
 * @route POST /api/online-applicants
 */


export const registerOnlineApplicant = async (req, res) => {
  try {
    // Debug: Log the entire request body and files
    console.log('=== REQUEST DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('===================');

    const {
      // ===== Student Details =====
      first_name,
      middle_name,
      last_name,
      gender,
      dateOfBirth,
      nationality,
      countySubCounty,
      birthCertificateNo,

      // ===== Parent/Guardian Details =====
      guardian_relationship,
      guardian_first_name,
      guardian_surname,
      guardian_last_name,
      guardian_email,
      guardian_phone,
      postalAddress,
      idNumber,

      // ===== Academic Information =====
      currentOrLastSchool,
      currentClass,
      classApplyingFor,
      kcpeIndexNumber,
      kcpeMarks,

      // ===== Address/Contact Details =====
      homeAddress,
      nearestLandmark,
      distanceFromSchool,

      // ===== Payment Information =====
      payment: paymentString,

      // ===== Assessment fields =====
      grade,
      term,
      test,
      learning_area,

      // ===== Application Status =====
      applicationStatus,

      // ===== Optional metadata / admin fields =====
      reviewedBy,
      reviewedAt,
      adminNotes,
      smsSentToParent,
      smsSentAt
    } = req.body;

    // ===== Parse payment data if it's a JSON string =====
    let payment = {};
    if (paymentString) {
      try {
        payment = typeof paymentString === 'string' ? JSON.parse(paymentString) : paymentString;
        console.log('Parsed payment data:', payment);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        payment = {};
      }
    }

    // Debug: Log received data
    console.log('Received application data:', {
      first_name,
      last_name,
      guardian_first_name,
      guardian_email,
      payment: payment
    });

    // ===== Validate required fields =====
    // if (
    //   !first_name ||
    //   !last_name ||
    //   !gender ||
    //   !dateOfBirth ||
    //   !nationality ||
    //   !guardian_relationship ||
    //   !guardian_first_name ||
    //   !guardian_last_name ||
    //   !guardian_email ||
    //   !guardian_phone ||
    //   !currentOrLastSchool ||
    //   !classApplyingFor ||
    //   !homeAddress ||
    //   !nearestLandmark ||
    //   !payment?.method ||
    //   !payment?.transactionCode ||
    //   !payment?.paymentDate
    // ) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    // ===== Construct applicant object =====
    const applicantData = {
      // Student Details
      first_name,
      middle_name,
      last_name,
      gender,
      dateOfBirth,
      nationality,
      countySubCounty,
      birthCertificateNo,

      // Parent/Guardian Details
      guardian_relationship,
      guardian_first_name,
      guardian_surname,
      guardian_last_name,
      guardian_email,
      guardian_phone,
      postalAddress,
      idNumber,

      // Academic Information
      currentOrLastSchool,
      currentClass,
      classApplyingFor,
      kcpeIndexNumber,
      kcpeMarks,

      // Address/Contact Details
      homeAddress,
      nearestLandmark,
      distanceFromSchool,

      // Payment
      payment: {
        method: payment?.method,
        amount: payment?.amount || 1000, // default
        transactionCode: payment?.transactionCode,
        paymentDate: payment?.paymentDate,
        status: payment?.status || "Pending"
      },

      // Application Status
      applicationStatus: applicationStatus || 'Pending',

      // Optional fields
      grade,
      term,
      test,
      learning_area,
      reviewedBy,
      reviewedAt,
      adminNotes,
      smsSentToParent,
      smsSentAt
    };

    // ===== Handle document uploads if any =====
    if (req.files) {
      applicantData.documents = {};

      // Map frontend kebab-case field names to backend camelCase field names
      const docFieldMapping = {
        "birth-certificate": "birthCertificate",
        "passport-photo": "passportPhoto", 
        "academic-report": "academicReport",
        "transfer-letter": "transferLetter",
        "parent-id": "parentId",
        "medical-report": "medicalReport"
      };

      Object.keys(docFieldMapping).forEach((frontendField) => {
        const backendField = docFieldMapping[frontendField];
        if (req.files[frontendField] && req.files[frontendField][0]) {
          const file = req.files[frontendField][0];
          applicantData.documents[backendField] = {
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadDate: new Date(),
            buffer: file.buffer // Store file content in memory for now
          };
        }
      });
    }

    // ===== Handle documents from JSON payload (if no files uploaded) =====
    if (!req.files && req.body.documents) {
      applicantData.documents = {};

      // Map frontend kebab-case field names to backend camelCase field names
      const docFieldMapping = {
        "birth-certificate": "birthCertificate",
        "passport-photo": "passportPhoto", 
        "academic-report": "academicReport",
        "transfer-letter": "transferLetter",
        "parent-id": "parentId",
        "medical-report": "medicalReport"
      };

      Object.keys(req.body.documents).forEach((frontendField) => {
        const backendField = docFieldMapping[frontendField];
        if (req.body.documents[frontendField] && Object.keys(req.body.documents[frontendField]).length > 0) {
          applicantData.documents[backendField] = {
            filename: req.body.documents[frontendField].name || 'uploaded',
            originalName: req.body.documents[frontendField].name || 'document',
            mimetype: req.body.documents[frontendField].type || 'application/octet-stream',
            size: req.body.documents[frontendField].size || 0,
            uploadDate: new Date()
          };
        }
      });
    }

    // ===== Initialize empty documents object if no documents provided =====
    if (!applicantData.documents) {
      applicantData.documents = {};
    }

    // ===== Save applicant =====
    const applicant = await OnlineApplicants.create(applicantData);

    // ===== Respond with success =====
    res.status(201).json({
      message: "Online applicant registered successfully",
      applicant
    });

  } catch (error) {
    console.error("Error registering applicant:", error);
    res.status(500).json({
      message: "Error registering applicant",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
  