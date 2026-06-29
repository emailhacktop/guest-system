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
  // SESSION KEY
  // ========================
  const VIEW_KEY = `view_${params.token}`

  // ========================
  // LOAD GUEST DATA
  // ========================
  async function loadGuest() {

    try {

      const data = await getGuestByToken(params.token)

      // اگر وجود نداشت
      if (!data || data.success === false) {

        // لینک منقضی شده
        if (data?.message === "Link expired") {

          setBlocked(true)

          setError("لینک منقضی شده")

          return null
        }

        // مهمان پیدا نشد
        setError("Guest not found")

        return null
      }

      // اگر active=false
      if (!data.active) {

        setBlocked(true)

        setError("لینک غیرفعال شده")

        return null
      }

      // ذخیره اطلاعات
      setGuest(data)

      // بررسی محدودیت
      const isBlocked =
        data.views >= data.max_views

      setBlocked(isBlocked)

      return data

    } catch (err) {

      console.error(
        "Load guest error:",
        err
      )

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

      console.error(
        "Increase view error:",
        err
      )
    }
  }

  // ========================
  // MAIN FLOW
  // ========================
  useEffect(() => {

    const run = async () => {

      // load data
      const data = await loadGuest()

      // اگر معتبر بود
      if (
        data &&
        data.active
      ) {

        const alreadyViewed =
          localStorage.getItem(VIEW_KEY)

        // جلوگیری از refresh abuse
        if (
          !alreadyViewed &&
          data.views < data.max_views
        ) {

          await addView()

          localStorage.setItem(
            VIEW_KEY,
            "true"
          )
        }
      }

      // sync نهایی
      await loadGuest()
    }

    run()

  }, [params.token])

  // ========================
  // LOADING
  // ========================
  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    )
  }

  // ========================
  // ERROR
  // ========================
  if (error || !guest) {

    return (
      <div className="p-10">

        <div className="bg-red-100 text-red-700 p-5 rounded">

          {error || "Guest not found"}

        </div>

      </div>
    )
  }

  // ========================
  // UI
  // ========================
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-xl space-y-5">

        {/* NAME */}
        <h1 className="text-4xl font-bold text-center">

          {guest.name}

        </h1>

        {/* VIEWS */}
        <div className="text-center text-gray-700 text-lg">

          👁 بازدید:
          {" "}
          {guest.views}

        </div>

        {/* MAX */}
        <div className="text-center text-gray-700 text-lg">

          🎯 حداکثر بازدید:
          {" "}
          {guest.max_views}

        </div>

        {/* STATUS */}
        {blocked ? (

          <div className="bg-red-100 text-red-700 p-4 rounded text-center font-bold">

            🚫 لینک غیرفعال شده

          </div>

        ) : (

          <div className="bg-green-100 text-green-700 p-4 rounded text-center font-bold">

            ✅ لینک فعال است

          </div>
        )}

      </div>
    </div>
  )
}