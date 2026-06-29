'use client'

import { useState } from "react"

export default function Login() {
  const [password, setPassword] = useState("")

  async function login() {
    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if (data.success) {
      localStorage.setItem("admin-token", data.token)
      window.location.href = "/dashboard"
    } else {
      alert("Wrong password")
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80">
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Admin password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white w-full mt-3 p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  )
}