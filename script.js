// Toggle Sidebar
function toggleSidebar() {
  let sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}

// Close Sidebar Function
function closeSidebar() {
  let sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("open"); // Ensures it always closes
}

// Array to Store Properties (Load from Local Storage if available)
let properties = JSON.parse(localStorage.getItem("properties")) || [];

// Function to Save Property
function saveProperty() {
  let name = document.getElementById("propertyName").value.trim();
  let size = document.getElementById("propertySize").value.trim();
  let location = document.getElementById("propertyLocation").value.trim();
  let investment = document.getElementById("propertyInvestment").value.trim();

  if (name === "" || size === "" || location === "" || investment === "") {
    alert("Please enter valid details!");
    return;
  }

  let property = {
    id: Date.now(),
    name: name,
    size: size,
    location: location,
    investment: investment,
  };

  properties.push(property);
  localStorage.setItem("properties", JSON.stringify(properties)); // Save to Local Storage

  document.getElementById("propertyName").value = "";
  document.getElementById("propertySize").value = "";
  document.getElementById("propertyLocation").value = "";
  document.getElementById("propertyInvestment").value = "";

  displayProperties();
}

// Function to Display Properties in Grid View
function displayProperties() {
  let propertyGrid = document.getElementById("propertyGrid");
  propertyGrid.innerHTML = "";

  properties.forEach((property) => {
    let div = document.createElement("div");
    div.className = "property-card";
    div.innerHTML = `
            <h3>${property.name}</h3>
            <p><strong>Size:</strong> ${property.size} sqft</p>
            <div class="property-actions">
                <button class="view-btn" onclick="viewDetails(${property.id})">View Details</button>
            </div>
        `;
    propertyGrid.appendChild(div);
  });
}

// Function to View Property Details (Using Local Storage)
function viewDetails(id) {
  let property = properties.find((p) => p.id === id);
  console.log({ id });

  if (!property) return;

  // Store selected property in localStorage
  localStorage.setItem("selectedProperty", JSON.stringify(property));
  console.log(localStorage.getItem("selectedProperty"));

  // Redirect to details page
  window.location.href = "property-details.html";
}

// Load Properties on Page Load
window.onload = displayProperties;
