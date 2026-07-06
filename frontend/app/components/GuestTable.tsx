'use client'
import { useState } from "react"

import {
  deleteGuestApi,
  editGuestApi,
  resetViewsApi,
  toggleGuestApi
} from "@/lib/api"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || ""

type Guest = {
  id: string
  name: string
  title: string
  token: string
  max_views: number
  guests_count: number
  views: number
  active: boolean
}

type Props = {
  guests?: Guest[]
  onRefresh?: () => Promise<void>
}

export default function GuestTable({
  guests,
  onRefresh
}: Props) {

 const [loading, setLoading] = useState(false)

  // ========================
  // COPY LINK
  // ========================
  async function copyLink(
    token: string
  ) {

    if (loading) return

    const url =
      `${window.location.origin}/guest/${token}`

    try {

    setLoading(true)

if (navigator.clipboard?.writeText) {

    await navigator.clipboard.writeText(url)

    } else {

    const textArea =
      document.createElement("textarea")

    textArea.value = url

    document.body.appendChild(textArea)

    textArea.select()

    document.execCommand("copy")

    document.body.removeChild(textArea)

    }

    alert("لینک کپی شد")

    } catch (err) {

    console.error(
    "Copy failed:",
    err
    )

    alert("خطا در کپی لینک")

    } finally {

    setLoading(false)
    }

  }

  // ========================
  // DELETE
  // ========================
  async function deleteGuest(
    id: string
  ) {
    
    if (loading) return

    const ok =
      confirm("آیا حذف شود؟")

    if (!ok) return

    try {

      setLoading(true)

      const data =
        await deleteGuestApi(id)

      if (data?.success) {

        alert("حذف شد")

        if (onRefresh) {

          await onRefresh()
        }

      } else {

        alert("حذف انجام نشد")
      }

    } catch (err) {

      console.error(
        "Delete error:",
        err
      )

    } finally {

      setLoading(false)
    }
  }

  // ========================
  // RESET
  // ========================
  async function resetViews(
    id: string,
    token: string
  ) {

    if (loading) return

    try {

      setLoading(true)

      const data =
        await resetViewsApi(id)

      if (data?.success) {

        localStorage.removeItem(
          `view_${token}`
        )

        alert("بازدید ریست شد")

        if (onRefresh) {

          await onRefresh()
        }
      }

    } catch (err) {

      console.error(
        "Reset error:",
        err
      )

    } finally {

      setLoading(false)
    }
  }

  // ========================
  // TOGGLE ACTIVE
  // ========================
  async function toggleGuest(
    id: string,
    active: boolean
  ) {

    if (loading) return

    try {

      setLoading(true)

      const data =
        await toggleGuestApi(
          id,
          !active
        )

      if (data?.success) {

        if (onRefresh) {

          await onRefresh()
        }
      }

    } catch (err) {

      console.error(
        "Toggle error:",
        err
      )
    } finally {

      setLoading(false)
    }
  }

  // ========================
  // EDIT
  // ========================
  async function editGuest(
    g: Guest
  ) {

    if (loading) return

    const newName =
      prompt(
        "نام جدید",
        g.name
      )

    if (!newName?.trim()) return

    const newTitle =
      prompt(
        "عنوان (خانواده /آقای / خانم)",
        g.title || "خانواده"
      )

    if (!newTitle?.trim()) return

    const newGuestsCount =
      prompt(
        "تعداد نفرات (1 تا 99)",
        String(g.guests_count || 1)
      )

    if (!newGuestsCount?.trim()) return

    const guestsCountValue =
      Number(newGuestsCount)

    if (
      isNaN(guestsCountValue) ||
      guestsCountValue < 1 ||
      guestsCountValue > 99
    ) {

      alert(
        "تعداد نفرات باید بین 1 تا 99 باشد"
      )

      return
    }

    const newMax =
      prompt(
        "حداکثر بازدید (1 تا 999)",
        String(g.max_views)
      )

    if (!newMax?.trim()) return

    const maxValue =
      Number(newMax)

    // validation
    if (
      isNaN(maxValue) ||
      maxValue < 1 ||
      maxValue > 999
    ) {

      alert(
        "حداکثر بازدید باید بین 1 تا 999 باشد"
      )

      return
    }

    try {

      setLoading(true)

      const data =
          await editGuestApi(
            g.id,
            {
              name:
                newName.trim(),

              title:
                newTitle.trim(),

              guests_count:
                guestsCountValue,
                
              max_views:
                maxValue
            }
          )
      if (data?.success) {

        alert("ویرایش شد")

        localStorage.removeItem(
          `view_${g.token}`
        )

        if (onRefresh) {

          await onRefresh()
        }

      } else {

        alert(
          data?.message ||
          "خطا در ویرایش"
        )
      }

    } catch (err) {

      console.error(
        "Edit error:",
        err
      )

    } finally {

      setLoading(false)
    }
  }

  // ========================
  // DOWNLOAD LINKS
  // ========================
  async function downloadLinks() {

    if (loading) return
    if (!guests) return

    try {

      setLoading(true)

      let content = ""

      guests.forEach((g) => {

        content += `${g.title || "خانواده"} ${g.name}\n`

        content += `${window.location.origin}/guest/${g.token}\n\n`
      })

      const blob =
        new Blob(
          [content],
          {
            type: "text/plain"
          }
        )

      const url =
        URL.createObjectURL(blob)

      const a =
        document.createElement("a")

       a.href = url

       a.download =
         "guest-links.txt"

       a.click()

       URL.revokeObjectURL(url)

    } catch (err) {

      console.error(
        "Download links error:",
        err
      )

    } finally {
             
      setLoading(false)
    }

  }

// ========================
// DOWNLOAD BACKUP
// ========================
async function downloadBackup() {

  if (loading) return

  try {

    setLoading(true)

    const token =
      localStorage.getItem(
        "admin-token"
      )

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 120000)

    const res = await fetch(
      `${BASE_URL}/backup`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        },

        signal: controller.signal
      }
    )

    clearTimeout(timeout)

    const data =
      await res.json()

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type: "application/json"
        }
      )

    const url =
      URL.createObjectURL(blob)

    const a =
      document.createElement("a")

    a.href = url

    a.download =
      "backup-guests.json"

    a.click()

    URL.revokeObjectURL(url)

  } catch (err) {

    console.error(
      "Backup error:",
      err
    )

  } finally {

      setLoading(false)
  }
}

