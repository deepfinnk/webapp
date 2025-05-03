import Header from "@/components/header"
import Navigation from "@/components/navigation"
import { ChevronDown, ArrowUp, ArrowDown, Plus } from "lucide-react"
import { Wallet, Settings, PiggyBank } from "lucide-react"

export default function Home() {
  return (
    <>
      <div className="flex-1 flex flex-col bg-black">
        <Header title="Home" showNotification={true} />

        <h1 className="text-4xl font-bold px-4 mt-2 mb-8">Home</h1>

        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl">Victor Hornet</h2>
            <ChevronDown className="w-6 h-6" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="account-card bg-purple-primary">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-100" />
                <span className="text-purple-100">Total Balance</span>
              </div>
              <span className="text-2xl font-bold">€ 476.46</span>
            </div>

            <div className="account-card bg-brown-primary">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-orange-100" />
                <span className="text-orange-100">Main</span>
              </div>
              <span className="text-2xl font-bold">€ 476.46</span>
            </div>

            <div className="account-card bg-gray-900 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-gray-300" />
                <span className="text-gray-300">Savings Account</span>
              </div>
              <span className="text-2xl font-bold">€ 5467.34</span>
            </div>
          </div>
        </div>

        <div className="flex justify-around mt-auto mb-8">
          <div className="flex flex-col items-center">
            <div className="action-button bg-brown-primary">
              <ArrowUp className="w-6 h-6" />
            </div>
            <span className="mt-2">Pay</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="action-button bg-blue-primary">
              <ArrowDown className="w-6 h-6" />
            </div>
            <span className="mt-2">Request</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="action-button bg-purple-primary">
              <Plus className="w-6 h-6" />
            </div>
            <span className="mt-2">Add</span>
          </div>
        </div>
      </div>

      <Navigation />
    </>
  )
}
