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
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const BASE_FRONT = "http://localhost:3000"

  // 🔵 گرفتن لیست مهمان‌ها
  async function loadGuests() {
    try {
      const data = await getGuests()
      setGuests(data)
    } catch (err) {
      console.error("Load guests error:", err)
    }
  }

  useEffect(() => {
    loadGuests()
  }, [])

  // 🟢 ساخت مهمان
  async function handleCreate() {
    if (!name) return

    try {
      setLoading(true)

      await createGuest({
        name,
        max_views: maxViews
      })

      setName("")
      setMaxViews(1)

      await loadGuests()

    } catch (err) {
      console.error("Create guest error:", err)
    } finally {
      setLoading(false)
    }
  }

  // 📋 کپی لینک
  async function copyLink(token: string) {
    const link = `${BASE_FRONT}/guest/${token}`
    await navigator.clipboard.writeText(link)

    setCopied(token)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="p-6 space-y-6">

          {/* FORM */}
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
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "در حال ساخت..." : "ساخت مهمان"}
            </button>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatsCard title="مهمان‌ها" value={guests.length} />
            <StatsCard title="فعال" value="8" />
            <StatsCard title="بازدید" value="34" />
          </div>

          {/* TABLE CUSTOM (upgrade شده) */}
          <div className="bg-white p-4 rounded shadow">

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">نام</th>
                  <th>بازدید</th>
                  <th>حداکثر</th>
                  <th>لینک</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} className="border-b">

                    <td className="p-2">{g.name}</td>
                    <td className="text-center">{g.views}</td>
                    <td className="text-center">{g.max_views}</td>

                    {/* لینک */}
                    <td className="text-center">
                      <span className="text-xs text-blue-600">
                        /guest/{g.token}
                      </span>
                    </td>

                    {/* اکشن‌ها */}
                    <td className="text-center space-x-2">

                      <button
                        onClick={() => copyLink(g.token)}
                        className="bg-gray-200 px-2 py-1 rounded text-xs"
                      >
                        {copied === g.token ? "Copied ✔" : "Copy"}
                      </button>

                      <a
                        href={`${BASE_FRONT}/guest/${g.token}`}
                        target="_blank"
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Open
                      </a>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </div>
      </div>

    </div>
  )
}