interface StatsCardProps {
  title: string
  value: string
}

function StatsCard({
  title,
  value,
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
      <p className="text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <h3 className="text-2xl font-bold mt-3 text-gray-900 dark:text-white">
        {value}
      </h3>
    </div>
  )
}
export default StatsCard