// ========================
// RESTORE BACKUP
// ========================
async function restoreBackup(
  e: React.ChangeEvent<HTMLInputElement>
) {

  try {
    setLoading(true)

    const file =
      e.target.files?.[0]

    if (!file) return

    const text =
      await file.text()

    let json

    try {

      json = JSON.parse(text)

    } catch {

      alert("فایل بکاپ معتبر نیست")

      setLoading(false)
      return
    }

    console.log(
    "BACKUP JSON:",
    json
    )

    const token =
      localStorage.getItem(
        "admin-token"
      )

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 120000)

    const res = await fetch(
      `${BASE_URL}/restore`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body:
          JSON.stringify(json),

        signal: controller.signal
      }
    )

    clearTimeout(timeout)

    // اول متن خام بخوان
    const raw =
    await res.text()

    console.log(
    "RAW RESTORE RESPONSE:",
    raw
    )

    // بعد سعی کن JSON شود
    let data

    try {

    data = JSON.parse(raw)

    } catch {

    console.error(
    "RESTORE NOT JSON:",
    raw
    )

    alert(
    "پاسخ سرور:\n" + raw
    )

    return
    }

    console.log(
     "RESTORE RESPONSE:",
      data
     )

    if (data.success) {

    alert(
    "بکاپ با موفقیت ریستور شد"
    )

    if (onRefresh) {

    await onRefresh()

    }

    } else {

    console.error(
    "RESTORE API ERROR:",
    data
    )

    alert(
    data?.message ||
    JSON.stringify(data)
    )
    }

    } catch (err) {

      console.error(
        "Restore error:",
        err
      )
      alert(
      "خطا در ریستور — Console را چک کن"
      )
    }

    finally {

      setLoading(false)

    }
}
  
  // ========================
  // UI
  // ========================
  return (

    <div className="bg-white p-4 rounded shadow overflow-x-auto">
    {/* TOP ACTIONS */}
    <div className="flex gap-3 justify-end mb-4 flex-wrap">

      {/* DOWNLOAD LINKS */}
      <button
        disabled={loading}
        onClick={downloadLinks}
          className={`text-white px-4 py-2 rounded-lg text-sm transition ${
            loading
              ? "bg-gray-400"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
      >
        دانلود لینک‌ها
      </button>

      {/* BACKUP */}
      <button
        disabled={loading}
        onClick={downloadBackup}
        className={`text-white px-4 py-2 rounded-lg text-sm transition ${
          loading
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        بکاپ JSON
      </button>

      {/* RESTORE */}
        <label
          className={`text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
            loading
              ? "bg-gray-400"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
        ریستور بکاپ

        <input
          disabled={loading}
          type="file"
          accept=".json"
          hidden
          onChange={restoreBackup}
        />
      </label>

    </div>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b bg-gray-50">

            <th className="text-left p-3">
              نام
            </th>

            <th className="text-left p-3">
              عنوان
            </th>

            <th className="text-left p-3">
              تعداد
            </th>

            <th className="text-left p-3">
              توکن
            </th>

            <th className="text-left p-3">
              بازدید
            </th>

            <th className="text-left p-3">
              حداکثر
            </th>

            <th className="text-left p-3">
              وضعیت
            </th>

            <th className="text-left p-3">
              عملیات
            </th>

          </tr>

        </thead>

        <tbody>

          {guests?.map((g) => (

            <tr
              key={g.id}
              className="border-b hover:bg-gray-50 transition"
            >

              {/* NAME */}
              <td className="p-3 font-medium">

                {g.name}

              </td>

              {/* TITLE */}
              <td className="p-3">

                {g.title}

              </td>

              {/* guests_count */}
              <td className="p-3">

                {g.guests_count}

              </td>

              {/* TOKEN */}
              <td className="p-3 text-xs text-blue-600">

                {g.token}

              </td>

              {/* VIEWS */}
              <td className="p-3">

                {g.views}

              </td>

              {/* MAX */}
              <td className="p-3">

                {g.max_views}

              </td>

              {/* STATUS */}
              <td className="p-3">

                {g.active ? (

                  <span className="text-green-600 font-medium">

                    فعال

                  </span>

                ) : (

                  <span className="text-red-600 font-medium">

                    غیرفعال

                  </span>

                )}

              </td>

              {/* ACTIONS */}
              <td className="p-3 flex flex-wrap gap-2">

                {/* OPEN */}
                <a
                  rel="noopener noreferrer"
                  href={
                    loading
                      ? "#"
                      : `/guest/${g.token}`
                  }
                  target="_blank"
                  onClick={(e) => {
                    if (loading) {
                      e.preventDefault()
                    }
                  }}
                  className={`text-white px-2 py-1 rounded text-xs ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  باز کردن
                </a>

                {/* COPY */}
                <button
                  disabled={loading}
                  onClick={() =>
                    copyLink(g.token)
                  }
                  className={`text-white px-2 py-1 rounded text-xs ${
                    loading
                      ? "bg-gray-400"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  کپی لینک
                </button>

                {/* EDIT */}
                <button
                  disabled={loading}
                  onClick={() =>
                    editGuest(g)
                  }
                  className={`text-white px-2 py-1 rounded text-xs ${
                    loading
                      ? "bg-gray-400"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  ویرایش
                </button>

                {/* RESET */}
                <button
                  disabled={loading}
                  onClick={() =>
                    resetViews(
                      g.id,
                      g.token
                    )
                  }
                  className={`text-white px-2 py-1 rounded text-xs ${
                    loading
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  ریست
                </button>

                {/* TOGGLE */}
                <button
                  disabled={loading}
                  onClick={() =>
                    toggleGuest(
                      g.id,
                      g.active
                    )
                  }
                  className={`px-2 py-1 rounded text-xs text-white ${
                    loading
                      ? "bg-gray-400"
                      : g.active
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {g.active
                    ? "مسدود"
                    : "فعال"}
                </button>

                {/* DELETE */}
                <button
                  disabled={loading}
                  onClick={() =>
                    deleteGuest(g.id)
                  }
                  className={`text-white px-2 py-1 rounded text-xs ${
                    loading
                      ? "bg-gray-400"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  حذف
                </button>

              </td>

            </tr>

              ))}

              {(!guests || guests.length === 0) && (

              <tr>

              <td colSpan={8} className=" p-6 text-center text-gray-500 " >

              هیچ مهمانی وجود ندارد

              </td>

             </tr>

            )}

        </tbody>

      </table>

    </div>
  )
}