'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

// آدرس API داینامیک
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function LoginPage() {

  const router = useRouter()

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  async function login() {

    try {

      setLoading(true)

      setError("")

      if (!password.trim()) {

        setError("رمز را وارد کنید")
                
        return
      }

      const res = await fetch(
        `${BASE_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            password
          })
        }
      )

      const data = await res.json()

      if (!data.success) {

        setError(
          data?.message ||
          "خطا در ورود"
        )
        
        return
      }

      // ذخیره توکن
      localStorage.setItem(
        "admin-token",
        data.token
      )

      // ورود
      router.push("/dashboard")

    } catch (err) {

      console.error(err)

      setError("خطا در ورود")

    } finally {

      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-full max-w-sm space-y-4">

        <h1 className="text-2xl font-bold text-center">

          ورود مدیریت

        </h1>

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-2 w-full rounded"
        />

        <button
          onClick={login}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {loading
            ? "در حال ورود..."
            : "ورود"}
        </button>

        {error && (

          <div className="text-red-600 text-sm text-center">

            {error}

          </div>
        )}

      </div>

    </div>
  )
}