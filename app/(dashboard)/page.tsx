"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()


  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  // Redirect if not logged in
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src={iconDT} alt="Loading..." width={100} height={100} className="animate-spin" />
      </div>
    )
  }

  return (    
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Waterfall</h1>
      <h2>Still undergoing development, can check other features first</h2>
    </div>
  )
}