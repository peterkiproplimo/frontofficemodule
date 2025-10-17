// controllers/visitorController.js
import Visitor from "../models/Visitor.js";
import { v4 as uuidv4 } from 'uuid';
import QRCode from "qrcode";

/**
 * @desc Register a new visitor
 * @route POST /api/visitors
 * @access Public or Authenticated (depending on your system)
 */
 export const registerVisitor = async (req, res) => {
  try {
    const {
      fullName,
      idNumber,
      phoneNumber,
      email,
      company,
      purpose,
      hostName
    } = req.body;

    // Validate required fields
    if (!fullName || !idNumber || !phoneNumber || !purpose || !hostName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique pass ID
    const passId = uuidv4();

    // Generate QR code for visitor pass
    const qrCodeData = await QRCode.toDataURL(passId);

    // Create new visitor record
    const newVisitor = await Visitor.create({
      fullName,
      idNumber,
      phoneNumber,
      email,
      company,
      purpose,
      hostName,
      passId,
      status: "Checked In", // ✅ Default status
      qrCode: qrCodeData,   // optionally store QR code too

    });

    res.status(201).json({
      message: 'Visitor registered successfully',
      visitor: {
        ...newVisitor._doc,
        qrCode: qrCodeData
      }
    });
  } catch (error) {
    console.error('Error registering visitor:', error);
    res.status(500).json({ message: 'Error registering visitor', error: error.message });
  }
};

/**
 * @desc Check-in visitor
 * @route PATCH /api/visitors/:id/checkin
 * @access Authenticated
 */
export const checkInVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    if (visitor.status === 'Checked In') {
      return res.status(400).json({ message: 'Visitor already checked in' });
    }

    visitor.checkInTime = new Date();
    visitor.status = 'Checked In';
    await visitor.save();

    res.json({ message: 'Visitor checked in successfully', visitor });
  } catch (error) {
    console.error('Error checking in visitor:', error);
    res.status(500).json({ message: 'Error checking in visitor', error: error.message });
  }
};

/**
 * @desc Check-out visitor
 * @route PATCH /api/visitors/:id/checkout
 * @access Authenticated
 */
export const checkOutVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    if (visitor.status !== 'Checked In') {
      return res.status(400).json({ message: 'Visitor is not currently checked in' });
    }

    visitor.checkOutTime = new Date();
    visitor.status = 'Checked Out';
    await visitor.save();

    res.json({ message: 'Visitor checked out successfully', visitor });
  } catch (error) {
    console.error('Error checking out visitor:', error);
    res.status(500).json({ message: 'Error checking out visitor', error: error.message });
  }
};

/**
 * @desc Get all visitors (with optional filters)
 * @route GET /api/visitors
 * @access Authenticated
 */
export const getVisitors = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      grade = "", 
      stream = "", 
      sortField = "createdAt", 
      sortOrder = "desc",
      status = [],
      company = "",
      purpose = ""
    } = req.query;

    // Build query object
    let query = {};

    // Add search functionality
    if (search) {
      console.log("Search term:", search);
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { idNumber: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
        { hostName: { $regex: search, $options: "i" } }
      ];
      console.log("Search query:", query);
    }

    // Add status filter
    if (status && status.length > 0) {
      query.status = { $in: status };
    }

    // Add company filter
    if (company) {
      query.company = company;
    }

    // Add purpose filter
    if (purpose) {
      query.purpose = purpose;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const visitors = await Visitor.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Visitor.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      data: visitors,
      pagination: {
        current_page: parseInt(page),
        total: total,
        total_pages: totalPages,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error fetching visitors', error: error.message });
  }
};

/**
 * @desc Get a single visitor by ID
 * @route GET /api/visitors/:id
 * @access Authenticated
 */
export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    res.json(visitor);
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ message: 'Error fetching visitor', error: error.message });
  }
};

/**
 * @desc Generate visitor report
 * @route GET /api/reports/visitors
 * @access Admin
 */
export const getVisitorReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate' });
    }

    const report = await Visitor.find({
      visitDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ visitDate: -1 });

    res.json({
      count: report.length,
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

/**
 * @desc Check for overstayed visitors
 * @route GET /api/visitors/alerts
 * @access Admin
 */
export const checkOverstayedVisitors = async (req, res) => {
  try {
    const durationLimitHours = 2; // Example limit: 2 hours
    const now = new Date();

    const overstayedVisitors = await Visitor.find({
      status: 'Checked In',
      checkInTime: { $exists: true }
    });

    const alerts = overstayedVisitors.filter(visitor => {
      const diffHours = (now - visitor.checkInTime) / (1000 * 60 * 60);
      return diffHours > durationLimitHours;
    });

    // Optionally mark as alerted
    for (let visitor of alerts) {
      visitor.alertsTriggered = true;
      await visitor.save();
    }

    res.json({
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error checking overstayed visitors:', error);
    res.status(500).json({ message: 'Error checking overstayed visitors', error: error.message });
  }
};
