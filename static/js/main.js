// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Function to get current position
async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(
                resolve, 
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
    });
}

function isValidCoordinate(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
}

// Function to fetch hospital data from the API
async function fetchHospitals() {
    const resultDiv = document.getElementById('hospitalResult');
    resultDiv.innerHTML = "<div class='loading-container'><div class='loading'></div><p>Finding nearest hospitals...</p></div>";

    try {
        const position = await getCurrentPosition();
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const response = await fetch(`/hospitals?lat=${userLat}&lng=${userLng}`);
        if (!response.ok) throw new Error("Failed to fetch hospital data");
        
        const hospitals = await response.json();
        const locationResponse = await fetch(`/location-info?lat=${userLat}&lng=${userLng}`);
        const locationInfo = await locationResponse.json();

        if (hospitals.length === 0) {
            resultDiv.innerHTML = `<div class='alert alert-info'>
                No hospitals found in ${locationInfo.sub_county || 'your area'}
            </div>`;
            return;
        }

        let output = `<div class="location-info">
            <h3>Searching in: ${locationInfo.sub_county || 'Your Region'}</h3>
        </div><div class="hospital-grid">`;

        hospitals.forEach(hospital => {
            const distance = hospital.distance.toFixed(1);
            output += `
                <div class="hospital-card ${hospital.same_sub_county ? 'local' : ''}">
                    <div class="hospital-header">
                        <h3>${hospital.name}</h3>
                        ${hospital.same_sub_county ? 
                          '<span class="local-badge">Same Sub-County</span>' : ''}
                    </div>
                    <div class="hospital-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${distance} km away</p>
                        <p><i class="fas fa-location-dot"></i> ${hospital.address}</p>
                        ${hospital.sub_county ? 
                          `<p><i class="fas fa-map"></i> ${hospital.sub_county}</p>` : ''}
                    </div>
                </div>
            `;
        });
        output += "</div>";
        resultDiv.innerHTML = output;
    } catch (error) {
        handleLocationError(error, resultDiv);
    }
}

// Function to handle location errors
function handleLocationError(error, resultDiv) {
    console.error(error);
    let message = "An error occurred while fetching data.";
    
    if (error.code === 1) {
        message = "Location access denied. Please enable location services to find nearby facilities.";
    } else if (error.code === 2) {
        message = "Location unavailable. Please try again later.";
    } else if (error.code === 3) {
        message = "Location request timed out. Please try again.";
    }
    
    resultDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

// Function to get directions
function getDirections(lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

// Function to fetch ambulance data from the API
async function fetchAmbulances() {
    const resultDiv = document.getElementById('ambulanceResult');
    resultDiv.innerHTML = "Fetching nearest ambulances...<div class='loading'></div>";

    try {
        // Get current position
        const position = await getCurrentPosition();
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const response = await fetch('/ambulances');
        if (!response.ok) {
            throw new Error("Failed to fetch ambulance data");
        }
        const ambulances = await response.json();

        // Calculate distance for each ambulance and sort by distance
        const ambulancesWithDistance = ambulances.map(ambulance => ({
            ...ambulance,
            distance: calculateDistance(userLat, userLng, ambulance.lat, ambulance.lng)
        }));
        ambulancesWithDistance.sort((a, b) => a.distance - b.distance);

        if (ambulances.length === 0) {
            resultDiv.textContent = "No ambulances found nearby.";
        } else {
            let output = "<ul>";
            ambulancesWithDistance.forEach(ambulance => {
                const distance = ambulance.distance.toFixed(2);
                output += `
                    <li>
                        ID: ${ambulance.id}<br>
                        Distance: ${distance} km<br>
                        Status: ${ambulance.status}<br>
                        Contact: ${ambulance.contact}
                    </li>
                `;
            });
            output += "</ul>";
            resultDiv.innerHTML = output;
        }
    } catch (error) {
        console.error(error);
        if (error.message === 'Geolocation is not supported by your browser') {
            resultDiv.textContent = "Your browser doesn't support geolocation. Please enable location services.";
        } else if (error.code === 1) { // Permission denied
            resultDiv.textContent = "Location access denied. Please enable location services to find nearby ambulances.";
        } else {
            resultDiv.textContent = "Failed to fetch ambulance data. Please try again later.";
        }
    }
}

// BMI Calculator function
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

// Health tracker data storage with localStorage
let healthData = {
    steps: JSON.parse(localStorage.getItem('healthData_steps') || '[]'),
    water: JSON.parse(localStorage.getItem('healthData_water') || '[]')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    // Hospital and Ambulance buttons
    document.getElementById('findHospitalBtn').addEventListener('click', fetchHospitals);
    document.getElementById('findAmbulanceBtn').addEventListener('click', fetchAmbulances);

    // BMI Calculator
    document.getElementById('bmiForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const resultDiv = document.getElementById('bmiResult');

        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            resultDiv.textContent = "Please enter valid weight and height values.";
            return;
        }

        const bmi = calculateBMI(weight, height);
        const category = getBMICategory(bmi);
        resultDiv.innerHTML = `
            <p>Your BMI: <strong>${bmi}</strong></p>
            <p>Category: <strong>${category}</strong></p>
            <p>A healthy BMI ranges from 18.5 to 24.9</p>
        `;
    });

    // Health Tracker
    document.getElementById('healthTrackerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const steps = parseInt(document.getElementById('steps').value);
        const water = parseInt(document.getElementById('water').value);
        const resultDiv = document.getElementById('trackerResult');

        if (isNaN(steps) || isNaN(water) || steps < 0 || water < 0) {
            resultDiv.textContent = "Please enter valid values.";
            return;
        }

        const date = new Date().toISOString().split('T')[0];
        healthData.steps.push({ date, value: steps });
        healthData.water.push({ date, value: water });

        // Keep only last 7 days of data
        healthData.steps = healthData.steps.slice(-7);
        healthData.water = healthData.water.slice(-7);
        
        // Save to localStorage
        localStorage.setItem('healthData_steps', JSON.stringify(healthData.steps));
        localStorage.setItem('healthData_water', JSON.stringify(healthData.water));

        const avgSteps = healthData.steps.reduce((sum, entry) => sum + entry.value, 0) / healthData.steps.length;
        const avgWater = healthData.water.reduce((sum, entry) => sum + entry.value, 0) / healthData.water.length;

        resultDiv.innerHTML = `
            <p>Today's Entry:</p>
            <ul>
                <li>Steps: ${steps}</li>
                <li>Water Intake: ${water}ml</li>
            </ul>
            <p>7-Day Averages:</p>
            <ul>
                <li>Steps: ${avgSteps.toFixed(0)}</li>
                <li>Water Intake: ${avgWater.toFixed(0)}ml</li>
            </ul>
        `;
    });

    // Symptoms Checker
    document.getElementById('checkSymptomsBtn').addEventListener('click', function() {
        const symptoms = document.getElementById('symptomInput').value.toLowerCase();
        const resultDiv = document.getElementById('symptomResult');
        resultDiv.textContent = "Please consult a healthcare provider for proper medical advice.";
    });

    document.addEventListener('click', function(e) {
        if(e.target.classList.contains('directions-btn')) {
            const lat = parseFloat(e.target.dataset.lat);
            const lng = parseFloat(e.target.dataset.lng);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
    });
});