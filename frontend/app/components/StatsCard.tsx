export default function StatsCard({
  title,
  value
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}