'use client'

import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import StatsCard from "../components/StatsCard"
import GuestTable from "../components/GuestTable"
import { getGuests } from "@/lib/api"

export default function Dashboard() {

  const [guests, setGuests] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const data = await getGuests()
        setGuests(data)
      } catch (err) {
        console.log(err)
      }
    }

    load()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="p-6 space-y-6">

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