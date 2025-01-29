// 1. Import the dotenv package to load the environment variables
require('dotenv').config();

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

// Import required packages
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const winston = require('winston');

const app = express();

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
    console.error("❌ PostgreSQL Connection Error:", err);
    process.exit(1); // Exit if DB fails to connect
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

// Handle Booking Submission
app.post('/submit-booking', async (req, res) => {
  try {
    // Gather form data
    const { name, email, cell, service, color, price, date, serviceType } = req.body;
    const paymentProof = null;  // No payment proof is uploaded

    // Insert into DB
    const query = `INSERT INTO bookings (name, email, cell, service, color, price, date, serviceType, paymentProof) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
    const values = [name, email, cell, service, color, price, date, serviceType, paymentProof];
    const result = await pool.query(query, values);

    // Send email
    const mailOptions = {
      from: emailUser,
      to: 'louisphiri95@gmail.com',
      subject: '📅 New Booking Request',
      text: `New Booking Request from ${name} (${email})\nService: ${service}\nDate: ${date}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "✅ Booking saved successfully and email sent!", booking: result.rows[0] });
  } catch (error) {
    logger.error(`❌ Error saving booking: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
