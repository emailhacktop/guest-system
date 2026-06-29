'use client'

export default function Header() {

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
  function exportExcel() {

    window.open(
      "http://localhost:3001/api/guests/export",
      "_blank"
    )
  }

  // ========================
  // UI
  // ========================
  return (

    <div className="bg-white shadow px-6 py-4 flex items-center justify-between border-b">

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

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded"
        >
          خروج
        </button>

      </div>

    </div>
  )
}