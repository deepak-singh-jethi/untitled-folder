// Generate unique ID for plots
function generateUUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Data management
let properties = JSON.parse(localStorage.getItem("properties")) || [];
const selectedProperty = JSON.parse(localStorage.getItem("selectedProperty"));

let currentProperty = properties.find((p) => p.id === selectedProperty.id);

let currentPlotId = null;

// Sidebar Functions
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("open");
}

// Initialize page
function loadProperty() {
  // if (!currentProperty) {
  //   window.location.href = "index.html";
  //   return;
  // }

  // Set form values
  document.getElementById("editName").value = currentProperty.name;
  document.getElementById("editSize").value = currentProperty.size;
  document.getElementById("editLocation").value = currentProperty.location;
  document.getElementById("editInvestment").value = currentProperty.investment;

  // Update display
  document.getElementById("propertyName").textContent = currentProperty.name;
  document.getElementById("propertySize").textContent = currentProperty.size;
  document.getElementById("propertyLocation").textContent =
    currentProperty.location;

  const plots = currentProperty.plots || [];
  const available = plots.filter((p) => p.availability === "available").length;
  const sold = plots.filter((p) => p.availability === "sold").length;

  document.getElementById("numPlots").textContent = plots.length;
  document.getElementById("numAvailable").textContent = available;
  document.getElementById("numSold").textContent = sold;

  renderPlots();
}

