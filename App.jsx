import React from "react"
import ReactDOM from "react-dom/client"

function App() {
  return (
    <div style={{
      backgroundColor: "black",
      color: "lime",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "30px"
    }}>
      🚀 Crypto Commander Pro è LIVE
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
)
