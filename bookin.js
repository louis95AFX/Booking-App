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
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999'; // Overlay is above other content

    // Create the modal form container
    const bookingForm = document.createElement('div');
    bookingForm.style.position = 'fixed';
    bookingForm.style.top = '50%';
    bookingForm.style.left = '50%';
    bookingForm.style.transform = 'translate(-50%, -50%)';
    bookingForm.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Black with transparency
    bookingForm.style.padding = '25px';
    bookingForm.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
    bookingForm.style.borderRadius = '12px';
    bookingForm.style.transition = 'opacity 0.3s ease-in-out';
    bookingForm.style.width = '90%';
    bookingForm.style.maxWidth = '355px'; // Adjusted max width for larger inputs
    bookingForm.style.maxHeight = '80vh';
    bookingForm.style.overflowY = 'auto';
    bookingForm.style.fontFamily = 'Arial, sans-serif';
    bookingForm.style.color = '#000'; // Default text color to black
    bookingForm.style.zIndex = '1000'; // Above the overlay

    bookingForm.innerHTML = `
        <h2 style="text-align:center; color:white;">Book an Appointment</h2>
        <form id="bookingForm" style="display: flex; flex-direction: column; gap: 12px;">
            <label for="name" style="color:#000;">Name:</label>
            <input type="text" id="name" name="name" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">

            <label for="email" style="color:#000;">Email:</label>
            <input type="email" id="email" name="email" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">

            <label for="cell" style="color:#000;">Cell Number:</label>
            <input type="tel" id="cell" name="cell" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">

            <label for="service" style="color:#000;">Service:</label>
            <select id="service" name="service" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">
                <option value="Box Braids">Box Braids - R500</option>
                <option value="Cornrows">Cornrows - R350</option>
                <option value="Twists">Twists - R400</option>
                <option value="Crochet Styles">Crochet Styles - R450</option>
            </select>

            <!-- Added color selection dropdown -->
            <label for="color" style="color:#000;">Color Style:</label>
            <select id="color" name="color" style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">
                ${colorOptions.map(color => `<option value="${color}">${color}</option>`).join('')}
            </select>

            <label for="price" style="color:#000;">Estimated Price:</label>
            <input type="text" id="price" name="price" readonly style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; width: 100%;">

            <label for="date" style="color:#000;">Preferred Date:</label>
            <input type="date" id="date" name="date" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">

            <label for="time" style="color:#000;">Preferred Time:</label>
<select id="time" name="time" required style="padding: 8px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">
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

            <h3 style="margin-top: 15px; color:#000;">Payment Details (EFT)</h3>
            <p style="font-size: 14px; color:#000;">Please make payment to:</p>
            <p><strong>Bank Name:</strong> XYZ Bank</p>
            <p><strong>Account Number:</strong> 123 456 789</p>
            <p><strong>Reference:</strong> Your Name</p>

            <label for="paymentProof" style="color:#000;">Upload Proof of Payment:</label>
            <input type="file" id="paymentProof" name="paymentProof" accept=".jpg, .png, .pdf" required style="padding: 5px; border: 1px solid #ccc; border-radius: 5px; width: 100%;">

            <!-- Walk-in or House Call radio buttons -->
            <label for="serviceType" style="color:#000;">Choose Service Type:</label>
            <div style="display: flex; flex-direction: column; gap: 10px; color:#000;">
                <input type="radio" id="walkIn" name="serviceType" value="Walk-in" style="margin-left: 5px;">
                <label for="walkIn" style="color:#000;">Walk-in</label>

                <input type="radio" id="houseCall" name="serviceType" value="House Call" style="margin-left: 5px;">
                <label for="houseCall" style="color:#000;">House Call</label>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                <button type="submit" style="flex:1; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Submit
                </button>
                <button type="button" onclick="closeBookingForm()" style="flex:1; margin-left: 10px; padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    Cancel
                </button>
            </div>
        </form>
    `;

    // Append overlay and booking form to the body
    document.body.appendChild(overlay);
    document.body.appendChild(bookingForm);

    // Function to close the booking form modal
    // function closeBookingForm() {
    //     window.location.href = 'booking.html'; 
    // }

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
    
        // Gather form data
        const name = form.name.value;
        const email = form.email.value;
        const cell = form.cell.value;
        const service = form.service.value;
        const color = form.color.value;  // Added color selection data
        const date = form.date.value;
        const serviceType = form.serviceType.value;  // Added serviceType in the notification
    
        // Prepare the FormData object
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('cell', cell);
        formData.append('service', service);
        formData.append('color', color);
        formData.append('date', date);
        formData.append('serviceType', serviceType);
    
        // Send the request to the backend server (make sure the URL points to your backend)
        fetch('http://localhost:3000/submit-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                cell,
                service,
                color,
                date,
                serviceType
            }),
        })
       
        closeBookingForm();
        
    });
    
    
}

function closeBookingForm() {
        window.location.href = 'booking.html'; // Redirect to the home page
  
}

// Notify admin (simulated for now, replace with actual email or database entry)
function notifyAdmin(name, email, cell, service, date) {
    const bookingDetails = { name, email, cell, service, date };

    fetch('/sendBookingNotification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Admin notified successfully');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

