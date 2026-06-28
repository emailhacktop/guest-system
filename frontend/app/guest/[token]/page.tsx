'use client'

import { useEffect, useState } from "react"
import { getGuestByToken, increaseView } from "@/lib/api"

export default function GuestPage({ params }: any) {

  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(false)

  // 🔵 گرفتن اطلاعات مهمان
  async function loadGuest() {
    try {
      const data = await getGuestByToken(params.token)

      if (!data) {
        setError("Guest not found")
        setLoading(false)
        return
      }

      setGuest(data)

      // 🔥 اگر قبلاً پر شده باشد
      if (data.views >= data.max_views) {
        setBlocked(true)
      }

    } catch (err) {
      setError("Failed to load guest")
    } finally {
      setLoading(false)
    }
  }

  // 🟢 افزایش view
  async function addView() {
    try {
      await increaseView(params.token)
    } catch (err) {
      console.error("increase view failed", err)
    }
  }

  useEffect(() => {
    loadGuest()
    addView()
  }, [])

  // ⏳ loading
  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    )
  }

  // ❌ error
  if (error || !guest) {
    return (
      <div className="p-10 text-red-500">
        {error || "Guest not found"}
      </div>
    )
  }

  return (
    <div className="p-10 space-y-4">

      {/* اسم */}
      <h1 className="text-3xl font-bold">
        {guest.name}
      </h1>

      {/* views */}
      <p className="text-gray-700">
        👁 Views: {guest.views}
      </p>

      {/* max views */}
      <p className="text-gray-700">
        🎯 Max Views: {guest.max_views}
      </p>

      {/* 🔥 وضعیت بلاک */}
      {blocked ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          🚫 این لینک به حد مجاز بازدید رسیده و غیرفعال شده است
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          ✅ لینک فعال است
        </div>
      )}

    </div>
  )
}