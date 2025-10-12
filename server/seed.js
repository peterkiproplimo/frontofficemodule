import mongoose from "mongoose";
import dotenv from "dotenv";

// Import all models
import AffiliateStat from "./models/AffiliateStat.js";
import OverallStat from "./models/OverallStat.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import Enquiry from "./models/Enquiry.js";
import Visitor from "./models/Visitor.js";
import User from "./models/User.js";

// Import all seed data
import {
  dataAffiliateStat,
  dataOverallStat,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataEnquiries,
  dataVisitors,
  dataUser
} from "./data/index.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Optional: Clear existing data
    await Promise.all([
      // AffiliateStat.deleteMany(),
      // OverallStat.deleteMany(),
      // Product.deleteMany(),
      // ProductStat.deleteMany(),
      // Transaction.deleteMany(),
      Enquiry.deleteMany(),
      Visitor.deleteMany(),
      User.deleteMany(),
    ]);


    console.log("Cleared existing data");

    // Insert new seed data
    // await AffiliateStat.insertMany(dataAffiliateStat);
    // await OverallStat.insertMany(dataOverallStat);
    // await Product.insertMany(dataProduct);
    // await ProductStat.insertMany(dataProductStat);
    // await Transaction.insertMany(dataTransaction);
    await Enquiry.insertMany(dataEnquiries);
    await User.insertMany(dataUser);
    await Visitor.insertMany(dataVisitors);

    console.log("All data seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();
