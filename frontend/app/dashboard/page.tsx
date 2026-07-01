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

const [guestsCount, setGuestsCount] =
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
      guests_count:
        Number(guestsCount),
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
    <div className="bg-white p-5 rounded-2xl shadow space-y-5">

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* NAME */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            نام مهمان
          </label>

          <input
            className="border p-3 w-full rounded-xl"
            placeholder="مثلاً خانواده محمدی"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            عنوان
          </label>

          <select
            className="border p-3 w-full rounded-xl"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          >
            <option value="خانواده">
              خانواده
            </option>

            <option value="آقای">
              آقای
            </option>

            <option value="خانم">
              خانم
            </option>
          </select>
        </div>

        {/* GUEST COUNT */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            تعداد نفرات
          </label>

          <input
            className="border p-3 w-full rounded-xl"
            type="number"
            min={1}
            max={99}
            value={guestsCount}
            onChange={(e) =>
              setGuestsCount(
                Number(e.target.value)
              )
            }
          />
        </div>

        {/* MAX VIEWS */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            تعداد بازدید
          </label>

          <input
            className="border p-3 w-full rounded-xl"
            type="number"
            min={1}
            max={999}
            value={maxViews}
            onChange={(e) =>
              setMaxViews(
                Number(e.target.value)
              )
            }
          />
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 flex-wrap">

        <button
          onClick={handleCreate}
          disabled={loading}
          className="
            bg-blue-600
            hover:bg-blue-700
            transition
            text-white
            px-6
            py-3
            rounded-xl
            disabled:opacity-50
          "
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

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