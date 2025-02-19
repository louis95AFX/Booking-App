const form = document.getElementById('bookingForm');
document.addEventListener("DOMContentLoaded", function () {
    const hairstyleSelect = document.getElementById("hairstyle"); // Select hairstyle dropdown
    const colorSelect = document.getElementById("color"); // Select color dropdown
    const colorContainer = document.getElementById("color-container"); // Container for title + dropdown
    const notification = document.getElementById("notification"); // Notification message


    function toggleColorSelection() {
        const selectedHairstyle = hairstyleSelect.value;
        if (selectedHairstyle === "Goddess_braids_Hairpiece_Not_Included" || 
            selectedHairstyle === "knotless_Braids_Hairpiece_Not_Included") {
            colorSelect.style.display = "none"; // Hide the color selection
            colorContainer.style.display = "none"; // Hide the entire section
            notification.style.display = "block"; // Show notification

        } else {
            colorSelect.style.display = "block"; // Show the color selection
            colorContainer.style.display = "block"; // Show the section
            notification.style.display = "none"; // Hide notification

        }
    }

    // Event listener to detect changes in the hairstyle selection
    hairstyleSelect.addEventListener("change", toggleColorSelection);

    // Initial check in case the page is loaded with a pre-selected value
    toggleColorSelection();
});

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    var beadColor = document.getElementById('beadColor');
    
    if (beadColorContainer.style.display !== "none" && beadColor.value === "") {
        alert("Please select a bead color.");
        event.preventDefault(); // Prevent form submission
    }
});
document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting the default way

    // Show the modal
    document.getElementById('policyModal').style.display = 'flex';

    // Handle Accept Button Click
    document.getElementById('acceptPolicy').addEventListener('click', function () {
        document.getElementById('policyModal').style.display = 'none'; // Hide modal
        proceedWithFetch(); // Run the fetch function
    });

    // Handle Decline Button Click
    document.getElementById('declinePolicy').addEventListener('click', function () {
        window.location.href = 'booking.html'; // Redirect to booking page
    });

    function proceedWithFetch() {
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
        
        // Handle optional extras (check which checkboxes are selected)
        const extras = [];

        // Add selected extras based on checked checkboxes
        if (document.getElementById('extraCurls') && document.getElementById('extraCurls').checked) {
            extras.push('Extra Curls (R100)');
        }

        if (document.getElementById('goddessExtra') && document.getElementById('goddessExtra').checked) {
            extras.push('Goddess (R200)');
        }

        if (document.getElementById('highlightExtra') && document.getElementById('highlightExtra').checked) {
            extras.push('Highlight (R150)');
        }

        if (document.getElementById('extraLengthKnotless') && document.getElementById('extraLengthKnotless').checked) {
            extras.push('Extra Length Knotless (R50)');
        }

        if (document.getElementById('goddessExtraInvisible') && document.getElementById('goddessExtraInvisible').checked) {
            extras.push('Goddess Invisible (R100)');
        }

        if (document.getElementById('highlightPeekabooExtra') && document.getElementById('highlightPeekabooExtra').checked) {
            extras.push('Highlight/Peekaboo Invisible (R120)');
        }

        if (document.getElementById('goddessExtraButterfly') && document.getElementById('goddessExtraButterfly').checked) {
            extras.push('Goddess Butterfly (R200)');
        }

        if (document.getElementById('highlightExtraButterfly') && document.getElementById('highlightExtraButterfly').checked) {
            extras.push('Highlight Butterfly (R150)');
        }

        if (document.getElementById('extraBeads') && document.getElementById('extraBeads').checked) {
            extras.push('Extra Beads (R50)');
        }

        if (document.getElementById('extraLengthNormal') && document.getElementById('extraLengthNormal').checked) {
            extras.push('Extra Length Normal (R50)');
        }

        if (document.getElementById('extraLengthHairpieceNotIncluded') && document.getElementById('extraLengthHairpieceNotIncluded').checked) {
            extras.push('Extra Length Hairpiece Not Included (R50)');
        }

        // Check if required fields are empty
        if (!name || !email || !cell || !hairstyle || !size || !color || !date || !hour || !minute || !paymentProof) {
            alert("Please fill in all required fields!");
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('loading-text').style.display = 'none'; // Hide loading text
            return;
        }

        // Check if payment proof exists
        if (!paymentProof) {
            alert("Proof of payment is required!");
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('loading-text').style.display = 'none'; // Hide loading text
            return;
        }

        // Initialize selectedColors as an array
        const selectedColors = [];

        // Add selected colors to the array (example: collecting values of selected checkboxes)
        const colorInputs = document.querySelectorAll('input[name="colorBlend"]:checked'); // Change this to colorBlend
        console.log("Checked color checkboxes:", colorInputs); // Log to debug
        colorInputs.forEach(function(input) {
            selectedColors.push(input.value);
        });

        console.log("Selected colors array:", selectedColors); // Log the selected colors

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

        // Check if selectedColors has been populated before appending to FormData
        if (selectedColors.length > 0) {
            formData.append('colorBlend', selectedColors.join(', ')); // Append the selected colors as a comma-separated string
        }

        // Add extras to formData if selected
        if (extras.length > 0) {
            formData.append('extras', extras.join(', ')); // Send as a comma-separated list
        }

        // Send the form data using Fetch API
        fetch('https://booking-app-c91o.onrender.com/submit-booking', {
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
    }
});


