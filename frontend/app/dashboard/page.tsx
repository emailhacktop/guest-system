'use client'

import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import StatsCard from "../components/StatsCard"
import GuestTable from "../components/GuestTable"
import { getGuests, createGuest } from "@/lib/api"

export default function Dashboard() {

  // ========================
  // STATE
  // ========================
  const [guests, setGuests] = useState<any[]>([])
  const [name, setName] = useState("")
  const [maxViews, setMaxViews] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // ⭐ SEARCH STATE (این مهمه)
  const [search, setSearch] = useState("")

  // ========================
  // LOAD GUESTS
  // ========================
  async function loadGuests() {
    try {
      const data = await getGuests()
      setGuests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("loadGuests error:", error)
    }
  }

  useEffect(() => {
    loadGuests()
  }, [])

  // ========================
  // CREATE GUEST
  // ========================
  async function handleCreate() {

  // خالی نبودن نام
  if (!name.trim()) {

  setMessage("نام مهمان الزامی است")

  return

  }

  // محدودیت بازدید
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
      name,
      max_views: maxViews
    })

  // خطای بک‌اند
  if (result?.success === false) {

    setMessage(result.message)

    return
  }

  // موفق
  setMessage("مهمان ساخته شد")

  setName("")

  setMaxViews(1)

  await loadGuests()

  } catch (error) {

  console.error(
    "createGuest error:",
    error
  )

  setMessage(
    "خطا در ساخت مهمان"
  )

  } finally {

  setLoading(false)

  }
  }
  
  // ========================
  // ⭐ FILTER (SEARCH LOGIC)
  // ========================
  const filteredGuests = guests.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.token?.toLowerCase().includes(search.toLowerCase())
  )

  // ========================
  // REAL STATS
  // ========================
  const activeCount = guests.filter(g => g.active).length
  const totalViews = guests.reduce((sum, g) => sum + (g.views || 0), 0)

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <div className="p-6 space-y-6">

          {/* CREATE FORM */}
          <div className="bg-white p-4 rounded shadow space-y-3">

            <input
              className="border p-2 w-full"
              placeholder="نام مهمان"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 w-full"
              type="number"
              placeholder="حداکثر بازدید"
              value={maxViews}
              onChange={(e) => setMaxViews(Number(e.target.value))}
              min={1}
            />

            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "در حال ساخت..." : "ساخت مهمان"}
            </button>
             {message && (

            <div className="text-sm text-red-600 mt-2">

            {message}

            </div>

             )}

          </div>

          {/* ⭐ SEARCH INPUT (این هم مهمه) */}
          <div className="bg-white p-3 rounded shadow">
            <input
              className="border p-2 w-full"
              placeholder="جستجو بر اساس نام یا توکن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">

            <StatsCard title="مهمان‌ها" value={guests.length} />
            <StatsCard title="فعال" value={activeCount} />
            <StatsCard title="بازدید" value={totalViews} />

          </div>

          {/* TABLE (⭐ اینجا فرق مهمه) */}
          <GuestTable
           guests={filteredGuests}
           onRefresh={loadGuests}
          />

        </div>
      </div>
    </div>
  )
}