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
// UI Helpers
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.textContent = message;

  const form = document.querySelector("#markSoldModal form");
  const existingError = form?.querySelector(".form-error");
  if (existingError) existingError.remove();

  if (form) form.insertBefore(errorDiv, form.firstChild);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "form-success";
  successDiv.textContent = message;

  const header = document.querySelector("#markSoldModal .modal-header");
  if (header) header.insertAdjacentElement("afterend", successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

// Validation Functions
const validateSalePrice = (salePrice, basePrice) => {
  if (salePrice < basePrice * 0.9) {
    showError(
      `Price too low! Must be ≥ ₹${Math.round(
        basePrice * 0.9
      ).toLocaleString()}`
    );
    return false;
  }
  return true;
};

const validateCommission = (commission, salePrice) => {
  const min = salePrice * 0.01;
  const max = salePrice * 0.05;
  if (commission < min || commission > max) {
    showError(
      `Commission must be between ₹${min.toLocaleString()} - ₹${max.toLocaleString()}`
    );
    return false;
  }
  return true;
};

const validateTaxes = (taxes, salePrice) => {
  const min = salePrice * 0.05;
  if (taxes < min) {
    showError(`Taxes too low! Minimum ₹${min.toLocaleString()} (5%)`);
    return false;
  }
  return true;
};

const validateFinancials = (saleDetails) => {
  const expected =
    saleDetails.salePrice +
    saleDetails.taxes +
    saleDetails.closingCosts -
    (saleDetails.deposit + saleDetails.discounts) +
    saleDetails.commission;

  if (Math.abs(saleDetails.totalPayable - expected) > 1) {
    showError("Calculation mismatch! Check values");
    return false;
  }
  return true;
};

const validateBuyerInfo = (buyer) => {
  if (!/^[A-Za-z ]{3,}$/.test(buyer.name)) {
    showError("Invalid buyer name");
    return false;
  }
  if (!/^[6-9]\d{9}$/.test(buyer.contact)) {
    showError("Invalid Indian phone number");
    return false;
  }
  if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(buyer.email)) {
    showError("Invalid email address");
    return false;
  }
  return true;
};

// Initialize page
function loadProperty() {
  if (!currentProperty) {
    window.location.href = "index.html";
    return;
  }

  // Update form fields
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
  document.getElementById("numPlots").textContent = plots.length;
  document.getElementById("numAvailable").textContent = plots.filter(
    (p) => p.availability === "available"
  ).length;
  document.getElementById("numSold").textContent = plots.filter(
    (p) => p.availability === "sold"
  ).length;

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
      <p><strong>Base Price:</strong> ₹${plot.price.toLocaleString()}</p>
      ${
        plot.availability === "sold"
          ? `
        <div class="sale-details">
          <h4>Buyer Details</h4>
          <p><strong>Name:</strong> ${plot.saleDetails.buyer.name}</p>
          <p><strong>Contact:</strong> ${plot.saleDetails.buyer.contact}</p>
          <p><strong>Email:</strong> ${plot.saleDetails.buyer.email}</p>
          
          <h4>Financial Breakdown</h4>
          <p>Sale Price: ₹${plot.saleDetails.salePrice.toLocaleString()}</p>
          <p>Deposit: ₹${plot.saleDetails.deposit.toLocaleString()}</p>
          <p>Discounts: ₹${plot.saleDetails.discounts.toLocaleString()}</p>
          <p>Commission: ₹${plot.saleDetails.commission.toLocaleString()}</p>
          <p>Taxes: ₹${plot.saleDetails.taxes.toLocaleString()}</p>
          <p>Closing Costs: ₹${plot.saleDetails.closingCosts.toLocaleString()}</p>
          <p class="total-payable">Total Payable: ₹${plot.saleDetails.totalPayable.toLocaleString()}</p>
          <p class="sale-date">Sold on ${new Date(
            plot.saleDetails.saleDate
          ).toLocaleDateString()}</p>
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
            Mark Sold
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
      </div>`;
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
  const plot = currentProperty.plots.find((p) => p.id === currentPlotId);
  if (!plot) return;

  const saleDetails = {
    buyer: {
      name: document.getElementById("buyerName").value.trim(),
      contact: document.getElementById("buyerContact").value.trim(),
      email: document.getElementById("buyerEmail").value.trim(),
    },
    salePrice: Number(document.getElementById("salePrice").value),
    deposit: Number(document.getElementById("saleDeposit").value),
    discounts: Number(document.getElementById("saleDiscounts").value || 0),
    commission: Number(document.getElementById("saleCommission").value),
    taxes: Number(document.getElementById("saleTaxes").value),
    closingCosts: Number(document.getElementById("saleClosingCosts").value),
    saleDate: new Date().toISOString(),
  };

  // Calculate total payable
  saleDetails.totalPayable =
    saleDetails.salePrice +
    saleDetails.taxes +
    saleDetails.closingCosts -
    (saleDetails.deposit + saleDetails.discounts) +
    saleDetails.commission;

  // Validation Chain
  if (!validateBuyerInfo(saleDetails.buyer)) return;
  if (!validateSalePrice(saleDetails.salePrice, plot.price)) return;
  if (!validateCommission(saleDetails.commission, saleDetails.salePrice))
    return;
  if (!validateTaxes(saleDetails.taxes, saleDetails.salePrice)) return;
  if (!validateFinancials(saleDetails)) return;

  // Final confirmation
  const netProceeds = saleDetails.salePrice - saleDetails.commission;
  if (
    !confirm(
      `Confirm Sale:\n\nNet Proceeds: ₹${netProceeds.toLocaleString()}\nTotal Payable: ₹${saleDetails.totalPayable.toLocaleString()}`
    )
  )
    return;

  // Update data
  const propIndex = properties.findIndex((p) => p.id === currentProperty.id);
  const plotIndex = properties[propIndex].plots.findIndex(
    (p) => p.id === currentPlotId
  );

  properties[propIndex].plots[plotIndex] = {
    ...properties[propIndex].plots[plotIndex],
    availability: "sold",
    saleDetails,
  };

  localStorage.setItem("properties", JSON.stringify(properties));
  currentProperty = properties[propIndex];
  loadProperty();
  showSuccess("Sale recorded successfully!");
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
