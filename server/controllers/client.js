import getCountryISO3 from "country-iso-2-to-3";
import _ from "lodash";

// Models import
import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Enquiry from "../models/Enquiry.js";
import Transaction from "../models/Transaction.js";

// Get Products
export const getProducts = async (_, res) => {
  try {
    const products = await Product.find();
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({
          productId: product._id,
        });

        return {
          ...product._doc,
          stat,
        };
      })
    );

    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


export const createEnquiry = async (req, res) => {
  try {
    const {
      enquiryType,
      studentName,
      dateOfBirth,
      gender,
      gradeInterested,
      parentName,
      relationship,
      phoneNumber,
      email,
    } = req.body;

    // ✅ Validate required fields
    if (!enquiryType || !studentName || !dateOfBirth || !gender || !phoneNumber || !gradeInterested || !parentName || !relationship) {
      return res.status(400).json({
        message: "Please fill in all required fields: subject, description, reporter name, and contact.",
      });
    }

    // ✅ Create new enquiry
    const newEnquiry = new Enquiry({
        enquiryType,
        studentName,
        dateOfBirth,
        gender,
        gradeInterested,
        parentName,
        relationship,
        phoneNumber,
        email,
    });

    await newEnquiry.save();

    res.status(201).json({
      message: "Enquiry created successfully.",
      enquiry: newEnquiry,
    });
  
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({
      message: "An error occurred while creating the enquiry.",
      error: error.message,
    });
  }
};


// ===============================
// Get Enquiries (New Function)
// ===============================
export const getEnquiries = async (req, res) => {
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
      source = ""
    } = req.query;

    // Build query object
    let query = {};

    // Add search functionality
    if (search) {
      console.log("Search term:", search);
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { parentName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { gradeInterested: { $regex: search, $options: "i" } },
        { previousSchool: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } }
      ];
      console.log("Search query:", query);
    }

    // Add grade filter
    if (grade) {
      query.gradeInterested = grade;
    }

    // Add status filter
    if (status && status.length > 0) {
      query.status = { $in: status };
    }

    // Add source filter
    if (source) {
      query.enquirySource = source;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch enquiries with pagination and filtering
    console.log("Final query:", JSON.stringify(query, null, 2));
    const enquiries = await Enquiry.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Enquiry.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    console.log("Found enquiries:", enquiries.length, "Total:", total);

    // Return data with pagination info
    res.status(200).json({
      data: enquiries,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get Transactions
export const getTransactions = async (req, res) => {
  try {
    // sort - { "field": "userId", sort: "desc" }
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    // sanitize search
    var safeSearch = _.escapeRegExp(search);

    // Formatted sort - { userId: -1 }
    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: sortParsed.sort == "asc" ? 1 : -1,
      };

      return sortFormatted;
    };

    // sort formatted
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    // get transactions
    const transactions = await Transaction.find({
      $or: [
        { cost: { $regex: new RegExp(safeSearch, "i") } },
        { userId: { $regex: new RegExp(safeSearch, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);

    // total transactions
    const total = await Transaction.countDocuments({
      name: { $regex: safeSearch, $options: "i" },
    });

    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get Geography
export const getGeography = async (req, res) => {
  try {
    const users = await User.find();

    // Convert country ISO 2 -> ISO 3
    const mappedLocations = users.reduce((acc, { country }) => {
      const countryISO3 = getCountryISO3(country);
      if (!acc[countryISO3]) {
        acc[countryISO3] = 0;
      }

      acc[countryISO3]++;

      return acc;
    }, {});

    // format countries to match geography
    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );

    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
