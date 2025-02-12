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
const path = require('path');
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

const twilio = require('twilio');

// Load credentials 
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const twilioClient = new twilio(accountSid, authToken);

app.post('/submit-booking', upload.single('paymentProof'), async (req, res) => {
  try {
    console.log("Received booking data:", req.body);

    const { name, email, cell, hairstyle, size, color, date, time, price, appointmentType } = req.body;

    // Log received values
    console.log("Booking Details:", { name, email, cell, hairstyle, size, color, date, time, price, appointmentType });

    // Extract the extras from the body, or set them to null if they are not present
    const extraCurls = req.body.extraCurls || null;
    const goddessExtra = req.body.goddessExtra || null;
    const highlightExtra = req.body.highlightExtra || null;
    const extraLengthKnotless = req.body.extraLengthKnotless || null;
    const goddessExtraInvisible = req.body.goddessExtraInvisible || null;
    const highlightPeekabooExtra = req.body.highlightPeekabooExtra || null;
    const goddessExtraButterfly = req.body.goddessExtraButterfly || null;
    const highlightExtraButterfly = req.body.highlightExtraButterfly || null;
    const extraBeads = req.body.extraBeads || null;
    const extraLengthNormal = req.body.extraLengthNormal || null;
    const extraLengthHairpieceNotIncluded = req.body.extraLengthHairpieceNotIncluded || null;

    // Log extracted extras
    console.log("Extras selected:", {
      extraCurls,
      goddessExtra,
      highlightExtra,
      extraLengthKnotless,
      goddessExtraInvisible,
      highlightPeekabooExtra,
      goddessExtraButterfly,
      highlightExtraButterfly,
      extraBeads,
      extraLengthNormal,
      extraLengthHairpieceNotIncluded
    });

    // Check if an approved booking exists for this date and time
    const checkQuery = `SELECT * FROM bookings WHERE date = $1 AND time = $2 AND approved = TRUE`;
    const { rows } = await pool.query(checkQuery, [date, time]);

    console.log("Checking existing bookings:", { date, time, rows });

    if (rows.length > 0) {
      console.log(`❌ This slot is already booked!`);
      return res.status(400).json({ status: 'error', message: '❌ This slot is already booked!' });
    }

    // Insert booking into the database
    const query = `
      INSERT INTO bookings (name, email, cell, date, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, email, cell, date, time];

    console.log("Inserting booking into the database:", { name, email, cell, date, time });
    const result = await pool.query(query, values);
    console.log("✅ Booking added to database:", result.rows[0]);

    // Check if payment proof is uploaded
    if (!req.file) {
      console.error("❌ No payment proof uploaded.");
      return res.status(400).json({ status: 'error', message: '❌ No payment proof uploaded.' });
    }
    const extras = req.body.extras ? req.body.extras.split(', ') : [];
    console.log('Parsed Extras:', extras);

    const paymentProof = req.file;
    console.log("Payment proof uploaded:", paymentProof);

    // Prepare extras string for email
    let extrasText = '';
    if (extraCurls) extrasText += `Extra Curls (R100)\n`;
    if (goddessExtra) extrasText += `Goddess (R200)\n`;
    if (highlightExtra) extrasText += `Highlight (R150)\n`;
    if (extraLengthKnotless) extrasText += `Extra Length Knotless (R50)\n`;
    if (goddessExtraInvisible) extrasText += `Goddess Invisible (R100)\n`;
    if (highlightPeekabooExtra) extrasText += `Highlight Peekaboo (R120)\n`;
    if (goddessExtraButterfly) extrasText += `Goddess Butterfly (R200)\n`;
    if (highlightExtraButterfly) extrasText += `Highlight Butterfly (R150)\n`;
    if (extraBeads) extrasText += `Extra Beads (R50)\n`;
    if (extraLengthNormal) extrasText += `Extra Length (R50)\n`;
    if (extraLengthHairpieceNotIncluded) extrasText += `Extra Length (R50)\n`;

    console.log("Formatted extras for email:", extrasText);

    // Send email notification to admin
    const mailOptions = {
      from: emailUser,
      to: 'carterprince95@gmail.com', // Change to recipient email
      subject: '📅 New Booking Request',
      text: `New Booking Request:
      - Name: ${name}
      - Email: ${email}
      - Cell: ${cell}
      - Hairstyle: ${hairstyle}
      - Size: ${size}
      - Color: ${color}
      - Date: ${date}
      - Time: ${time}
      - Price: ${price}
      - Appointment Type: ${appointmentType}
      - Extras: ${extras.length > 0 ? extras.join(', ') : 'None'}`,  // Added extras here
      attachments: [
        {
          filename: paymentProof.originalname,
          path: paymentProof.path
        }
      ]
    };
    console.log('Received extras:', req.body.extras);

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);

    // Send WhatsApp message to user
    const whatsappMessage = `Hello ${name},\n\nYour booking for ${hairstyle} on ${date} at ${time} has been received. ✅\n\nWe'll notify you once it's approved. Thank you!`;

    const formatPhoneNumber = (cell) => {
      let cleanNumber = cell.replace(/\s|-/g, '');
      if (cleanNumber.startsWith('+')) {
        return cleanNumber;
      }
      if (cleanNumber.startsWith('0')) {
        return '+27' + cleanNumber.substring(1);
      }
      return null;
    };

    const userPhoneNumber = formatPhoneNumber(cell);
    console.log("Formatted phone number:", userPhoneNumber);

    if (!userPhoneNumber) {
      console.error('❌ Invalid phone number:', cell);
      return res.status(400).json({ status: 'error', message: 'Invalid phone number format. Please use an international format.' });
    }

    twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: `whatsapp:${userPhoneNumber}`,
      body: whatsappMessage
    }).then(message => {
      console.log('✅ WhatsApp message sent:', message.sid);
    }).catch(error => {
      console.error('❌ Error sending WhatsApp message:', error.message);
    });

    res.status(200).json({ status: 'success', message: "✅ Booking confirmed. Email & WhatsApp notification sent!" });

  } catch (error) {
    console.error(`❌ Error processing booking: ${error.message}`);
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

app.post('/subscribe-newsletter', async (req, res) => {
  try {
      const { email } = req.body;

      if (!email) {
          return res.status(400).json({ status: "error", message: "❌ Email is required" });
      }

      const checkQuery = `SELECT * FROM newsletters WHERE email = $1`;
      const { rows } = await pool.query(checkQuery, [email]);

      if (rows.length > 0) {
          return res.status(400).json({ status: "error", message: "⚠️ Email is already subscribed" });
      }

      const insertQuery = `INSERT INTO newsletters (email) VALUES ($1) RETURNING *`;
      const result = await pool.query(insertQuery, [email]);

      console.log("✅ New Newsletter Subscription:", result.rows[0]);

      // Send confirmation email
      const mailOptions = {
          from: "thandiwejessica30@icloud.com",
          to: email,
          subject: "✅ Newsletter Subscription Successful",
          text: "Thank you for subscribing to our newsletter! You will receive updates soon."
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Confirmation email sent to:", email);

      return res.status(200).json({ status: "success", message: "✅ Successfully subscribed!" });

  } catch (error) {
      console.error(`❌ Error subscribing to newsletter: ${error.message}`);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// POST endpoint to receive the form data and send an email
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  const mailOptions = {
    from: email, // Sender's email
    to: 'carterprince95@gmail.com', // Your email address where you want to receive messages
    subject: 'New Contact Form Submission',
    text: `
      You have received a new message from ${name}:

      Email: ${email}
      Message: ${message}
    `,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', mailOptions);

    // Respond back to the client
    res.status(200).json({ status: 'success', message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error. Please try again later.' });
  }
});


// Access the environment variables
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

// Send these variables to the front-end, either via API or embedded in HTML
// Example: Serve the values in HTML or a response
app.get('/admin', (req, res) => {
    res.json({
        adminUsername: adminUsername,
        adminPassword: adminPassword
    });
});

// Serve static files from the correct directory
app.use(express.static(path.join(__dirname)));

// Route to serve booking.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'booking.html'));
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
