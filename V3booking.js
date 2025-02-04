const form = document.getElementById('bookingForm');
document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting the default way
   
   // Show loading spinner, overlay, and "Sending Booking..." text
   document.getElementById('loading-spinner').style.display = 'flex'; 
   document.getElementById('loading-text').style.display = 'block'; 
    const form = e.target;

    // Validate that form fields exist before accessing their values
    const name = form.name ? form.name.value : '';
    const email = form.email ? form.email.value : '';
    const cell = form.cell ? form.cell.value : '';
    const service = form.service ? form.service.value : '';
    const color = form.color ? form.color.value : '';
    const date = form.date ? form.date.value : '';
    const hour = form.hour ? form.hour.value : '';
    const minute = form.minute ? form.minute.value : '';
    const time = `${hour}:${minute}`;
    const price = form.price ? form.price.value : '';
    const serviceType = form.serviceType ? form.serviceType.value : '';
    const paymentProof = document.getElementById('fileUpload') ? document.getElementById('fileUpload').files[0] : null;

    // Check if payment proof exists
    if (!paymentProof) {
        alert("Proof of payment is required!");
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('loading-text').style.display = 'none'; // Hide loading text
        return;
    }

    // Construct FormData for submission
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('cell', cell);
    formData.append('service', service);
    formData.append('color', color);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('price', price);
    formData.append('serviceType', serviceType);
    formData.append('paymentProof', paymentProof);

    // Send the form data using Fetch API
    fetch('http://localhost:3000/submit-booking', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        setTimeout(function () {
        document.getElementById('spinner').style.display = 'none'; // Hide spinner after submission
    }, 3000); // Replace with your actual API or form submission delay
        // Show appropriate message based on response
        if (data.status === 'success') {
            alert("Booking successfully sent!");
            closeBookingForm();
        } else {
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('loading-text').style.display = 'none'; // Hide loading text
            alert("There was an issue with your booking.");
            closeBookingForm();
        }
    })
    .catch(error => {
        // Hide the loading spinner and text in case of an error
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('loading-text').style.display = 'none';
        console.error('Error:', error);
        alert("There was an issue with your booking.");
    });
});


// Booking Form Submit Listener (your existing code)
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent form from submitting the default way
    // Your existing booking form submission logic
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("newsletter-form");

    if (!form) {
        console.error("❌ Form element not found!");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const emailInput = document.getElementById("email");

        if (!emailInput) {
            console.error("❌ Email input field not found!");
            return;
        }

        console.log("Email input element:", emailInput);
        console.log("Email value before trimming:", emailInput.value);

        const email = emailInput.value.trim(); // Remove whitespace

        console.log("Email value after trimming:", email);

        if (!email) {
            // alert("❌ Please enter a valid email.");
            alert("❌ News letters currently not available");
            return;
        }

        try {
            const response = await fetch("/subscribe-newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                emailInput.value = ""; // Clear input field
                console.log("✅ Email cleared successfully.");
            }

        } catch (error) {
            console.error("❌ Error submitting form:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const reviews = [
        { name: "Jane Doe", text: "Absolutely amazing service! I love my new look.", rating: 5 },
        { name: "Mary Smith", text: "Highly professional and friendly. Will book again!", rating: 5 },
        { name: "John Williams", text: "Great experience! Highly recommend.", rating: 4 }
    ];

    const reviewContainer = document.getElementById("review-container");

    function generateStars(rating) {
        return "⭐".repeat(rating);
    }

    reviews.forEach(review => {
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");

        reviewCard.innerHTML = `
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">
                <strong>${review.name}</strong> ${generateStars(review.rating)}
            </div>
        `;

        reviewContainer.appendChild(reviewCard);
    });
});

// Ensure the form is only handled once
document.getElementById('contact-form').addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const form = event.target; // Get the form that was submitted

    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    console.log("Name:", name, "Email:", email, "Message:", message); // Check if values are populated

    if (!name || !email || !message) {
        alert("All fields are required.");
        return;
    }

    const formData = {
        name: name,
        email: email,
        message: message,
    };

    try {
         const response = await fetch("http://localhost:3000/contact", { // Update with the actual endpoint URL
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); // Show success message
            form.reset(); // Reset the form after submission
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('❌ Error submitting form:', error);
        alert('Something went wrong. Please try again later.');
    }
});


function closeBookingForm() {
    window.location.href = 'booking.html'; // Redirect to the home page
}

// Use jQuery in noConflict mode for datepicker and dynamic price
var $jq = jQuery.noConflict();

$jq(document).ready(function () {
    // Initialize Datepicker
    $jq('#date').datepicker({
        format: 'mm/dd/yyyy'
    });

    // Update Price dynamically based on selected hairstyle
    $jq('#service').change(function() {
        var price = 500; // Default price

        switch($jq(this).val()) {
            case 'boxBraids':
                price = 500;
                break;
            case 'cornrows':
                price = 400;
                break;
            case 'twistBraids':
                price = 650;
                break;
            case 'fauxLocs':
                price = 700;
                break;
            case 'knotlessBraids':
                price = 800;
                break;
            case 'senegaleseTwists':
                price = 650;
                break;
            case 'dreadlocks':
                price = 700;
                break;
        }

        // Dynamically update the price displayed
        $jq('#price').text('R' + price);
    });
});

// JavaScript for Carousel Rotation

var angle = 0;

// Function to manually rotate the images inside the carousel
function galleryspin(sign) { 
    var spinner = document.querySelector("#spinner");
    if (sign === '+') { 
        angle = angle + 45; 
    } else { 
        angle = angle - 45; 
    }
    spinner.style.transform = "rotateY(" + angle + "deg)";
}

// Function to automatically rotate the images inside the carousel
function autoRotate() {
    angle += 45; // Rotate 45 degrees at a time
    var spinner = document.querySelector("#spinner");
    spinner.style.transform = "rotateY(" + angle + "deg)";
}

// Set an interval for automatic rotation (e.g., every 3 seconds)
var autoRotateInterval = setInterval(autoRotate, 3000);  // Adjust the interval time as needed
 // Get modal and button elements
 var modal = document.getElementById('adminModal');
 var btn = document.getElementById('adminAccessBtn');
 var span = document.getElementsByClassName('close')[0];

 // Open the modal when the "Access Admin" button is clicked
 btn.onclick = function() {
     modal.style.display = 'block';
 }

 // Close the modal when the "X" button is clicked
 span.onclick = function() {
     modal.style.display = 'none';
 }

 // Close the modal if the user clicks outside of it
 window.onclick = function(event) {
     if (event.target == modal) {
         modal.style.display = 'none';
     }
 }

 // Handle the login form submission
 fetch('http://localhost:3000/admin')
    .then(response => response.json())
    .then(data => {
        var adminUsername = data.adminUsername;
        var adminPassword = data.adminPassword;

        // Use the values for validation
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();

            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            // Validate credentials
            if (username === adminUsername && password === adminPassword) {
                window.location.href = "admin.html";
            } else {
                alert("Invalid username or password!");
            }
        });
    })
    .catch(error => console.error('Error fetching admin credentials:', error));


// ======7BGN8SW8LBQBMG3MAC7MZ9EC 
