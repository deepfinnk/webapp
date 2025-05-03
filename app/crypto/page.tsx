import Header from "@/components/header"
import Navigation from "@/components/navigation"

export default function Crypto() {
  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <Header title="Crypto" />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Crypto</h1>

        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-400">Crypto features coming soon</p>
        </div>
      </div>

      <Navigation />
    </>
  )
}
