let getObject = () => {
  let properties = JSON.parse(localStorage.getItem("properties")) || [];
  const selectedProperty = JSON.parse(localStorage.getItem("selectedProperty"));

  let currentProperty = properties.find((p) => p.id === selectedProperty.id);

  return currentProperty;
};

let getReport = () => {
  const obj = getObject();

  console.log(obj);

  window.location.href = "chart.html";
};

let getGraph = () => {};
