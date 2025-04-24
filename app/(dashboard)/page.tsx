// @ts-nocheck
"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"
import { PAGE_KEYS, PAGE_LABELS } from "@/app/constants"
import FileUploader from "./common/file-uploader"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadData, setUploadData] = useState(null);

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  useEffect(() => {
    console.log(uploadData)
  }, [uploadData])

  const handleUploadComplete = async (data) => {
    console.log("Uploaded data:", data);
    setUploadData(data);
  };

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
      <FileUploader
        type={PAGE_KEYS.HOME}
        title={PAGE_LABELS.HOME}
        onUploadComplete={handleUploadComplete}
      />
      {uploadData && (
        <pre>Check Console</pre>
      )}
    </div>
  )
}