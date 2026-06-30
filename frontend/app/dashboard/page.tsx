'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import StatsCard from "../components/StatsCard"
import GuestTable from "../components/GuestTable"

import {
getGuests,
createGuest
} from "@/lib/api"

export default function Dashboard() {

const router = useRouter()

// ========================
// STATE
// ========================
const [guests, setGuests] =
useState<any[]>([])

const [name, setName] =
useState("")

const [title, setTitle] =
useState("خانواده")

const [maxViews, setMaxViews] =
useState(1)

const [loading, setLoading] =
useState(false)

const [message, setMessage] =
useState("")

// SEARCH
const [search, setSearch] =
useState("")

// ========================
// LOAD GUESTS
// ========================
async function loadGuests() {

try {

  const data =
    await getGuests()

  const sorted =
    Array.isArray(data)
      ? data.sort((a, b) =>
          a.name.localeCompare(
            b.name,
            "fa"
          )
        )
      : []

  setGuests(sorted)

} catch (error) {

  console.error(
    "loadGuests error:",
    error
  )
}

}

// ========================
// AUTH CHECK
// ========================
useEffect(() => {

const token =
  localStorage.getItem(
    "admin-token"
  )

if (!token) {

  router.push("/login")

  return
}

try {

  const payload =
    JSON.parse(
      atob(
        token.split(".")[1]
      )
    )

  if (
    payload.exp * 1000 <
    Date.now()
  ) {

    localStorage.removeItem(
      "admin-token"
    )

    router.push("/login")

    return
  }

} catch {

  localStorage.removeItem(
    "admin-token"
  )

  router.push("/login")

  return
}

loadGuests()

}, [router])

// ========================
// CREATE GUEST
// ========================
async function handleCreate() {

if (!name.trim()) {

  setMessage(
    "نام مهمان الزامی است"
  )

  return
}

if (
  maxViews < 1 ||
  maxViews > 999
) {

  setMessage(
    "حداکثر بازدید باید بین 1 تا 999 باشد"
  )

  return
}

try {

  setLoading(true)

  setMessage("")

  const result =
    await createGuest({
      name: name.trim(),
      title: title,
      max_views:
        Number(maxViews)
    })

  // ========================
  // FAILED
  // ========================
  if (
    !result ||
    result.success === false
  ) {

    setMessage(
      result?.message ||
      "خطا در ساخت مهمان"
    )

    return
  }

  // ========================
  // SUCCESS
  // ========================
  setMessage(
    "مهمان ساخته شد"
  )

  setName("")

  setTitle("خانواده")

  setMaxViews(1)

  await loadGuests()

} catch (error: any) {

  console.error(
    "createGuest error:",
    error
  )

  setMessage(
    error?.message ||
    "خطا در ساخت مهمان"
  )

} finally {

  setLoading(false)
}

}

// ========================
// FILTERED GUESTS
// ========================
const filteredGuests =
guests.filter((g) => {

  const text =
    search.toLowerCase()

  return (
    g.name
      ?.toLowerCase()
      .includes(text)
    ||
    g.token
      ?.toLowerCase()
      .includes(text)
  )
})

// ========================
// REAL STATS
// ========================
const activeCount =
guests.filter(
(g) => g.active
).length

const totalViews =
guests.reduce(
(sum, g) =>
sum + (g.views || 0),
0
)

// ========================
// UI
// ========================
return (

<div className="flex min-h-screen bg-gray-100">

  <Sidebar />

  <div className="flex-1">

    <Header />

    <div className="p-6 space-y-6">

      {/* CREATE FORM */}
      <div className="bg-white p-4 rounded shadow space-y-3">

        {/* NAME */}
        <input
          className="border p-2 w-full rounded"
          placeholder="نام مهمان"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        {/* TITLE */}
        <select
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        >

          <option value="خانواده">
            خانواده
          </option>

          <option value="یآقا">
            یآقا
          </option>

          <option value="خانم">
            خانم
          </option>

        </select>

        {/* MAX VIEWS */}
        <input
          className="border p-2 w-full rounded"
          type="number"
          placeholder="حداکثر بازدید"
          value={maxViews}
          min={1}
          max={999}
          onChange={(e) =>
            setMaxViews(
              Number(
                e.target.value
              )
            )
          }
        />

        {/* BUTTON */}
        <div className="flex gap-3 flex-wrap">

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >

            {loading
              ? "در حال ساخت..."
              : "ساخت مهمان"}

          </button>

        </div>

        {/* MESSAGE */}
        {message && (

          <div className="text-sm text-red-600">

            {message}

          </div>

        )}

      </div>

      {/* SEARCH */}
      <div className="bg-white p-3 rounded shadow">

        <input
          className="border p-2 w-full rounded"
          placeholder="جستجو بر اساس نام یا توکن..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">

        <StatsCard
          title="مهمان‌ها"
          value={guests.length}
        />

        <StatsCard
          title="فعال"
          value={activeCount}
        />

        <StatsCard
          title="بازدید"
          value={totalViews}
        />

      </div>

      {/* TABLE */}
      <GuestTable
        guests={filteredGuests}
        onRefresh={loadGuests}
      />

    </div>

  </div>

</div>

)
}