// Render plots
function renderPlots() {
  const container = document.getElementById("plotsContainer");
  container.innerHTML = "";

  if (!currentProperty.plots?.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-seedling"></i>
        <h3>No Plots Available</h3>
        <p>Start by adding your first land plot</p>
        <button class="btn-primary" onclick="toggleModal('addPlotsModal')">
          <i class="fas fa-plus"></i>
          Add New Plot
        </button>
      </div>`;
    return;
  }

  currentProperty.plots.forEach((plot) => {
    const plotEl = document.createElement("div");
    plotEl.className = "plot-card";
    plotEl.innerHTML = `
      <span class="plot-status status-${plot.availability}">${
      plot.availability
    }</span>
      <h3>Plot #${plot.id}</h3>
      <p><strong>Size:</strong> ${plot.size} sqft</p>
      <p><strong>Price:</strong> ₹${plot.price.toLocaleString()}</p>
      ${
        plot.availability === "sold"
          ? `
        <div class="sale-details">
          <h4>Buyer Information</h4>
          <p><strong>Name:</strong> ${plot.saleDetails.buyer.name}</p>
          <p><strong>Contact:</strong> ${plot.saleDetails.buyer.contact}</p>
          <p><strong>Email:</strong> ${plot.saleDetails.buyer.email}</p>
          
          <h4>Financial Details</h4>
          <p><strong>Sale Price:</strong> ₹${plot.saleDetails.salePrice.toLocaleString()}</p>
          <p><strong>Deposit:</strong> ₹${plot.saleDetails.deposit.toLocaleString()}</p>
          <p><strong>Discounts:</strong> ₹${plot.saleDetails.discounts.toLocaleString()}</p>
          <p><strong>Commission:</strong> ₹${plot.saleDetails.commission.toLocaleString()}</p>
          <p><strong>Taxes & Fees:</strong> ₹${plot.saleDetails.taxes.toLocaleString()}</p>
          <p><strong>Closing Costs:</strong> ₹${plot.saleDetails.closingCosts.toLocaleString()}</p>
          <p class="total-payable"><strong>Total Payable:</strong> ₹${plot.saleDetails.totalPayable.toLocaleString()}</p>
          
          <h4>Sale Date</h4>
          <p>${new Date(plot.saleDetails.saleDate).toLocaleDateString()}</p>
        </div>`
          : ""
      }
      <p><strong>Comments:</strong> ${plot.comments || "N/A"}</p>
      <div class="action-buttons">
        ${
          plot.availability === "available"
            ? `
          <button class="btn-success" onclick="openMarkAsSoldModal('${plot.id}')">
            <i class="fas fa-handshake"></i>
            Mark as Sold
          </button>`
            : ""
        }
        <button class="btn-primary" onclick="openEditPlotModal('${plot.id}')">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button class="btn-danger" onclick="deletePlot('${plot.id}')">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    `;
    container.appendChild(plotEl);
  });
}

// Modal handling
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.toggle("active");
}

document.querySelectorAll(".modal-overlay").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) toggleModal(modal.id);
  });
});

// Property CRUD
function handlePropertyUpdate(e) {
  e.preventDefault();

  const index = properties.findIndex((p) => p.id === currentProperty.id);
  properties[index] = {
    ...properties[index],
    name: document.getElementById("editName").value,
    size: document.getElementById("editSize").value,
    location: document.getElementById("editLocation").value,
    investment: document.getElementById("editInvestment").value,
  };

  localStorage.setItem("properties", JSON.stringify(properties));
  currentProperty = properties[index];
  loadProperty();
  toggleModal("editPropertyModal");
}

function deleteProperty() {
  if (confirm("Delete this property and all its plots?")) {
    const updatedProperties = properties.filter(
      (p) => p.id !== currentProperty.id
    );
    localStorage.setItem("properties", JSON.stringify(updatedProperties));
    localStorage.removeItem("selectedProperty");
    window.location.href = "index.html";
  }
}

// Plot CRUD
function handleAddPlots(e) {
  e.preventDefault();
  const size = document.getElementById("plotSize");
  const price = document.getElementById("plotPrice");
  const qty = document.getElementById("plotQty");

  const newPlots = Array(Number(qty.value))
    .fill()
    .map(() => ({
      id: generateUUID(),
      size: Number(size.value),
      price: Number(price.value),
      availability: "available",
      comments: document.getElementById("plotComments").value,
      addedDate: new Date().toISOString(),
    }));

  const index = properties.findIndex((p) => p.id === currentProperty.id);
  properties[index].plots = [...(properties[index].plots || []), ...newPlots];
  localStorage.setItem("properties", JSON.stringify(properties));
  currentProperty = properties[index];
  loadProperty();
  toggleModal("addPlotsModal");
}

function openMarkAsSoldModal(plotId) {
  currentPlotId = plotId;
  // Reset form fields
  document.getElementById("salePrice").value = "";
  document.getElementById("saleDeposit").value = "";
  document.getElementById("saleCommission").value = "";
  document.getElementById("saleTaxes").value = "";
  document.getElementById("saleClosingCosts").value = "";
  toggleModal("markSoldModal");
}

function handleMarkAsSold(e) {
  e.preventDefault();

  // Collect form values
  const saleDetails = {
    buyer: {
      name: document.getElementById("buyerName").value,
      contact: document.getElementById("buyerContact").value,
      email: document.getElementById("buyerEmail").value,
    },
    salePrice: Number(document.getElementById("salePrice").value),
    deposit: Number(document.getElementById("saleDeposit").value),
    discounts: Number(document.getElementById("saleDiscounts").value),
    commission: Number(document.getElementById("saleCommission").value),
    taxes: Number(document.getElementById("saleTaxes").value),
    closingCosts: Number(document.getElementById("saleClosingCosts").value),
    saleDate: new Date().toISOString(),
  };

  // Calculate total payable amount
  saleDetails.totalPayable =
    saleDetails.salePrice +
    saleDetails.taxes +
    saleDetails.closingCosts -
    (saleDetails.deposit + saleDetails.discounts) +
    saleDetails.commission;

  // Update property data
  const propIndex = properties.findIndex((p) => p.id === currentProperty.id);
  const plotIndex = properties[propIndex].plots.findIndex(
    (p) => p.id === currentPlotId
  );

  properties[propIndex].plots[plotIndex].availability = "sold";
  properties[propIndex].plots[plotIndex].saleDetails = saleDetails;

  localStorage.setItem("properties", JSON.stringify(properties));
  currentProperty = properties[propIndex];
  loadProperty();
  toggleModal("markSoldModal");
}

function openEditPlotModal(plotId) {
  currentPlotId = plotId;
  const plot = currentProperty.plots.find((p) => p.id === plotId);

  document.getElementById("editPlotSize").value = plot.size;
  document.getElementById("editPlotPrice").value = plot.price;
  document.getElementById("editPlotComments").value = plot.comments || "";

  toggleModal("editPlotModal");
}

function handleEditPlot(e) {
  e.preventDefault();
  const propIndex = properties.findIndex((p) => p.id === currentProperty.id);
  const plotIndex = properties[propIndex].plots.findIndex(
    (p) => p.id === currentPlotId
  );

  properties[propIndex].plots[plotIndex] = {
    ...properties[propIndex].plots[plotIndex],
    size: Number(document.getElementById("editPlotSize").value),
    price: Number(document.getElementById("editPlotPrice").value),
    comments: document.getElementById("editPlotComments").value,
  };

  localStorage.setItem("properties", JSON.stringify(properties));
  currentProperty = properties[propIndex];
  loadProperty();
  toggleModal("editPlotModal");
}

function deletePlot(plotId) {
  if (confirm("Delete this plot?")) {
    const propIndex = properties.findIndex((p) => p.id === currentProperty.id);
    properties[propIndex].plots = properties[propIndex].plots.filter(
      (p) => p.id !== plotId
    );
    localStorage.setItem("properties", JSON.stringify(properties));
    currentProperty = properties[propIndex];
    loadProperty();
  }
}

// Initialize
window.onload = loadProperty();
