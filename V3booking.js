const form = document.getElementById('bookingForm');
document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting the default way
    // Show loading spinner, overlay, and "Sending Booking..." text
    document.getElementById('spinner').style.display = 'flex'; // Show spinner
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
        alert("Form Submitted!");
        document.getElementById('spinner').style.display = 'none'; // Hide spinner after submission
    }, 3000); // Replace with your actual API or form submission delay
        // Show appropriate message based on response
        if (data.status === 'success') {
            alert("Booking successfully sent!");
        } else {
            alert("There was an issue with your booking.");
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

// Alert function to show feedback messages
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
