const React = require("react");

function App() {
  return React.createElement("div", null, "Farm2Home");
}

module.exports = App;

if (require.main === module) {
  console.log("Frontend started (React module loaded).");
}

