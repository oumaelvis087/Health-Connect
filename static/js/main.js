// Global variables
let map;
let userLocation;
let markers = [];

// Initialize maps when the page loads
window.onload = function() {
    // Request user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initializeMaps, handleLocationError);
    }
};

// Initialize Google Maps
function initializeMaps(position) {
    userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // Initialize ambulance map
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: userLocation,
    });

    // Initialize hospital map
    const hospitalMap = new google.maps.Map(document.getElementById("hospital-map"), {
        zoom: 14,
        center: userLocation,
    });

    // Add user marker to both maps
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location"
    });

    new google.maps.Marker({
        position: userLocation,
        map: hospitalMap,
        title: "Your Location"
    });
}

// Handle location errors
function handleLocationError(error) {
    console.error("Error getting location:", error);
    alert("Unable to get your location. Please enable location services.");
}

// Find nearest ambulance
function findNearestAmbulance() {
    // Simulated ambulance data - in real application, this would come from a backend API
    const ambulances = [
        { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01, id: 1 },
        { lat: userLocation.lat - 0.01, lng: userLocation.lng - 0.01, id: 2 }
    ];

    // Clear existing markers
    clearMarkers();

    // Add new markers for each ambulance
    ambulances.forEach(ambulance => {
        const marker = new google.maps.Marker({
            position: ambulance,
            map: map,
            icon: 'ambulance-icon.png' // You would need to add this icon
        });
        markers.push(marker);
    });
}

// Find nearest hospital
function findNearestHospital() {
    // Simulated hospital data - in real application, this would come from a backend API
    const hospitals = [
        { lat: userLocation.lat + 0.02, lng: userLocation.lng + 0.02, name: "City Hospital" },
        { lat: userLocation.lat - 0.02, lng: userLocation.lng - 0.02, name: "General Hospital" }
    ];

    // Add markers for each hospital
    hospitals.forEach(hospital => {
        new google.maps.Marker({
            position: hospital,
            map: hospitalMap,
            title: hospital.name
        });
    });
}

// Clear markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Check symptoms
function checkSymptoms() {
    const symptoms = document.getElementById('symptoms-input').value;
    const resultDiv = document.getElementById('symptoms-result');
    
    // In a real application, this would make an API call to a medical database
    // For now, we'll just show a placeholder message
    resultDiv.innerHTML = `
        <div class="alert alert-info">
            Based on your symptoms "${symptoms}", we recommend consulting a healthcare professional.
            Please note that this is not a medical diagnosis.
        </div>
    `;
}

// Handle vitals form submission
document.getElementById('vitals-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const bp = document.getElementById('bp').value;
    const heartRate = document.getElementById('heart-rate').value;
    
    // In a real application, this would be saved to a database
    updateVitalsHistory(bp, heartRate);
});

// Update vitals history
function updateVitalsHistory(bp, heartRate) {
    const history = document.getElementById('vitals-history');
    const date = new Date().toLocaleDateString();
    
    history.innerHTML += `
        <div class="alert alert-success mb-2">
            <strong>${date}</strong><br>
            Blood Pressure: ${bp}<br>
            Heart Rate: ${heartRate} bpm
        </div>
    `;
}

// Handle BMI form submission
document.getElementById('bmi-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    
    calculateBMI(weight, height);
});

// Calculate BMI
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const resultDiv = document.getElementById('bmi-result');
    
    let category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <strong>Your BMI: ${bmi.toFixed(1)}</strong><br>
            Category: ${category}
        </div>
    `;
}