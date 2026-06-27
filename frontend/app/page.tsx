'use client'

import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import StatsCard from "../components/StatsCard"
import GuestTable from "../components/GuestTable"
import { getGuests, createGuest } from "@/lib/api"

export default function Dashboard() {

  const [guests, setGuests] = useState<any[]>([])
  const [name, setName] = useState("")
  const [maxViews, setMaxViews] = useState(1)

  async function loadGuests() {
    const data = await getGuests()
    setGuests(data)
  }

  useEffect(() => {
    loadGuests()
  }, [])

  async function handleCreate() {
    if (!name) return

    await createGuest({
      name,
      max_views: maxViews
    })

    setName("")
    setMaxViews(1)

    loadGuests()
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="p-6 space-y-6">

          {/* FORM ساخت مهمان */}
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
            />

            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              ساخت مهمان
            </button>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatsCard title="مهمان‌ها" value={guests.length} />
            <StatsCard title="فعال" value="8" />
            <StatsCard title="بازدید" value="34" />
          </div>

          {/* Table */}
          <GuestTable guests={guests} />

        </div>
      </div>

    </div>
  )
}