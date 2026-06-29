type Guest = {
id: string
name: string
token: string
max_views: number
views: number
active: boolean
}

type Props = {
guests?: Guest[]
onRefresh?: () => void
}

export default function GuestTable({
guests,
onRefresh
}: Props) {

// ========================
// COPY LINK
// ========================
async function copyLink(token: string) {

const url =
  `http://localhost:3000/guest/${token}`

try {

  await navigator.clipboard.writeText(url)

  alert("لینک کپی شد")

} catch (err) {

  console.error(
    "Copy failed:",
    err
  )
}

}

// ========================
// DELETE GUEST
// ========================
async function deleteGuest(id: string) {

const ok =
  confirm("آیا حذف شود؟")

if (!ok) return

try {

  await fetch(
    `http://localhost:3001/api/guest/${id}`,
    {
      method: "DELETE"
    }
  )

  if (onRefresh) {
    onRefresh()
  }

} catch (err) {

  console.error(
    "Delete error:",
    err
  )
}

}

// ========================
// RESET VIEWS
// ========================
async function resetViews(id: string) {

try {

  await fetch(
    `http://localhost:3001/api/guest/reset/${id}`,
    {
      method: "POST"
    }
  )

  if (onRefresh) {
    onRefresh()
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

  await fetch(
    `http://localhost:3001/api/guest/toggle/${id}`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        active: !active
      })
    }
  )

  if (onRefresh) {
    onRefresh()
  }

} catch (err) {

  console.error(
    "Toggle error:",
    err
  )
}

}

// ========================
// EDIT GUEST
// ========================
async function editGuest(g: Guest) {

const newName =
prompt(
"نام جدید",
g.name
)

if (!newName) return

const newMax =
prompt(
"حداکثر بازدید (1 تا 999)",
String(g.max_views)
)

if (!newMax) return

// تبدیل به عدد
const maxValue =
Number(newMax)

// اعتبارسنجی
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

await fetch(
  `http://localhost:3001/api/guest/${g.id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type":
        "application/json"
    },
    body: JSON.stringify({
      name: newName.trim(),
      max_views: maxValue
    })
  }
)

if (onRefresh) {
  onRefresh()
}

} catch (err) {

console.error(
  "Edit error:",
  err
)

}

}

// ========================
// EMPTY STATE
// ========================
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
// MAIN UI
// ========================
return (

<div className="bg-white p-4 rounded shadow overflow-x-auto">

  <table className="w-full text-sm">

    <thead>

      <tr className="border-b bg-gray-50">

        <th className="text-left p-3">
          نام
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
                resetViews(g.id)
              }
              className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
            >
              ریست
            </button>

            {/* BLOCK */}
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