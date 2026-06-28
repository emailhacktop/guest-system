type Guest = {
  id: string
  name: string
  token: string
  max_views: number
  views: number
  active: boolean
}

type Props = {
  guests: Guest[]
  onRefresh?: () => void
}

export default function GuestTable({ guests, onRefresh }: Props) {

  // ========================
  // COPY LINK
  // ========================
  async function copyLink(token: string) {
    const url = `http://localhost:3000/guest/${token}`

    try {
      await navigator.clipboard.writeText(url)
      alert("لینک کپی شد")
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  // ========================
  // DELETE GUEST (FIXED)
  // ========================
  async function deleteGuest(id: string) {
    const ok = confirm("آیا حذف شود؟")
    if (!ok) return

    try {
      await fetch(`http://localhost:3001/api/guest/${id}`, {
        method: "DELETE"
      })

      // ✔ به والد خبر بده
      if (onRefresh) {
        onRefresh()
      }

    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  // ========================
  // EMPTY STATE
  // ========================
  if (!guests || guests.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        هیچ مهمانی وجود ندارد
      </div>
    )
  }

  // ========================
  // MAIN UI
  // ========================
  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">

      <table className="w-full text-sm">

        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3">نام</th>
            <th className="text-left p-3">توکن</th>
            <th className="text-left p-3">بازدید</th>
            <th className="text-left p-3">حداکثر</th>
            <th className="text-left p-3">وضعیت</th>
            <th className="text-left p-3">عملیات</th>
          </tr>
        </thead>

        <tbody>
          {guests.map((g) => {

            const blocked = g.views >= g.max_views

            return (
              <tr key={g.id} className="border-b hover:bg-gray-50">

                <td className="p-3 font-medium">{g.name}</td>

                <td className="p-3 text-xs text-blue-600">
                  {g.token}
                </td>

                <td className="p-3">{g.views}</td>

                <td className="p-3">{g.max_views}</td>

                <td className="p-3">
                  {blocked ? (
                    <span className="text-red-600">غیرفعال</span>
                  ) : (
                    <span className="text-green-600">فعال</span>
                  )}
                </td>

                <td className="p-3 flex gap-2">

                  <a
                    href={`/guest/${g.token}`}
                    target="_blank"
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    باز کردن
                  </a>

                  <button
                    onClick={() => copyLink(g.token)}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    کپی
                  </button>

                  <button
                    onClick={() => deleteGuest(g.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    حذف
                  </button>

                </td>

              </tr>
            )
          })}
        </tbody>

      </table>
    </div>
  )
}