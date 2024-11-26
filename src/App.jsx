import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'
import Game from './components/Game.jsx'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const handleSignUp = () => {
    setIsSignedUp(true)
    setShowLogin(true)
  }

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const checkSession = async () => {
    const token = localStorage.getItem("sessionToken")
    if (token) {
      try {
        const response = await fetch("http://localhost:3000/player/validate-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
        )

        if (response.ok) {
          setIsLoggedIn(true)
        }
        else {
          localStorage.removeItem("sessionToken")
        }
      }
      catch (error) {
        console.error("Error validating token: ", error)
      }
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="App">
      <h1>RPG Game</h1>
      {!isLoggedIn ? (
        <>
          <div className="btn-container">
            <button onClick={() => setShowLogin(false)} className="input-btn">Sign Up</button>
            <button onClick={() => setShowLogin(true)} className="input-btn">Login</button>
          </div>
          {showLogin ? (
            <Login onLoginComplete={handleLogin} />
          ) : (
            <Signup onSignUpComplete={handleSignUp} />
          )}
        </>
      ) : (
        <Game isLoggedIn={isLoggedIn} />
      )}
    </div>
  )
}

export default App