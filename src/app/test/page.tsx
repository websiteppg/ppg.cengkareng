export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Website PPG Jakarta Barat Cengkareng
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Website berhasil di-deploy dan berfungsi normal!
        </p>
        <a 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  )
}