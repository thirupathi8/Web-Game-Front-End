import { useState } from 'react'
import "./Input.css"

function Signup({ onSignUpComplete }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3000/player/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        onSignUpComplete()
      }
      
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <>
      <div className="input-container">
        <h1 className="input-title">Signup</h1>
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
          <button type="submit" className="input-button">Signup</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </>
  )
}

export default Signup
