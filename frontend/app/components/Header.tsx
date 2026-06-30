'use client'

import { useState } from "react"

export default function Header() {

  // ========================
  // STATE
  // ========================
  const [showPasswordBox, setShowPasswordBox] =
    useState(false)

  const [oldPassword, setOldPassword] =
    useState("")

  const [newPassword, setNewPassword] =
    useState("")

  // ========================
  // LOGOUT
  // ========================
  function logout() {

    localStorage.removeItem(
      "admin-token"
    )

    window.location.href = "/login"
  }

// ========================
// CHANGE PASSWORD
// ========================
async function changePassword() {

  if (!oldPassword || !newPassword) {

    alert("تمام فیلدها الزامی است")

    return
  }

  try {

    const token =
      localStorage.getItem(
        "admin-token"
      )

    const res = await fetch(
      "http://localhost:3001/api/change-password",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      }
    )

    const data =
      await res.json()

    if (data.success) {

      alert("رمز تغییر کرد")

      setOldPassword("")
      setNewPassword("")
      setShowPasswordBox(false)

    } else {

      alert(
        data.message ||
        "خطا در تغییر رمز"
      )
    }

  } catch (err) {

    console.error(err)

    alert("خطا در ارتباط با سرور")
  }
}

  // ========================
  // UI
  // ========================
  return (

    <div className="bg-white shadow px-6 py-4 border-b">

      <div className="flex items-center justify-between">

        {/* TITLE */}
        <div>

          <h1 className="text-2xl font-bold text-gray-800">

            پنل مدیریت مهمان‌ها

          </h1>

          <p className="text-sm text-gray-500 mt-1">

            سیستم مدیریت لینک مهمان

          </p>

        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">

          {/* STATUS */}
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">

            آنلاین

          </div>

          {/* CHANGE PASSWORD */}
          <button
            onClick={() =>
              setShowPasswordBox(
                !showPasswordBox
              )
            }
            className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-4 py-2 rounded"
          >
            تغییر رمز
          </button>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded"
          >
            خروج
          </button>

        </div>

      </div>

      {/* PASSWORD BOX */}
      {showPasswordBox && (

        <div className="mt-5 bg-gray-100 p-4 rounded space-y-3 max-w-md">

          <input
            type="password"
            placeholder="رمز فعلی"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(
                e.target.value
              )
            }
            className="border p-2 w-full rounded"
          />

          <input
            type="password"
            placeholder="رمز جدید"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            className="border p-2 w-full rounded"
          />

          <button
            onClick={changePassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ذخیره رمز جدید
          </button>

        </div>

      )}

    </div>
  )
}