'use client'

import { use } from "react"
import { useEffect, useState } from "react"

import {
  getGuestByToken,
  increaseView
} from "@/lib/api"

type ParamsType = Promise<{
  token: string
}>

export default function GuestPage({
  params,
}: {
  params: ParamsType
}) {

  const { token } = use(params)

  const [guest, setGuest] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [blocked, setBlocked] =
    useState(false)

  // ========================
  // LOAD GUEST
  // ========================
  async function loadGuest() {

    const data =
      await getGuestByToken(token)

    if (
      !data ||
      data.success === false
    ) {

      if (
        data?.message ===
        "Link blocked"
      ) {

        setBlocked(true)

        setError(
          "🚫 این لینک غیرفعال شده است"
        )

      } else {

        setError(
          "❌ مهمان یافت نشد"
        )
      }

      return null
    }

    // پایان بازدید
    if (
      data.views >= data.max_views
    ) {

      setBlocked(true)

      setError(
        "🚫 تعداد بازدید این لینک به پایان رسیده است"
      )

      return null
    }

    setGuest(data)

    return data
  }

  // ========================
  // ADD VIEW
  // ========================
  async function addView() {

    await increaseView(token)
  }

  // ========================
  // FLOW
  // ========================
  useEffect(() => {

    const run = async () => {

      setLoading(true)

      setError(null)

      setGuest(null)

      setBlocked(false)

      try {

        const data =
          await loadGuest()

        if (data) {

          await addView()

          const updated =
            await loadGuest()

          if (updated) {

            setGuest(updated)
          }
        }

      } finally {

        setLoading(false)
      }
    }

    run()

  }, [token])

  // ========================
  // LOADING
  // ========================
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-xl shadow text-xl">

          در حال بارگذاری...

        </div>

      </div>
    )
  }

  // ========================
  // ERROR
  // ========================
  if (error || !guest) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-lg text-center">

          <div className="text-2xl font-bold text-red-600 mb-4">

            {error}

          </div>

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

        <h1 className="text-4xl font-bold text-center">

          {guest.name}

        </h1>

        <div className="text-center text-gray-700 text-lg">

          👁 بازدید:
          {" "}
          {guest.views}

        </div>

        <div className="text-center text-gray-700 text-lg">

          🎯 حداکثر بازدید:
          {" "}
          {guest.max_views}

        </div>

        <div className="bg-green-100 text-green-700 p-4 rounded text-center font-bold">

          ✅ لینک فعال است

        </div>

      </div>

    </div>
  )
}