let getObject = () => {
  let properties = JSON.parse(localStorage.getItem("properties")) || [];
  const selectedProperty = JSON.parse(localStorage.getItem("selectedProperty"));

  let currentProperty = properties.find((p) => p.id === selectedProperty.id);

  return currentProperty;
};

let getReport = () => {
  const obj = getObject();

  console.log(obj.plot);

  if (obj.plots === undefined) return;

  window.location.href = "chart.html";
};

let getGraph = () => {};
