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

app.post('/submit-booking', upload.single('paymentProof'), async (req, res) => {
  try {
    console.log("Received booking data:", req.body);

    const { name, email, cell, service, color, date, time, price, serviceType } = req.body;


    // Check if an approved booking exists for this date and time
    const checkQuery = `SELECT * FROM bookings WHERE date = $1 AND time = $2 AND approved = TRUE`;
    const { rows } = await pool.query(checkQuery, [date, time]);

    if (rows.length > 0) {
      return res.status(400).json({ status: 'error', message: '❌ This slot is already booked!' });
    }

    // ✅ Define the query and values BEFORE executing it
    const query = `
      INSERT INTO bookings (name, email, cell, date, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;  -- Return inserted row
    `;

    const values = [name, email, cell, date, time];

    // ✅ Use pool.query instead of db.query
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ status: "error", message: "Database error" });
      }
      console.log("✅ Booking added to database:", result.rows[0]);
      
      // Proceed with sending email after successful DB insert
    });

    // ✅ Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: '❌ No payment proof uploaded.' });
    }

    const paymentProof = req.file; // This will be the uploaded file

    // ✅ Email notification for the booking
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
      - Time: ${time}
      - Price: ${price}
      - Service Type: ${serviceType}`,
      attachments: [
        {
          filename: paymentProof.originalname,  // The original file name
          path: paymentProof.path  // The path to the uploaded file
        }
      ]
    };

    // ✅ Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);

    // ✅ Respond to the client with a success message
    res.status(200).json({ status: 'success', message: "✅ Booking email sent successfully!" });

  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    
    // ✅ Respond to the client with an error message
    res.status(500).json({ status: 'error', message: `Internal Server Error: ${error.message}` });
  }
});

// Get all bookings for the admin to view
app.get('/get-bookings', async (req, res) => {
  try {
    // Get the status query parameter (if provided)
    const { status } = req.query;

    // Build the query based on the status filter
    let query = 'SELECT id, name, email, cell, date, time, created_at, approved FROM bookings';
    let queryParams = [];

    if (status) {
      // Add the WHERE clause to filter by status
      if (status === 'confirmed') {
        query += ' WHERE approved = true';
      } else if (status === 'pending') {
        query += ' WHERE approved = false';
      } else if (status === 'canceled') {
        // Assuming there's a 'canceled' column to filter canceled bookings, e.g. `status = 'canceled'`
        query += ' WHERE canceled = true'; // Or replace with the actual field for canceled status
      }
    }

    query += ' ORDER BY date DESC, time DESC';

    // Execute the query with potential parameters
    const { rows } = await pool.query(query, queryParams);

    // Send the filtered bookings data as a JSON response
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


// Endpoint to approve a booking
app.post('/approve-booking', async (req, res) => {
  const { bookingId } = req.body;  // Get booking ID from the request body

  try {
      // Update the booking status to approved
      await pool.query('UPDATE bookings SET approved = TRUE WHERE id = $1', [bookingId]);
      res.status(200).send({ message: 'Booking approved' });
  } catch (err) {
      console.error('Error updating booking:', err);
      res.status(500).send({ message: 'Failed to approve booking' });
  }
});

app.post('/decline-booking', async (req, res) => { // Use app instead of pp
  const { bookingId } = req.body;
  try {
      // Update the booking status to canceled
      await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['canceled', bookingId]);
      res.status(200).send({ message: 'Booking canceled' });
  } catch (err) {
      console.error('Error updating booking:', err);
      res.status(500).send({ message: 'Failed to cancel booking' });
  }
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
