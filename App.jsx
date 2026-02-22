import React from "react"
import ReactDOM from "react-dom/client"

const cryptoData = [
  { name: "BTC", price: 65000, change: 2.4 },
  { name: "ETH", price: 3500, change: -1.2 },
  { name: "SOL", price: 140, change: 5.8 }
]

function App() {
  return (
    <div style={{
      background: "#0a0a0a",
      color: "white",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#00ff88", textAlign: "center" }}>
        Crypto Commander Pro
      </h1>

      {cryptoData.map((coin, index) => (
        <div key={index} style={{
          border: "1px solid #222",
          padding: "15px",
          marginTop: "10px"
        }}>
          <strong>{coin.name}</strong> — ${coin.price} — 
          <span style={{ color: coin.change > 0 ? "#00ff88" : "red" }}>
            {coin.change}%
          </span>
        </div>
      ))}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)
