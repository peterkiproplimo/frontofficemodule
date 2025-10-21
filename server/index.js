import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

// Import models to ensure they are registered with Mongoose
import Certificate from "./models/Certificate.js";

// Rate Limiter
import { rateLimiter } from "./middlewares/rateLimiter.js";

// Routes imports
import clientRoutes from "./routes/client.js";
import visitorRoutes from "./routes/visitors.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import onlineRegistrationRoutes from "./routes/onlineregistration.js";
import complaintRoutes from "./routes/complaints.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";
import cohortRoutes from "./routes/cohortRoutes.js";
import frontOfficeRoutes from "./routes/frontOfficeRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import competencyRoutes from "./routes/competencyRoutes.js";
import projectEvidenceRoutes from "./routes/projectEvidenceRoutes.js";
import cloudinaryConfigRoutes from "./routes/cloudinaryConfigRoutes.js";


// Configuration
dotenv.config();
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(rateLimiter);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes Setup
app.use("/client", clientRoutes);
app.use("/visitors", visitorRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
app.use("/onlineregistration", onlineRegistrationRoutes);
app.use("/complaints", complaintRoutes);
app.use("/certificates", certificateRoutes);
app.use("/mpesa", mpesaRoutes);
app.use("/cohorts", cohortRoutes);
app.use("/front-office", frontOfficeRoutes);
app.use("/subjects", subjectRoutes);
app.use("/competencies", competencyRoutes);
app.use("/project-evidences", projectEvidenceRoutes);
app.use("/cloudinary-config", cloudinaryConfigRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));


console.log("✅ Node.js app started successfully!");

// Access an environment variable
const myEnvVar = process.env.MY_TEST_VARIABLE;

// Print it to the console
if (myEnvVar) {
  console.log("🌍 MY_TEST_VARIABLE value:", myEnvVar);
} else {
  console.log("⚠️ MY_TEST_VARIABLE is not set. Please define it in Render dashboard > Environment.");
}

// console.log("MONGODB_URL:", process.env.MONGODB_URL);
const URL1 = "mongodb+srv://Safaribust:8R4NGbiciCMxCQX1@cluster0.yuiecha.mongodb.net/frontoffice?retryWrites=true&w=majority&appName=Cluster0";
// Mongoose Setup
const PORT = process.env.PORT || 9000;
mongoose
  .connect(URL1
    // {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // }
  )
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    // Only run first time when running app to insert data into mongodb
    /**
      ***********************************************
        User.insertMany(dataUser);
        Product.insertMany(dataProduct);
        ProductStat.insertMany(dataProductStat);
        Transaction.insertMany(dataTransaction);
        OverallStat.insertMany(dataOverallStat);
        AffiliateStat.insertMany(dataAffiliateStat);
      ***********************************************
    */
  })
  .catch((error) => console.log(`${error} did not connect.`));
