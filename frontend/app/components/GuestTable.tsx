'use client'

import {
  deleteGuestApi,
  editGuestApi,
  resetViewsApi,
  toggleGuestApi
} from "@/lib/api"

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

  // ========================
  // COPY LINK
  // ========================
  async function copyLink(
    token: string
  ) {

    const url =
      `${window.location.origin}/guest/${token}`

    try {

    if (
    navigator &&
    navigator.clipboard &&
    navigator.clipboard.writeText
    ) {

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
    }

  }

  // ========================
  // DELETE
  // ========================
  async function deleteGuest(
    id: string
  ) {

    const ok =
      confirm("آیا حذف شود؟")

    if (!ok) return

    try {

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
    }
  }

  // ========================
  // RESET
  // ========================
  async function resetViews(
    id: string,
    token: string
  ) {

    try {

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
    }
  }

  // ========================
  // TOGGLE ACTIVE
  // ========================
  async function toggleGuest(
    id: string,
    active: boolean
  ) {

    try {

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
    }
  }

  // ========================
  // EDIT
  // ========================
  async function editGuest(
    g: Guest
  ) {

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
    }
  }

  // ========================
  // DOWNLOAD LINKS
  // ========================
  function downloadLinks() {

    if (!guests) return

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
  }

// ========================
// DOWNLOAD BACKUP
// ========================
async function downloadBackup() {

  try {

    const token =
      localStorage.getItem(
        "admin-token"
      )

    const res = await fetch(
      `${window.location.protocol}//${window.location.hostname}:3001/api/backup`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

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
  }
}

// ========================
// RESTORE BACKUP
// ========================
async function restoreBackup(
  e: any
) {

  try {

    const file =
      e.target.files?.[0]

    if (!file) return

    const text =
      await file.text()

    const json =
      JSON.parse(text)

    const token =
      localStorage.getItem(
        "admin-token"
      )

    const res = await fetch(
      `${window.location.protocol}//${window.location.hostname}:3001/api/restore`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body:
          JSON.stringify(json)
      }
    )

    const data =
      await res.json()

    if (data.success) {

      alert(
        "بکاپ با موفقیت ریستور شد"
      )

      if (onRefresh) {

        await onRefresh()
      }

    } else {

      alert(
        "خطا در ریستور"
      )
    }

  } catch (err) {

    console.error(
      "Restore error:",
      err
    )
  }
}
  
  if (
    !guests ||
    guests.length === 0
  ) {

    return (

      <div className="bg-white p-4 rounded shadow text-gray-500">

        هیچ مهمانی وجود ندارد

      </div>
    )
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
        onClick={downloadLinks}
        className="
          bg-emerald-600
          hover:bg-emerald-700
          text-white
          px-4
          py-2
          rounded-lg
          text-sm
          transition
        "
      >
        دانلود لینک‌ها
      </button>

      {/* BACKUP */}
      <button
        onClick={downloadBackup}
        className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-4
          py-2
          rounded-lg
          text-sm
          transition
        "
      >
        بکاپ JSON
      </button>

      {/* RESTORE */}
      <label
        className="
          bg-orange-600
          hover:bg-orange-700
          text-white
          px-4
          py-2
          rounded-lg
          text-sm
          transition
          cursor-pointer
        "
      >
        ریستور بکاپ

        <input
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

          {guests.map((g) => (

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
                  href={`/guest/${g.token}`}
                  target="_blank"
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  باز کردن
                </a>

                {/* COPY */}
                <button
                  onClick={() =>
                    copyLink(g.token)
                  }
                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                >
                  کپی لینک
                </button>

                {/* EDIT */}
                <button
                  onClick={() =>
                    editGuest(g)
                  }
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                >
                  ویرایش
                </button>

                {/* RESET */}
                <button
                  onClick={() =>
                    resetViews(
                      g.id,
                      g.token
                    )
                  }
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                >
                  ریست
                </button>

                {/* TOGGLE */}
                <button
                  onClick={() =>
                    toggleGuest(
                      g.id,
                      g.active
                    )
                  }
                  className={`px-2 py-1 rounded text-xs text-white ${
                    g.active
                      ? "bg-orange-600"
                      : "bg-green-600"
                  }`}
                >
                  {g.active
                    ? "مسدود"
                    : "فعال"}
                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteGuest(g.id)
                  }
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  حذف
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}