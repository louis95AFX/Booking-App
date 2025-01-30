// 1. Import the dotenv package to load the environment variables
require('dotenv').config({ path: './booking.env' }); 

// 2. Access the environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// 3. Check if the environment variables are loaded properly
if (!emailUser || !emailPass) {
    console.error("⚠️ ERROR: Missing email credentials in .env file");
    process.exit(1);  // Stop execution if email credentials are missing
}

console.log(`📧 Email: ${emailUser}`);
console.log(`🔑 Password: ${emailPass ? '✔️ Loaded' : '❌ Not Loaded'}`);
const fs = require('fs');
const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📂 Created uploads directory: ${uploadDir}`);
}


// Import required packages
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const winston = require('winston');
const multer = require('multer');



// Initialize Express app
const app = express(); // This must come first

// Middleware setup
app.use(express.json());  // To parse JSON request bodies

// CORS Middleware
const corsOptions = {
  origin: '*',  // Allow all origins (for testing purposes)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));  // Enable CORS

// Body Parser Middleware
app.use(bodyParser.json({ limit: '10mb' }));  // JSON body parser with 10MB limit
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));  // URL-encoded parser with 10MB limit

// PostgreSQL Database Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Your PostgreSQL database name
  password: process.env.DB_PASSWORD || 'Vinote1', // Allow env override
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => {
    console.error("❌ PostgreSQL Connection Error:", err); // Log the error if connection fails
    process.exit(1); // Exit the application if DB fails to connect
  });

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,  // `true` for 465, `false` for 587
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false  // Bypass SSL verification if needed
  }
});

// Verify SMTP Connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is Ready to Send Emails");
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Ensure the "uploads" folder exists
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/submit-booking', upload.single('paymentProof'), async (req, res) =>  {
  try {
    console.log("Received booking data:", req.body);

    const { name, email, cell, service, color, date, price, serviceType } = req.body;

     // Check if the file is uploaded
     if (!req.file) {
      return res.status(400).json({ status: 'error', message: '❌ No payment proof uploaded.' });
    }

    const paymentProof = req.file; // This will be the uploaded file

    // Email notification for the booking
    const mailOptions = {
      from: emailUser,
      to: 'carterprince95@gmail.com',  // Change to recipient email
      subject: '📅 New Booking Request',
      text: `New Booking Request:
      - Name: ${name}
      - Email: ${email}
      - Cell: ${cell}
      - Service: ${service}
      - Color: ${color}
      - Date: ${date}
      - Price: ${price}
      - Service Type: ${serviceType}`,
      attachments: [
        {
          filename: paymentProof.originalname,  // The original file name
          path: paymentProof.path  // The path to the uploaded file
        }
      ]
    };


    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);

    // Respond to the client with a success message and status code 200
    res.status(200).json({ status: 'success', message: "✅ Booking email sent successfully!" });
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    
    // Respond to the client with an error message and status code 500
    res.status(500).json({ status: 'error', message: `Internal Server Error: ${error.message}` });
  }
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