// Booking Form Submit Listener (your existing code)
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent form from submitting the default way
    // Your existing booking form submission logic
});

document.getElementById('subscribeForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from submitting the default way

    // const responseMessage = document.getElementById('responseMessage');
    // const errorMessage = document.getElementById('errorMessage');

    // Clear previous messages
    // if (responseMessage) responseMessage.textContent = '';
    // if (errorMessage) errorMessage.textContent = '';

    const email = document.getElementById('email').value.trim();

    // Basic email validation
    if (!email || !validateEmail(email)) {
        if (errorMessage) errorMessage.textContent = "❌ Please enter a valid email address.";
        return;
    }

    try {
        // Sending subscription request to server
        const response = await fetch('https://booking-app-c91o.onrender.com/subscribe-newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.status === 200) {
            // Successfully subscribed
            if (responseMessage) responseMessage.textContent = result.message;
        } else {
            // Show error message from server
            if (errorMessage) errorMessage.textContent = result.message;
        }
    } catch (error) {
        // Handle unexpected errors
        console.error("Error during subscription request:", error);
        if (errorMessage) errorMessage.textContent = "❌ Something went wrong. Please try again later.";
    }
});

// Email validation function
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}


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
         const response = await fetch("https://booking-app-c91o.onrender.com/contact", {
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
            var basePrices = {
                'islandtwist': 0,
                'distressedlocs': 0,
                'invisiblelocs': 0,
                'butterflylocs': 0,
                'knotlessBraids': 0,
                'knotless_Braids_with_beads': 0,
                'normalBraids': 0,
                'normal_Braids_Hairpiece_Not_Included': 0,
                'Goddessbraids': 0,
                'knotless_Braids_Hairpiece_Not_Included': 0, // New option
                'Goddess_braids_Hairpiece_Not_Included': 0,  // New option
            };
    
            var sizePrices = {
                'islandtwist': { 'small': 800, 'medium': 700, 'large': 600, 'jumbo': 500 },
                'distressedlocs': { 'shoulder': 800, 'midback': 900, 'waist': 1100, 'butt': 1200, 'knee': 1400 },
                'invisiblelocs': { 'bob': 600, 'shoulder': 650, 'midback': 750, 'waist': 800 },
                'butterflylocs': { 'shoulder': 900, 'midback': 1000, 'waist': 1200, 'butt': 1350, 'knee': 1500 },
                'knotlessBraids': { 'small': 800, 'smedium': 750, 'medium': 650, 'large': 600, 'jumbo': 550 },
                'knotless_Braids_with_beads': { 'small': 750, 'smedium': 700, 'medium': 750, 'large': 700, 'jumbo': 650 },
                'normalBraids': { 'small': 600, 'medium': 500, 'large': 400, 'jumbo': 300 },
                'normal_Braids_Hairpiece_Not_Included': { 'small': 600, 'medium': 500, 'large': 400, 'jumbo': 300 },  // New option for normal braids hairpiece not included
                'Goddessbraids': { 'small': 900, 'medium': 850, 'large': 800 },
                'knotless_Braids_Hairpiece_Not_Included': { 'small': 550, 'smedium': 500, 'medium': 400, 'large': 450, 'jumbo': 400 }, // New option prices
                'Goddess_braids_Hairpiece_Not_Included': { 'small': 550, 'smedium': 500, 'medium': 400, 'large': 800,'jumbo': 400 },  // New option prices
            };
    
            var sizeOptions = {
                'islandtwist': ['small', 'medium', 'large', 'jumbo'],
                'distressedlocs': ['shoulder', 'midback', 'waist', 'butt', 'knee'],
                'invisiblelocs': ['bob', 'shoulder', 'midback', 'waist'],
                'butterflylocs': ['shoulder', 'midback', 'waist', 'butt', 'knee'],
                'knotlessBraids': ['small', 'smedium', 'medium', 'large', 'jumbo'],
                'knotless_Braids_with_beads': ['small', 'smedium', 'medium', 'large', 'jumbo'],
                'normalBraids': ['small', 'medium', 'large', 'jumbo'],
                'normal_Braids_Hairpiece_Not_Included': ['small', 'medium', 'large', 'jumbo'],  // New option for normal braids hairpiece not included sizes
                'Goddessbraids': ['small', 'medium', 'large'],
                'knotless_Braids_Hairpiece_Not_Included': ['small', 'medium', 'large', 'jumbo'], // New option sizes
                'Goddess_braids_Hairpiece_Not_Included': ['small', 'medium', 'large'],  // New option sizes
            };
    
            var selectedHairstyle = $jq('#hairstyle').val();
            var selectedSize = $jq('#size').val();
            var basePrice = basePrices[selectedHairstyle] || 0;
            var sizePrice = (sizePrices[selectedHairstyle] && sizePrices[selectedHairstyle][selectedSize]) || 0;
    
            // Extras
            var extraCurlsPrice = $jq('#extraCurls').prop('checked') && selectedHairstyle === 'islandtwist' ? 100 : 0;
            var goddessExtraDistressed = $jq('#goddessExtra').prop('checked') && selectedHairstyle === 'distressedlocs' ? 200 : 0;
            var highlightExtraDistressed = $jq('#highlightExtra').prop('checked') && selectedHairstyle === 'distressedlocs' ? 150 : 0;
            var extraLengthKnotless = $jq('#extraLengthKnotless').prop('checked') && selectedHairstyle === 'knotlessBraids' ? 50 : 0; // This line handles extra length for Knotless Braids
            var extraBeadsPrice = $jq('#extraBeads').prop('checked') && selectedHairstyle === 'knotless_Braids_with_beads' ? 50 : 0;
            var goddessExtraInvisible = $jq('#goddessExtraInvisible').prop('checked') && selectedHairstyle === 'invisiblelocs' ? 100 : 0;
            var highlightPeekabooExtra = $jq('#highlightPeekabooExtra').prop('checked') && selectedHairstyle === 'invisiblelocs' ? 120 : 0;
            var goddessExtraButterfly = $jq('#goddessExtraButterfly').prop('checked') && selectedHairstyle === 'butterflylocs' ? 200 : 0;
            var highlightExtraButterfly = $jq('#highlightExtraButterfly').prop('checked') && selectedHairstyle === 'butterflylocs' ? 150 : 0;
            var extraLengthNormal = $jq('#extraLengthNormal').prop('checked') && selectedHairstyle === 'normalBraids' ? 50 : 0;
            var colorBlendPrice = $jq('#colorBlend').prop('checked') ? 50 : 0; // Color blend extra


    
            // Corrected and added unique identifiers for Hairpiece Not Included length
            var extraLengthHairpieceNotIncludedNormal = $jq('#extraLengthHairpieceNotIncluded').prop('checked') && (selectedHairstyle === 'normal_Braids_Hairpiece_Not_Included') ? 50 : 0;
            var extraLengthHairpieceNotIncludedKnotless = $jq('#extraLengthHairpieceNotIncluded').prop('checked') && (selectedHairstyle === 'knotless_Braids_Hairpiece_Not_Included') ? 50 : 0;
            var extraLengthHairpieceNotIncludedGoddess = $jq('#extraLengthHairpieceNotIncluded').prop('checked') && (selectedHairstyle === 'Goddess_braids_Hairpiece_Not_Included') ? 50 : 0;
    
            var totalPrice = basePrice + sizePrice + extraCurlsPrice + goddessExtraDistressed + highlightExtraDistressed +
                extraLengthKnotless + extraBeadsPrice + goddessExtraInvisible + highlightPeekabooExtra +
                goddessExtraButterfly + highlightExtraButterfly + extraLengthNormal + extraLengthHairpieceNotIncludedNormal +
                extraLengthHairpieceNotIncludedKnotless + extraLengthHairpieceNotIncludedGoddess + colorBlendPrice;
    
            $jq('#price').text('R' + totalPrice);
               
            // Update size options dynamically
            var sizeSelect = $jq('#size');
            sizeSelect.empty();
    
            // Always add the placeholder first, before dynamic options
            sizeSelect.append('<option value="" disabled selected>Select Size</option>');
    
            var availableSizes = sizeOptions[selectedHairstyle] || [];
            availableSizes.forEach(function(size) {
                sizeSelect.append('<option value="' + size + '">' + size.charAt(0).toUpperCase() + size.slice(1) + '</option>');
            });
    
            // Ensure the selected size is still valid or set to the first available option
            if (selectedSize === "" || availableSizes.indexOf(selectedSize) === -1) {
                sizeSelect.val(""); // Keep the placeholder if no valid size is selected
            } else {
                sizeSelect.val(selectedSize); // Set the selected size if it's valid
            }
        }
    
        // Trigger price update when an option changes
        $jq('#hairstyle').change(updatePrice);
        $jq('#size').change(updatePrice);
        $jq('#extraCurls').change(updatePrice);
        $jq('#goddessExtra').change(updatePrice);
        $jq('#highlightExtra').change(updatePrice);
        $jq('#extraLengthKnotless').change(updatePrice);  // Ensure this triggers the price update
        $jq('#extraBeads').change(updatePrice);
        $jq('#goddessExtraInvisible').change(updatePrice);
        $jq('#highlightPeekabooExtra').change(updatePrice);
        $jq('#goddessExtraButterfly').change(updatePrice);
        $jq('#highlightExtraButterfly').change(updatePrice);
        $jq('#extraLengthNormal').change(updatePrice);
        $jq('#extraLengthHairpieceNotIncluded').change(updatePrice); 
        $jq('#colorBlend').change(updatePrice);

    
        $jq('#hairstyle').change(function() {
            $jq('#extraCurlsContainer').toggle($jq(this).val() === 'islandtwist');
            $jq('#extraOptionsDistressed').toggle($jq(this).val() === 'distressedlocs');
            $jq('#extraOptionsKnotless').toggle($jq(this).val() === 'knotlessBraids');
            $jq('#extraOptionsKnotlessBeads').toggle($jq(this).val() === 'knotless_Braids_with_beads');
            $jq('#extraOptionsInvisible').toggle($jq(this).val() === 'invisiblelocs');
            $jq('#extraOptionsButterfly').toggle($jq(this).val() === 'butterflylocs');
            $jq('#extraOptionsNormal').toggle($jq(this).val() === 'normalBraids');
            $jq('#extraOptionsHairpieceNotIncluded').toggle($jq(this).val() === 'knotless_Braids_Hairpiece_Not_Included'); 
            $jq('#extraOptionsHairpieceNotIncluded').toggle($jq(this).val() === 'Goddess_braids_Hairpiece_Not_Included'); 
            $jq('#extraOptionsHairpieceNotIncluded').toggle($jq(this).val() === 'normal_Braids_Hairpiece_Not_Included');

        });
       // "Done" button functionality - add R50
       $jq('#doneButton').click(function() {
        var currentPrice = parseInt($jq('#price').text().replace('R', '')) || 0;
        var newPrice = currentPrice + 50;
        $jq('#price').text('R' + newPrice);
    });

    
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
 fetch('https://booking-app-c91o.onrender.com/admin')
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
