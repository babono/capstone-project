"use client"

import { signOut } from "next-auth/react"
import Image from "next/image"
import logoMicron from "../../public/logo-micron.svg"

interface HeaderProps {
  email: string | null | undefined;
}

const Header: React.FC<HeaderProps> = ({ email }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-dt-secondary">
      <div className="flex items-center">
        <Image src={logoMicron} alt="Micron Logo" width={100} height={22} />
        <div className="mx-3 w-0.5 h-6 bg-white mt-1"></div>
        <h1 className="font-extrabold text-xl pt-1">SupplySense</h1>
      </div>
      <div className="flex items-center space-x-4">
        <p>{email}</p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

export default Header
