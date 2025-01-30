// Array to store unavailable dates (in YYYY-MM-DD format)
const unavailableDates = ["2025-01-30", "2025-02-01"];

// Prices for each service
const servicePrices = {
    "Box Braids": 500, 
    "Cornrows": 350, 
    "Twists": 400, 
    "Crochet Styles": 450
};

// Colors available for selection
const colorOptions = [
    "Black", "Brown", "Blonde", "Red", "Blue", "Purple", "Pink", "Green"
];

function openBookingForm() {
    // Create an overlay to darken the background
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlay.style.zIndex = '999';

// Create the modal form container
const bookingForm = document.createElement('div');
bookingForm.style.position = 'fixed';
bookingForm.style.top = '50%';
bookingForm.style.left = '50%';
bookingForm.style.transform = 'translate(-50%, -50%)';
bookingForm.style.backgroundColor = 'white';
bookingForm.style.padding = '30px';
bookingForm.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
bookingForm.style.borderRadius = '15px';
bookingForm.style.transition = 'opacity 0.3s ease-in-out';
bookingForm.style.width = '90%';
bookingForm.style.maxWidth = '420px';
bookingForm.style.maxHeight = '80vh';
bookingForm.style.overflowY = 'auto';
bookingForm.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
bookingForm.style.color = '#333';
bookingForm.style.zIndex = '1000';

bookingForm.innerHTML = `
    <h2 style="text-align:center; color:#333; font-size: 1.5em; margin-bottom: 20px;">Book an Appointment</h2>
    <form id="bookingForm" style="display: flex; flex-direction: column; gap: 15px;">
        <label for="name" style="font-size: 1em; font-weight: 600; color: #555;">Name:</label>
        <input type="text" id="name" name="name" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
        
        <label for="email" style="font-size: 1em; font-weight: 600; color: #555;">Email:</label>
        <input type="email" id="email" name="email" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
        
        <label for="cell" style="font-size: 1em; font-weight: 600; color: #555;">Cell Number:</label>
        <input type="tel" id="cell" name="cell" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
        
        <label for="service" style="font-size: 1em; font-weight: 600; color: #555;">Service:</label>
        <select id="service" name="service" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
            <option value="Box Braids">Box Braids - R500</option>
            <option value="Cornrows">Cornrows - R350</option>
            <option value="Twists">Twists - R400</option>
            <option value="Crochet Styles">Crochet Styles - R450</option>
        </select>
        
        <label for="color" style="font-size: 1em; font-weight: 600; color: #555;">Color Style:</label>
        <select id="color" name="color" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
            ${colorOptions.map(color => `<option value="${color}">${color}</option>`).join('')}
        </select>
        
        <label for="price" style="font-size: 1em; font-weight: 600; color: #555;">Estimated Price:</label>
        <input type="text" id="price" name="price" readonly style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f4f4f4; font-size: 1em; width: 100%;">

        <label for="date" style="font-size: 1em; font-weight: 600; color: #555;">Preferred Date:</label>
        <input type="date" id="date" name="date" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%;">

        <label for="time" style="font-size: 1em; font-weight: 600; color: #555;">Preferred Time:</label>
        <select id="time" name="time" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%; transition: border 0.3s ease;">
            <option value="" disabled selected>Select a time</option>
            <option value="08:00AM">04:00 AM</option>
            <option value="08:00AM">05:00 AM</option>
            <option value="08:00AM">06:00 AM</option>
            <option value="08:00AM">07:00 AM</option>
            <option value="08:00AM">08:00 AM</option>
            <option value="09:00AM">09:00 AM</option>
            <option value="10:00AM">10:00 AM</option>
            <option value="11:00AM">11:00 AM</option>
            <option value="12:00PM">12:00 PM</option>
            <option value="01:00PM">13:00 PM</option>
            <option value="02:00PM">14:00 PM</option>
            <option value="03:00PM">15:00 PM</option>
            <option value="04:00PM">16:00 PM</option>
            <option value="04:00PM">17:00 PM</option>
            <option value="04:00PM">18:00 PM</option>
            <option value="04:00PM">19:00 PM</option>
            <option value="04:00PM">20:00 PM</option>
        </select>

        <h3 style="font-size: 1.1em; color: #555; margin-top: 25px;">Payment Details (EFT)</h3>
        <p style="font-size: 0.9em; color: #555;">Please make payment to:</p>
        <p><strong>Bank Name:</strong> XYZ Bank</p>
        <p><strong>Account Number:</strong> 123 456 789</p>
        <p><strong>Reference:</strong> Your Name</p>

        <label for="paymentProof" style="font-size: 1em; font-weight: 600; color: #555;">Upload Proof of Payment:</label>
        <input type="file" id="paymentProof" name="paymentProof" accept=".jpg, .png, .pdf" required style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1em; width: 100%;">

        <label for="serviceType" style="font-size: 1em; font-weight: 600; color: #555;">Choose Service Type:</label>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="radio" id="walkIn" name="serviceType" value="Walk-in">
            <label for="walkIn" style="color:#555;">Walk-in</label>

            <input type="radio" id="houseCall" name="serviceType" value="House Call">
            <label for="houseCall" style="color:#555;">House Call</label>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 25px;">
            <button type="submit" style="flex:1; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1em; transition: background-color 0.3s ease;">
                Submit
            </button>
            <button type="button" onclick="closeBookingForm()" style="flex:1; margin-left: 10px; padding: 12px; background-color: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1em; transition: background-color 0.3s ease;">
                Cancel
            </button>
        </div>
    </form>
`;

// Attach overlay and form to the body
document.body.appendChild(overlay);
document.body.appendChild(bookingForm);

document.querySelector('button[type="button"]').addEventListener('click', closeBookingForm);


    // Disable unavailable dates in the date picker
    const dateInput = document.getElementById('date');
    dateInput.addEventListener('focus', () => {
        const today = new Date().toISOString().split("T")[0];
        dateInput.min = today; // Prevent selecting past dates
    });

    dateInput.addEventListener("change", () => {
        if (unavailableDates.includes(dateInput.value)) {
            alert("Selected date is unavailable. Please choose another date.");
            dateInput.value = "";
        }
    });

    // Add event listener for radio buttons to show an alert when 'House Call' is selected
const houseCallRadio = document.getElementById('houseCall');
houseCallRadio.addEventListener('change', () => {
    if (houseCallRadio.checked) {
        alert("Note: There will be an extra fee for the house call as an Uber will need to be arranged for the braider.");
    }
});

    // Update price based on selected service
    const serviceSelect = document.getElementById('service');
    const priceInput = document.getElementById('price');
    serviceSelect.addEventListener('change', () => {
        priceInput.value = "R" + servicePrices[serviceSelect.value];
    });

    // Set initial price on form load
    priceInput.value = "R" + servicePrices[serviceSelect.value];

    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    
         // Show loading spinner, overlay, and "Sending Booking..." text
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('loading-text').style.display = 'block';
    
        // Hide the submit button
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
    
        // Gather form data
        const name = form.name.value;
        const email = form.email.value;
        const cell = form.cell.value;
        const service = form.service.value;
        const color = form.color.value;
        const date = form.date.value;
        const time = form.time.value;  // Get the selected time
        const price = form.price.value;
        const serviceType = form.serviceType.value;
        const paymentProof = document.getElementById('paymentProof').files[0];
    
        if (!paymentProof) {
            alert("Proof of payment is required!");
            document.getElementById('loading-spinner').style.display = 'none';
            submitButton.disabled = false; // Enable the submit button again
            return;
        }
    
        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('cell', cell);
        formData.append('service', service);
        formData.append('color', color);
        formData.append('date', date);
        formData.append('time', time);  // Append the time value
        formData.append('price', price);
        formData.append('serviceType', serviceType);
        formData.append('paymentProof', paymentProof); // Attach the file
    
        // Send request to the backend (do NOT set Content-Type manually)
        fetch('http://localhost:3000/submit-booking', {
            method: 'POST',
            body: formData, // Sending FormData (files included)
        })
        .then(response => response.json()) // Parse JSON response
        .then(data => {
            // Hide the loading spinner and enable the submit button
             // Hide loading spinner, overlay, and "Sending Booking..." text
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('loading-text').style.display = 'none';
            submitButton.disabled = false;
    
            if (data.status === 'success') {
                showAlert("Booking Successfully sent, we will get back to you shortly.");
    
                setTimeout(() => {
                    closeBookingForm();
                }, 3000);
            } else {
                console.error('Server Error:', data.message);
                alert("There was an issue with your booking.");
            }
        })
        .catch(error => {
            // Hide the loading spinner and enable the submit button
            document.getElementById('loading-spinner').style.display = 'none';
            submitButton.disabled = false;
    
            console.error('Error:', error);
            alert("There was an issue with your booking.");
        });
    });
    
    // Alert function
    function showAlert(message) {
        const alertBox = document.getElementById('alert-box');
        const alertMessage = document.getElementById('alert-message');
    
        alertMessage.innerText = message;
        alertBox.classList.add('show');
    
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 3000);
    }
    
    function closeBookingForm() {
        window.location.href = 'booking.html'; // Redirect to the home page
    }
    
}
