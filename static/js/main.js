// Function to fetch hospital data from the JSON file
async function fetchHospitals() {
  const resultDiv = document.getElementById('hospitalResult');
  resultDiv.textContent = "Fetching nearest hospitals...";

  try {
      // Fetch the JSON file containing hospital data
      const response = await fetch('/static/hospitals.json'); // Updated path to include 'static'
      if (!response.ok) {
          throw new Error("Failed to fetch hospital data");
      }
      const hospitals = await response.json();

      if (hospitals.length === 0) {
          resultDiv.textContent = "No hospitals found nearby.";
      } else {
          let output = "<ul>";
          hospitals.forEach(hospital => {
              output += `
                  <li>
                      <strong>${hospital.name}</strong><br>
                      County: ${hospital.county}<br>
                      Sub County: ${hospital.sub_county}<br>
                      Address: ${hospital.address}<br>
                      Phone: ${hospital.phone_number}
                  </li>
              `;
          });
          output += "</ul>";
          resultDiv.innerHTML = output;
      }
  } catch (error) {
      console.error(error);
      resultDiv.textContent = "Failed to fetch hospital data.";
  }
}

// Attach event listener to the "Find Hospital" button
document.getElementById('findHospitalBtn').addEventListener('click', fetchHospitals);