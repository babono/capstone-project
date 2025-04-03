"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [insight, setInsight] = useState('')

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])


  const handlePromptSubmit = async () => {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })
    console.log(response)
    const data = await response.json()
    setInsight(data.response)
  }

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
      <div className="w-full mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black">Generate Insights</h2>
          <p className="text-gray-600">Enter a prompt to generate insights using the AI model.</p>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 text-black border border-gray-300 rounded mb-4"
            placeholder="Enter your prompt here"
          />
          <button
            onClick={handlePromptSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Generate Insight
          </button>
        </div>
        {insight && (
          <div className="bg-white p-4 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-bold text-black">Generated Insight</h3>
            <p className="text-gray-600">{insight}</p>
          </div>
        )}
      </div>
    </div>
  )
}