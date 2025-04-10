"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ParticlesCanvas from "./particle"
import Image from "next/image"
import logoMicron from "../../../public/logo-micron.svg"
import logoDigitalTrinity from "../../../public/logo-digital-trinity.svg"
import iconDT from "../../../public/ic-dt.svg"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("demo@digitaltrinity.com")
  const [password, setPassword] = useState("Capstone2025!")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // New loading state

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (session) router.push("/")
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true) // Set loading to true when login starts
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false) // Stop loading on error
    } else {
      router.push("/")
    }
  }

  return (
    <div className="relative">
      <ParticlesCanvas />
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="mb-6 text-center">
          <Image src={logoMicron} alt="Micron Logo" width={320} height={100} />
          <h1 className="text-white font-extrabold text-5xl text tracking-wider mt-2">SupplySense</h1>
          <div className="flex items-center justify-center mt-4">
            <p className="text-white text-sm mr-2">Powered by</p>
            <Image src={logoDigitalTrinity} alt="Digital Trinity Logo" width={120} height={40} />
          </div>
        </div>        
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mb-20"
        >
          <h2 className="text-2xl mb-4 text-center font-bold">Login</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={loading} // Disable input when loading
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              disabled={loading} // Disable input when loading
            />
          </div>
          <button
            type="submit"
            className={`cursor-pointer w-full bg-emerald-400 text-white font-medium py-2 rounded hover:bg-emerald-500 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading} // Disable button when loading
          >
            Login
          </button>
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <Image src={iconDT} alt="Loading..." width={40} height={140} className="animate-spin" />
              <div>Logging in...</div>
            </div>
          )}
        </form>        
      </div>
    </div>
  )
}