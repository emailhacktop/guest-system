type Guest = {
  id: string
  name: string
  token: string
  max_views: number
  views: number
  active: boolean
}

export default function GuestTable({ guests }: { guests?: Guest[] }) {

  if (!guests || guests.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        هیچ مهمانی وجود ندارد
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <table className="w-full text-sm">

        <thead>
          <tr className="border-b">
            <th className="text-left p-2">نام</th>
            <th className="text-left p-2">توکن</th>
            <th className="text-left p-2">بازدید</th>
            <th className="text-left p-2">حداکثر</th>
            <th className="text-left p-2">وضعیت</th>
          </tr>
        </thead>

        <tbody>
          {guests.map((g) => (
            <tr key={g.id} className="border-b hover:bg-gray-50">

              <td className="p-2">{g.name}</td>
              <td className="p-2 text-xs text-blue-600">{g.token}</td>

              <td className="p-2">{g.views}</td>
              <td className="p-2">{g.max_views}</td>

              <td className="p-2">
                {g.active ? (
                  <span className="text-green-600">فعال</span>
                ) : (
                  <span className="text-red-600">غیرفعال</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )
}