import { useState } from 'react'
import "./Input.css"

function Login({ onLoginComplete }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3000/player/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Login Failed")
      }

      localStorage.setItem("sessionToken", data.token)
      onLoginComplete()
    }
    catch (error) {
      console.error("Error:", error)
    }
  }
  return (
    <>
      <div className="input-container">
        <h1 className="input-title">Login</h1>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-url"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-url"
          />
          <button type="submit" className="input-button">Login</button>
        </form>
      </div>
    </>
  )
}

export default Login