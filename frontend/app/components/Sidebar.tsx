export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg p-4">

      <h1 className="text-xl font-bold mb-6">
        پنل مدیریت
      </h1>

      <ul className="space-y-3">

        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
          داشبورد
        </li>

        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
          مهمان‌ها
        </li>

        <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
          ساخت لینک
        </li>

      </ul>

    </div>
  )
}