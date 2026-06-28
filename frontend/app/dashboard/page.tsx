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
    if (!name.trim()) return

    try {
      setLoading(true)

      await createGuest({
        name: name.trim(),
        max_views: Number(maxViews)
      })

      setName("")
      setMaxViews(1)

      await loadGuests()

    } catch (error) {
      console.error("createGuest error:", error)
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
          <GuestTable guests={filteredGuests} />

        </div>
      </div>
    </div>
  )
}