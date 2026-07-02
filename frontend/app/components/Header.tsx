'use client'

import { useState } from "react"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3001/api`
      : ""
  )
      
export default function Header() {

  // ========================
  // STATE
  // ========================
  const [changingPassword, setChangingPassword] =
    useState(false)

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
// EXPORT EXCEL
// ========================
async function exportExcel() {

try {

  const token =
    localStorage.getItem(
      "admin-token"
    )

  if (!token) {

    alert("توکن یافت نشد")

    return
  }

  const res = await fetch(
    `${BASE_URL}/guests/export`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  )

  if (!res.ok) {

    alert("خطا در دانلود فایل")

    return
  }

  // فایل باینری
  const blob =
    await res.blob()

  // ساخت لینک دانلود
  const url =
    window.URL.createObjectURL(blob)

  const a =
    document.createElement("a")

  a.href = url

  a.download =
    "guests.xlsx"

  document.body.appendChild(a)

  a.click()

  a.remove()

  window.URL.revokeObjectURL(url)

} catch (err) {

  console.error(err)

  alert("خطا در دانلود اکسل")
}

}
  
// ========================
// CHANGE PASSWORD
// ========================
async function changePassword() {

  if (!oldPassword.trim() || !newPassword.trim()) {

    alert("تمام فیلدها الزامی است")

    return
  }

  try {

   setChangingPassword(true)

    const token =
      localStorage.getItem(
        "admin-token"
      )

    if (!token) {

      alert("توکن یافت نشد")

      return
    }

    const res = await fetch(
      `${BASE_URL}/change-password`,
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
      
      localStorage.removeItem("admin-token")

      window.location.href = "/login"

    } else {

      alert(
        data.message ||
        "خطا در تغییر رمز"
      )
    }

  } catch (err) {
  
    console.error(err)

    alert("خطا در ارتباط با سرور")
  
  } finally {

    setChangingPassword(false)
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

        {/* EXPORT */}
        <button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded"
        >
          دانلود اکسل
        </button>

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
            disabled={changingPassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {
             changingPassword
               ? "در حال ذخیره..."
               : "ذخیره رمز جدید"
            }
          </button>

        </div>

      )}

    </div>
  )
}