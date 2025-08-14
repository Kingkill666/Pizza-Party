"use client"

export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-red-800 mb-4">🍕 Pizza Party Test</h1>
        <p className="text-gray-600 mb-4">If you can see this, the basic Next.js setup is working!</p>
        <div className="text-sm text-gray-500">
          <p>✅ Next.js is working</p>
          <p>✅ React is working</p>
          <p>✅ Tailwind CSS is working</p>
        </div>
      </div>
    </div>
  )
}
