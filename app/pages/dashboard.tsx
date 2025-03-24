"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import spinner from "../../public/ic-spinner.svg"
import { format } from 'date-fns';
import ChartComponent from "../components/charts"
import Header from "./header"
import { Streamlit } from "streamlit-component-lib"

const data260 = [
  { date: '2025-01-01', demand: 4000, supplies: 2400, prediction: null },
  { date: '2025-02-01', demand: 3000, supplies: 1398, prediction: null },
  { date: '2025-03-01', demand: 2000, supplies: 9800, prediction: null },
  { date: '2025-04-01', demand: 2780, supplies: 3908, prediction: null },
  { date: '2025-05-01', demand: 1890, supplies: 4800, prediction: null },
  { date: '2025-06-01', demand: 2390, supplies: 3800, prediction: null },
  { date: '2025-07-01', demand: 4290, supplies: null, prediction: 4200 },
];

const data453 = [
  { date: '2025-01-01', demand: 5000, supplies: 3900, prediction: null },
  { date: '2025-02-01', demand: 1300, supplies: 4200, prediction: null },
  { date: '2025-03-01', demand: 700, supplies: 2700, prediction: null },
  { date: '2025-04-01', demand: 2600, supplies: 2900, prediction: null },
  { date: '2025-05-01', demand: 1783, supplies: 3900, prediction: null },
  { date: '2025-06-01', demand: 3483, supplies: 2734, prediction: null },
  { date: '2025-07-01', demand: 2320, supplies: null, prediction: 2320 },
];

const formattedData260 = data260.map(d => ({
  ...d,
  formattedDate: format(new Date(d.date), 'MMM yyyy')
}));

const formattedData453 = data453.map(d => ({
  ...d,
  formattedDate: format(new Date(d.date), 'MMM yyyy')
}));

const lastIntervalPercent = ((data260.length - 2) * 100) / (data260.length - 1);

const Dashboard = () => {

  useEffect(() => {
    Streamlit.setFrameHeight(1700)
  }, [])

  const { data: session, status } = useSession()
  const router = useRouter()
  const [view] = useState('monthly')
  const [filteredData260, setFilteredData260] = useState(formattedData260.filter(d => new Date(d.date).getDate() === 1))
  const [filteredData453, setFilteredData453] = useState(formattedData453.filter(d => new Date(d.date).getDate() === 1))

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  useEffect(() => {
    if (view === 'monthly') {
      setFilteredData260(formattedData260.filter(d => new Date(d.date).getDate() === 1))
      setFilteredData453(formattedData453.filter(d => new Date(d.date).getDate() === 1))
    } else {
      setFilteredData260(formattedData260.filter(d => new Date(d.date).getDate() !== 1))
      setFilteredData453(formattedData453.filter(d => new Date(d.date).getDate() !== 1))
    }
  }, [view])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dt-primary">
        <Image src={spinner} alt="Loading..." width={100} height={100} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-dt-primary text-white">
      <Header email={session?.user?.email} />
      <main className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-3xl mb-4 font-bold text-left w-full max-w-4xl">Dashboard</h1>
        <div className="flex w-full max-w-4xl mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 mr-4">
            <h2 className="text-2xl font-bold text-black">Overview Insights</h2>
            <p className="text-gray-600">This section provides a high-level overview of the current supply and demand trends.</p>
            <ul className="list-disc list-inside text-gray-600">
              <li>For the next week, increase the supply of material group 260 to match the prediction.</li>
              <li>For the next week, reduce the supply of material group 453 to match the prediction.</li>
            </ul>
          </div>
          <div className="flex flex-col w-1/3 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-black">Hot Material Group</h3>
              <p className="text-gray-600">Material Group 260</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-black">Hot Supplier</h3>
              <p className="text-gray-600">Supplier_6123820</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-black">Hot Site</h3>
              <p className="text-gray-600">Site4</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Supply Prediction for Material Groups 260</h2>
            <p className="text-gray-600">This chart provides insights into the predicted supply requirements to meet the forecasted demand. It aims to minimize miscalculations and enhance operational efficiency.</p>
          </div>
          <ChartComponent data={filteredData260} lastIntervalPercent={lastIntervalPercent} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-black">Supply Prediction for Material Groups 453</h2>
            <p className="text-gray-600">This chart provides insights into the predicted supply requirements to meet the forecasted demand. It aims to minimize miscalculations and enhance operational efficiency.</p>
          </div>
          <ChartComponent data={filteredData453} lastIntervalPercent={lastIntervalPercent} />
        </div>
      </main>
      <footer className="flex items-center justify-center p-4 bg-dt-secondary text-white">
        <p>Powered by Digital Trinity</p>
      </footer>
    </div>
  )
}

export default Dashboard
