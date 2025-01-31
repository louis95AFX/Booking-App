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

    // Convert date and time to a single timestamp for easy comparison
    const requestedBookingTime = new Date(`${date}T${time}:00`);

    // Get the next available time from the most recent approved booking
    const nextAvailableQuery = `SELECT next_available_time FROM bookings WHERE approved = TRUE ORDER BY next_available_time DESC LIMIT 1`;
    const nextAvailableResult = await pool.query(nextAvailableQuery);

    // Check if there is a previous approved booking and its next available time
    let nextAvailableTime = null;
    if (nextAvailableResult.rows.length > 0) {
      nextAvailableTime = new Date(nextAvailableResult.rows[0].next_available_time);
    }

    // If there are no approved bookings, assume the earliest available time is the current time
    if (!nextAvailableTime) {
      nextAvailableTime = new Date();
    }

    // Check if the requested booking time is before the next available time
    if (requestedBookingTime < nextAvailableTime) {
      return res.status(400).json({
        status: 'error',
        message: `❌ Bookings are not allowed before ${nextAvailableTime.toLocaleString()}`
      });
    }

    // Check if an approved booking exists for this date and time
    const checkQuery = `SELECT * FROM bookings WHERE date = $1 AND time = $2 AND approved = TRUE`;
    const { rows } = await pool.query(checkQuery, [date, time]);

    if (rows.length > 0) {
      return res.status(400).json({ status: 'error', message: '❌ This slot is already booked!' });
    }

    // Insert the new booking into the database
    const query = `
      INSERT INTO bookings (name, email, cell, date, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;  
    `;
    const values = [name, email, cell, date, time];

    const result = await pool.query(query, values);
    console.log("✅ Booking added to database:", result.rows[0]);

    // Proceed with sending email after successful DB insert
    const paymentProof = req.file; // The uploaded payment proof file

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

    // Send email notification
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);

    // Respond to the client with a success message
    res.status(200).json({ status: 'success', message: "✅ Booking email sent successfully!" });

  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);

    // Respond to the client with an error message
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




// Function to send approval email
function sendApprovalEmail(email, bookingId, name) {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Booking Approved',
    text: `Dear ${name},\n\nYour booking with Touched By Jess has been approved, your booking ID is: ${bookingId}. We look forward to seeing you at your scheduled time.\n\nThank you for choosing us!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

app.post('/approve-booking', async (req, res) => {
  const { bookingId, currentBookingTime, newAvailableTime } = req.body;
  console.log(`Received bookingId: ${bookingId}, currentBookingTime: ${currentBookingTime}, newAvailableTime: ${newAvailableTime}`);

  try {
    // Convert currentBookingTime and newAvailableTime to Date objects
    const [currentHours, currentMinutes] = currentBookingTime.split(':');
    const [availableHours, availableMinutes] = newAvailableTime.split(':');

    const currentDate = new Date();
    currentDate.setHours(currentHours);
    currentDate.setMinutes(currentMinutes);

    const availableDate = new Date();
    availableDate.setHours(availableHours);
    availableDate.setMinutes(availableMinutes);

    console.log(`Checking availability between: ${currentDate} and ${availableDate}`);

    // Check if there are any approved bookings that conflict with the new available time
    const result = await pool.query(
      'SELECT * FROM bookings WHERE approved = TRUE AND next_available_time BETWEEN $1 AND $2',
      [currentDate, availableDate]
    );

    if (result.rows.length > 0) {
      return res.status(400).send({ message: 'This time window overlaps with another approved booking.' });
    }

    // Update the booking's approved status and the new available time for further bookings
    await pool.query(
      'UPDATE bookings SET approved = TRUE, booking_time = $1, next_available_time = $2 WHERE id = $3',
      [currentDate, availableDate, bookingId]
    );

    // Fetch user email and name for notification
    const userResult = await pool.query('SELECT email, name FROM bookings WHERE id = $1', [bookingId]);
    const { email, name } = userResult.rows[0] || {};

    // Ensure email and name exist before sending email
    if (!email || !name) {
      console.error('No email or name found for booking ID:', bookingId);
      return res.status(400).send({ message: 'No email or name found for the booking.' });
    }

    // Send email to the user who has been approved for the booking
    sendApprovalEmail(email, bookingId, name);  // Send email to the approved user

    // Respond with a success message
    res.status(200).send({ message: 'Booking approved and new available time set.' });

  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).send({ message: 'Failed to approve booking.' });
  }
});



app.post('/shift-booking-dates', async (req, res) => {
  const { bookingId, newDate, newTime } = req.body;

  // Ensure the bookingId, newDate, and newTime are provided
  if (!bookingId || !newDate || !newTime) {
    return res.status(400).send({ message: 'Booking ID, new date, and new time are required.' });
  }

  try {
    // Convert the newDate and newTime to a valid Date object (optional)
    const updatedDateTime = new Date(`${newDate}T${newTime}:00`);

    if (isNaN(updatedDateTime)) {
      return res.status(400).send({ message: 'Invalid date or time format.' });
    }

    // Update the booking date and time in the database
    const result = await pool.query(
      'UPDATE bookings SET date = $1, time = $2 WHERE id = $3',
      [updatedDateTime.toISOString().split('T')[0], updatedDateTime.toISOString().split('T')[1], bookingId]
    );

    // Check if the booking was found and updated
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Booking not found.' });
    }

    res.status(200).send({ message: 'Booking dates updated successfully' });
  } catch (err) {
    console.error('Error updating booking dates:', err);
    res.status(500).send({ message: 'Failed to update booking dates' });
  }
});
app.post('/shift-booking-dates', async (req, res) => {
  const { bookingId, newDate, newTime } = req.body;

  try {
      // Update the booking date and time in the database
      await pool.query('UPDATE bookings SET date = $1, time = $2 WHERE id = $3', [newDate, newTime, bookingId]);

      res.status(200).send({ message: 'Booking dates updated successfully' });
  } catch (err) {
      console.error('Error updating booking dates:', err);
      res.status(500).send({ message: 'Failed to update booking dates' });
  }
});



// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
