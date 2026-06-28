'use client'

import { useEffect, useState } from "react"
import { getGuestByToken, increaseView } from "@/lib/api"

export default function GuestPage({ params }: any) {

  // ========================
  // STATE
  // ========================
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(false)

  // ========================
  // SESSION KEY (ANTI FAKE VIEW)
  // ========================
  const VIEW_KEY = `view_${params.token}`

  // ========================
  // LOAD GUEST DATA
  // ========================
  async function loadGuest() {
    try {
      const data = await getGuestByToken(params.token)

      if (!data) {
        setError("Guest not found")
        return null
      }

      setGuest(data)

      // بررسی محدودیت
      const isBlocked = data.views >= data.max_views
      setBlocked(isBlocked)

      return data

    } catch (err) {
      console.error("Load guest error:", err)
      setError("Failed to load guest")
      return null
    } finally {
      setLoading(false)
    }
  }

  // ========================
  // INCREASE VIEW
  // ========================
  async function addView() {
    try {
      await increaseView(params.token)
    } catch (err) {
      console.error("Increase view error:", err)
    }
  }

  // ========================
  // MAIN FLOW (FIXED + SESSION LOCK)
  // ========================
  useEffect(() => {

    const run = async () => {

      // 1. گرفتن اطلاعات مهمان
      const data = await loadGuest()

      // 2. اگر وجود داشت و بلاک نبود
      if (data) {

        const alreadyViewed = localStorage.getItem(VIEW_KEY)

        // 🔥 اگر قبلاً view نشده باشد
        if (!alreadyViewed && data.views < data.max_views) {

          await addView()

          // ذخیره در session (جلوگیری از refresh abuse)
          localStorage.setItem(VIEW_KEY, "true")
        }
      }

      // 3. sync نهایی UI
      await loadGuest()
    }

    run()

  }, [params.token])

  // ========================
  // LOADING
  // ========================
  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  // ========================
  // ERROR
  // ========================
  if (error || !guest) {
    return (
      <div className="p-10 text-red-500">
        {error || "Guest not found"}
      </div>
    )
  }

  // ========================
  // UI
  // ========================
  return (
    <div className="p-10 space-y-4">

      {/* NAME */}
      <h1 className="text-3xl font-bold">
        {guest.name}
      </h1>

      {/* VIEWS */}
      <p className="text-gray-700">
        👁 Views: {guest.views}
      </p>

      {/* MAX */}
      <p className="text-gray-700">
        🎯 Max Views: {guest.max_views}
      </p>

      {/* STATUS */}
      {blocked ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          🚫 لینک غیرفعال شده (limit reached)
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          ✅ لینک فعال است
        </div>
      )}

    </div>
  )
}