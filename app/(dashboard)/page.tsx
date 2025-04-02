"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import iconDT from "../../public/ic-dt.svg"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { format } from 'date-fns';

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

const scoreOrPrediction = (data: { supplies: number | null; prediction: number | null }) => data.supplies !== null ? data.supplies : data.prediction;
const defaultColor = "#3719D3";
const lastIntervalPercent = ((data260.length - 2) * 100) / (data260.length - 1);

const gradientTwoColors = (id: string | undefined, col1: string | undefined, col2: string | undefined, percentChange: number) => (
  <linearGradient id={id} x1="0" y1="0" x2="100%">
    <stop offset="0%" stopColor={col1} />
    <stop offset={`${percentChange}%`} stopColor={col1} />
    <stop offset={`${percentChange}%`} stopColor={col2} />
    <stop offset="100%" stopColor={col2} />
  </linearGradient>
);

const formatIfNumeric = (x: number) => (typeof x === 'number' ? x.toFixed() : x);

const tooltipFormatter = (value: number | number[], name: string | string[]) => {
  if (name.includes("noTooltip")) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(formatIfNumeric).join(" - ");
  }
  return `${formatIfNumeric(value)}`;
};

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [view] = useState('monthly')
  const [filteredData260, setFilteredData260] = useState(formattedData260.filter(d => new Date(d.date).getDate() === 1))
  const [filteredData453, setFilteredData453] = useState(formattedData453.filter(d => new Date(d.date).getDate() === 1))
  const [prompt, setPrompt] = useState('')
  const [insight, setInsight] = useState('')

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
    <div className="flex flex-col items-center justify-center flex-grow">
      <h1 className="text-3xl mb-4 font-bold text-left w-full">Dashboard</h1>
      <div className="flex w-full mb-8">
        <div className=" w-2/3 mr-4">
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
      <div className="w-full mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black">Supply Prediction for Material Groups 260</h2>
          <p className="text-gray-600">This chart provides insights into the predicted supply requirements to meet the forecasted demand. It aims to minimize miscalculations and enhance operational efficiency.</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData260}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <defs>
              {gradientTwoColors(
                "hideAllButLastInterval",
                "rgba(0,0,0,0)",
                defaultColor,
                lastIntervalPercent
              )}
              {gradientTwoColors(
                "hideJustLastInterval",
                defaultColor,
                "rgba(0,0,0,0)",
                lastIntervalPercent
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} wrapperStyle={{ color: 'black' }} />
            <Line
              name="Supplies"
              type="monotone"
              strokeDasharray="0 100"
              dataKey="supplies"
            />
            <Line
              name="Prediction"
              type="monotone"
              strokeDasharray="0 100"
              dataKey="prediction"
            />
            <Line
              name="line1_noTooltip"
              type="monotone"
              stroke="url(#hideJustLastInterval)"
              dataKey={scoreOrPrediction}
            />
            <Line
              name="line2_noTooltip"
              type="monotone"
              stroke="url(#hideAllButLastInterval)"
              strokeDasharray="5 5"
              dataKey={scoreOrPrediction}
            />
            <Line
              name="Demand"
              type="monotone"
              strokeDasharray="3 3"
              dataKey="demand"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-black">Supply Prediction for Material Groups 453</h2>
          <p className="text-gray-600">This chart provides insights into the predicted supply requirements to meet the forecasted demand. It aims to minimize miscalculations and enhance operational efficiency.</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData453}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <defs>
              {gradientTwoColors(
                "hideAllButLastInterval",
                "rgba(0,0,0,0)",
                defaultColor,
                lastIntervalPercent
              )}
              {gradientTwoColors(
                "hideJustLastInterval",
                defaultColor,
                "rgba(0,0,0,0)",
                lastIntervalPercent
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} wrapperStyle={{ color: 'black' }} />
            <Line
              name="Supplies"
              type="monotone"
              strokeDasharray="0 100"
              dataKey="supplies"
            />
            <Line
              name="Prediction"
              type="monotone"
              strokeDasharray="0 100"
              dataKey="prediction"
            />
            <Line
              name="line1_noTooltip"
              type="monotone"
              stroke="url(#hideJustLastInterval)"
              dataKey={scoreOrPrediction}
            />
            <Line
              name="line2_noTooltip"
              type="monotone"
              stroke="url(#hideAllButLastInterval)"
              strokeDasharray="5 5"
              dataKey={scoreOrPrediction}
            />
            <Line
              name="Demand"
              type="monotone"
              strokeDasharray="3 3"
              dataKey="demand"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
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