import { Bell, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  title: string
  showNotification?: boolean
}

export default function Header({ title, showNotification = false }: HeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-300" />
        </div>
        {showNotification && (
          <div className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
          </div>
        )}
      </div>
      <Link href="/chat">
        <div className="w-10 h-10 relative">
          <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-[90%] h-[90%] relative">
              <Image src="/images/finn-emoji.png" alt="Finn emoji" fill className="object-contain" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
