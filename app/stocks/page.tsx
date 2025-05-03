import Header from "@/components/header"
import Navigation from "@/components/navigation"

export default function Stocks() {
  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <Header title="Stocks" />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Stocks</h1>

        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-400">Stocks features coming soon</p>
        </div>
      </div>

      <Navigation />
    </>
  )
}
