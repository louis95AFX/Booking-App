// 1. Initialize Map
const map = L.map('map').setView([-13.9626, 33.7741], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Global variables for map layers
let pickupMarker, destMarker, routeLine;
let currentRate = 1800; // Default rate (Vehicle)
let calculatedDistance = 0;

// 2. Handle Car Selection Clicking
const carOptions = document.querySelectorAll('.car');
carOptions.forEach(car => {
    car.addEventListener('click', function() {
        carOptions.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        currentRate = parseFloat(this.getAttribute('data-rate'));
        updatePriceDisplay();
    });
});

// 3. Geocoding Function (Address to Lat/Lng)
async function getCoords(input) {
    // Check if input is already coordinates (lat, lng format)
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = input.match(coordRegex);
    
    if (match) {
        return { lat: parseFloat(match[1]), lon: parseFloat(match[3]) };
    }

    // Otherwise, search via Nominatim
    const viewbox = "33.70,-14.05,33.85,-13.85"; 
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&viewbox=${viewbox}&bounded=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    throw new Error("Location not found");
}

// 4. Distance Formula (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 5. Update Price UI Only
function updatePriceDisplay() {
    if (calculatedDistance === 0) return;
    
    const totalPrice = calculatedDistance * currentRate;
    const status = document.getElementById('status');
    const btn = document.getElementById('requestRide');
    
    status.innerHTML = `Distance: <b>${calculatedDistance.toFixed(2)} km</b><br>Rate: <b>MWK ${currentRate}/km</b>`;
    btn.innerText = `Confirm Ride - MWK ${totalPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
}

// 6. Main Route Logic
async function updateRide() {
    const pickupAddr = document.getElementById('pickup').value;
    const destAddr = document.getElementById('destination').value;
    const status = document.getElementById('status');

    if (!destAddr || !pickupAddr) return;

    try {
        status.innerText = "Finding locations...";
        
        // Handle "My Current Location" special case
        let p1;
        if (pickupAddr === "My Current Location" && userLatLng) {
            p1 = { lat: userLatLng.lat, lon: userLatLng.lng };
        } else {
            p1 = await getCoords(pickupAddr);
        }
        
        const p2 = await getCoords(destAddr);

        // Update Markers & Map
        if (pickupMarker) map.removeLayer(pickupMarker);
        if (destMarker) map.removeLayer(destMarker);
        if (routeLine) map.removeLayer(routeLine);

        pickupMarker = L.marker([p1.lat, p1.lon]).addTo(map).bindPopup("Pickup");
        destMarker = L.marker([p2.lat, p2.lon]).addTo(map).bindPopup("Destination");
        routeLine = L.polyline([[p1.lat, p1.lon], [p2.lat, p2.lon]], {color: '#000', weight: 4, dashArray: '10, 10'}).addTo(map);
        
        map.fitBounds(routeLine.getBounds(), {padding: [50, 50]});

        calculatedDistance = calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon);
        updatePriceDisplay();

    } catch (err) {
        status.innerText = "Location not found. Try clicking the map instead.";
        console.error(err);
    }
}

// 7. Listeners & Geolocation
let userLatLng = null;

document.getElementById('destination').addEventListener('change', updateRide);
document.getElementById('requestRide').addEventListener('click', () => {
    if (calculatedDistance > 0) alert("Order Received! A driver is being dispatched.");
});

// Click on map to set destination
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById('destination').value = `${lat}, ${lng}`;
    updateRide();
});

// User location
map.locate({setView: true, maxZoom: 15});
map.on('locationfound', (e) => {
    userLatLng = e.latlng;
    L.circleMarker(e.latlng, {radius: 6, color: '#007bff', fillOpacity: 1}).addTo(map);
    document.getElementById('pickup').value = "My Current Location";
});

map.on('locationerror', () => {
    console.log("Location access denied.");
});
// --- Suggestion Logic ---
const destInput = document.getElementById('destination');
const suggestionsBox = document.getElementById('suggestions');
let debounceTimer;

destInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    const query = this.value;

    if (query.length < 3) {
        suggestionsBox.innerHTML = '';
        return;
    }

    // Wait 300ms after user stops typing to call API
    debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
});

async function fetchSuggestions(query) {
    const viewbox = "33.70,-14.05,33.85,-13.85"; // Lilongwe area
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        renderSuggestions(data);
    } catch (err) {
        console.error("Autocomplete error:", err);
    }
}

function renderSuggestions(results) {
    suggestionsBox.innerHTML = '';
    results.forEach(place => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        // Show a shorter name for the suggestion
        div.innerText = place.display_name.split(',').slice(0, 3).join(',');
        
        div.onclick = () => {
            destInput.value = place.display_name;
            suggestionsBox.innerHTML = '';
            updateRide(); // Trigger the map and price update
        };
        suggestionsBox.appendChild(div);
    });
}

// Close suggestions if clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== destInput) suggestionsBox.innerHTML = '';
});