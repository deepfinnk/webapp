import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

export default function Budgeting() {
  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <Header title="Budgeting" />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Budgeting</h1>

        <div className="px-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="bg-gray-800 rounded-full py-2 px-4 flex items-center justify-between w-3/4 mx-auto mb-6">
              <FileText className="w-5 h-5 text-orange-primary" />
              <span>Total Spent</span>
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 1.00</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.67</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.33</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <div className="w-full h-1 bg-gray-800 rounded-full mt-3"></div>
                <span className="ml-4">€ 0.00</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl mb-4">This Month</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-xl">=</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">€ 0.00</div>
                  <div className="text-gray-400 text-sm">About the same as this time last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="bg-gray-800 rounded-full py-2 px-4 flex items-center justify-between w-3/4 mx-auto mb-6">
              <ChevronLeft className="w-5 h-5" />
              <span>May 2025</span>
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="h-40 flex items-center justify-center">{/* Empty chart area */}</div>
          </div>
        </div>

        <div className="px-4 mt-auto mb-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-center">
              <p>You could have saved € 0.00</p>
              <p className="text-gray-400">Effortlessly fill your savings account:</p>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </>
  )
}
