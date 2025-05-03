"use client"

import { Home, Plane, PieChart, TrendingUp, Bitcoin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex justify-between items-center py-4 px-6 border-t border-gray-800 bg-black">
      <Link href="/">
        <div className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <Home className="w-6 h-6 mb-1" />
          <span>Home</span>
        </div>
      </Link>
      <Link href="/travel">
        <div className={`nav-item ${pathname === "/travel" ? "active" : ""}`}>
          <Plane className="w-6 h-6 mb-1" />
          <span>Travel</span>
        </div>
      </Link>
      <Link href="/budgeting">
        <div className={`nav-item ${pathname === "/budgeting" ? "active" : ""}`}>
          <PieChart className="w-6 h-6 mb-1" />
          <span>Budgeting</span>
        </div>
      </Link>
      <Link href="/stocks">
        <div className={`nav-item ${pathname === "/stocks" ? "active" : ""}`}>
          <TrendingUp className="w-6 h-6 mb-1" />
          <span>Stocks</span>
          <span className="text-[10px] bg-gray-800 px-1 rounded">BETA</span>
        </div>
      </Link>
      <Link href="/crypto">
        <div className={`nav-item ${pathname === "/crypto" ? "active" : ""}`}>
          <Bitcoin className="w-6 h-6 mb-1" />
          <span>Crypto</span>
          <span className="text-[10px] bg-gray-800 px-1 rounded">BETA</span>
        </div>
      </Link>
    </div>
  )
}
