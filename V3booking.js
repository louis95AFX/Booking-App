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
    const hairstyle = form.hairstyle ? form.hairstyle.value : '';
    const size = form.size ? form.size.value : '';
    const color = form.color ? form.color.value : '';
    const date = form.date ? form.date.value : '';
    const hour = form.hour ? form.hour.value : '';
    const minute = form.minute ? form.minute.value : '';
    const time = `${hour}:${minute}`;
    const price = document.getElementById('price') ? document.getElementById('price').innerText : '';
    const appointmentType = form.appointmentType ? form.appointmentType.value : '';
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
    formData.append('hairstyle', hairstyle);
    formData.append('size', size);
    formData.append('color', color);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('price', price);
    formData.append('appointmentType', appointmentType);
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

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("newsletter-form");
    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        console.log("Form submitted!"); // Log here to confirm it's triggered
        
        const emailInput = document.getElementById("email");
        const popupOverlay = document.getElementById('popup-overlay');
        const popupText = document.getElementById('popup-text');

        console.log("Email:", emailInput.value); // Check email value

        if (!emailInput || !popupOverlay || !popupText) {
            console.error("❌ Elements not found!");
            return;
        }

        const email = emailInput.value.trim();
        if (!email) {
            alert("❌ Please enter a valid email.");
            return;
        }

        console.log("Showing pop-up...");
        popupOverlay.style.display = 'flex'; // Show pop-up

        try {
            const response = await fetch("/subscribe-newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                emailInput.value = ""; // Clear input
            }

        } catch (error) {
            console.error("❌ Error:", error);
            alert("Something went wrong.");
        } finally {
            console.log("Hiding pop-up...");
            popupOverlay.style.display = 'none'; // Hide pop-up
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
    $jq(document).ready(function() {
        function updatePrice() {
            // Base prices for each hairstyle
            var basePrices = {
                'islandtwist': 0,
                'distressedlocs': 0,
                'invisiblelocs': 0,
                'butterflylocs': 0,
                'knotlessBraids': 0,
                'knotlessBraidswithbeads': 0,
                'senegaleseTwists': 0,
                'dreadlocks': 0
            };
    
            // Size prices for each hairstyle
            var sizePrices = {
                'islandtwist': { 'small': 800, 'medium': 700, 'large': 600, 'jumbo': 500 },
                'distressedlocs': { 'shoulder': 800, 'midback': 900, 'waist': 1100, 'butt': 1200, 'knee': 1400 },
                'invisiblelocs': { 'bob': 600, 'shoulder': 650, 'midback': 750, 'waist': 800 },
                'butterflylocs': { 'shoulder': 70, 'midback': 130, 'waist': 140, 'butt': 210, 'knee': 400 },
                'knotlessBraids': { 'small': 800, 'smedium': 750, 'medium': 700, 'large': 650, 'jumbo': 600 },
                'knotlessBraidswithbeads': { 'small': 750, 'smedium': 700, 'medium': 650, 'large': 600, 'jumbo': 550 },
                'normalbraids': { 'small': 600, 'medium': 500, 'large': 400, 'jumbo': 300 },
                'Goddessbraids': { 'small': 95, 'smedium': 150, 'medium': 190, 'large': 285, 'jumbo': 400 }
            };
    
            // Size options for each hairstyle
            var sizeOptions = {
                'islandtwist': ['small', 'medium', 'large', 'jumbo'],
                'distressedlocs': ['shoulder', 'midback', 'waist', 'butt', 'knee'],
                'invisiblelocs': ['bob', 'shoulder', 'midback', 'waist'],
                'butterflylocs': ['shoulder', 'midback', 'waist', 'butt', 'knee'],
                'knotlessBraids': ['small', 'smedium', 'medium', 'large', 'jumbo'],
                'knotlessBraidswithbeads': ['small', 'smedium', 'medium', 'large', 'jumbo'],
                'normalbraids': ['small', 'medium', 'large', 'jumbo'],
                'Goddessbraids': ['small', 'smedium', 'medium', 'large', 'jumbo']
            };
    
            var selectedHairstyle = $jq('#hairstyle').val();
            var selectedSize = $jq('#size').val();
    
            var basePrice = basePrices[selectedHairstyle] || 0;
            var sizePrice = (sizePrices[selectedHairstyle] && sizePrices[selectedHairstyle][selectedSize]) || 0;
    
            // Update the displayed price
            var totalPrice = basePrice + sizePrice;
            $jq('#price').text('R' + totalPrice);
    
            // Dynamically update the size options based on the selected hairstyle
            var sizeSelect = $jq('#size');
            sizeSelect.empty(); // Clear the existing options
    
            // Add new options based on the selected hairstyle
            var availableSizes = sizeOptions[selectedHairstyle] || [];
            availableSizes.forEach(function(size) {
                sizeSelect.append('<option value="' + size + '">' + size.charAt(0).toUpperCase() + size.slice(1) + '</option>');
            });
    
            // Ensure the selected size is still available and set it
            if (availableSizes.indexOf(selectedSize) !== -1) {
                sizeSelect.val(selectedSize);
            } else {
                sizeSelect.val(availableSizes[0]); // Default to the first available size if the selected one is not found
            }
    
            // Trigger price update when a new size is selected
            sizeSelect.change(updatePrice);
        }
    
        // Trigger price update when hairstyle is selected
        $jq('#hairstyle').change(updatePrice);
    
        // Initialize price and size options on page load
        updatePrice();
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
 function showLoaderAd() {
    document.getElementById("loading-overlay").style.display = "block";
}

function hideLoaderAd() {
    document.getElementById("loading-overlay").style.display = "none";
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
            showLoaderAd();
        document.getElementById('loading-spinner').style.display = 'block'; // Show spinner

            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            // Validate credentials
            if (username === adminUsername && password === adminPassword) {
                hideLoaderAd();
        document.getElementById('loading-spinner').style.display = 'none'; // Hide spinner
                window.location.href = "admin.html";
            } else {
                alert("Invalid username or password!");
            }
        });
    })
    .catch(error => console.error('Error fetching admin credentials:', error));

    document.addEventListener("DOMContentLoaded", function () {
        const houseCallRadio = document.getElementById("houseCall");
        const walkInRadio = document.getElementById("walkIn");
        const houseCallWarning = document.getElementById("houseCallWarning");

        if (houseCallRadio && walkInRadio && houseCallWarning) { // Ensure elements exist
            houseCallRadio.addEventListener("change", function () {
                houseCallWarning.style.display = "block";
                // alert("Additional charges will apply for Uber transportation to your home.");
            });

            walkInRadio.addEventListener("change", function () {
                houseCallWarning.style.display = "none";
            });
        }
    });

// ======7BGN8SW8LBQBMG3MAC7MZ9EC 
