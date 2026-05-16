export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-2xl font-semibold text-gray-700">Page not found</p>
      <p className="text-sm text-gray-400">The expense you&apos;re looking for doesn&apos;t exist.</p>
      <a href="/expenses" className="text-indigo-600 hover:underline text-sm">Back to expenses</a>
    </div>
  )
}
