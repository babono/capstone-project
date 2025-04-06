// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Image from "next/image";
import iconDT from "../../../public/ic-dt.svg";
import logoGemini from "../../../public/logo-gemini.svg";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Autocomplete from "@mui/material/Autocomplete";
import TypeIt from "typeit-react";
import ReactMarkdown from "react-markdown";

const Plot = dynamic(
  () =>
    import("react-plotly.js").then(
      (mod) =>
        mod.default as React.ComponentType<{
          data: any;
          layout: any;
          frames: any;
          config: any;
        }>
    ),
  { ssr: false }
);

export default function MaterialConsumption() {
  // NextAuth session
  const { data: session, status } = useSession()
  const router = useRouter()

  // State variables
  const [file, setFile] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [topN, setTopN] = useState(10);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  // Shelf Data
  const [finiteShelfData, setFiniteShelfLifeData] = useState([]);
  const [infiniteShelfData, setInfiniteShelfLifeData] = useState([]);

  // Separate states for each chart's insight and loading status
  const [transactionsInsight, setTransactionsInsight] = useState("");
  const [loadingTransactionsInsight, setLoadingTransactionsInsight] = useState(false);

  const [MaterialConsumptionInsight, setMaterialConsumptionInsight] = useState("");
  const [loadingMaterialConsumptionInsight, setLoadingMaterialConsumptionInsight] = useState(false);

  const [varianceInsight, setVarianceInsight] = useState("");
  const [loadingVarianceInsight, setLoadingVarianceInsight] = useState(false);

  const [plants, setPlants] = useState([]);
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/py/uploadExcelMaterialConsumption", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setPlotData(data);

    const uniquePlants = [...new Set(data.map((item) => item["Plant"]))];
    const uniqueSites = [...new Set(data.map((item) => item["Site"]))];
    const uniqueVendors = [...new Set(data.map((item) => item["Vendor Number"]))];

    setPlants(uniquePlants);
    setSites(uniqueSites);
    setVendors(uniqueVendors);

    setSelectedPlants(uniquePlants);
    setSelectedSites(uniqueSites);
    setSelectedVendors(uniqueVendors);

    const dates = data.map((item) => new Date(item["Pstng Date"]));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    setMinDate(oldestDate);
    setMaxDate(newestDate);

    setDateRange([oldestDate, newestDate]);
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls",
    multiple: false,
  });

  useEffect(() => {
    if (plotData.length > 0) {
      const modifiedData = plotData.map((item) => ({
        ...item,
        remainingShelfLife: Math.ceil(
          (new Date(item["SLED/BBD"]) - new Date(item["Pstng Date"])) /
          (1000 * 60 * 60 * 24)
        ),
      }));
      const finiteShelfLife = modifiedData.filter((item) => item["SLED/BBD"] !== "2100-01-01");
      const infiniteShelfLife = modifiedData
        .filter((item) => item["SLED/BBD"] === "NaT")
        .map((item) => ({
          ...item,
          "SLED/BBD": "No Expiry",
        }));

      setFiniteShelfLifeData(finiteShelfLife);
      setInfiniteShelfLifeData(infiniteShelfLife);
    }
  }, [plotData]);

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) router.push("/login")
  }, [session, status, router])

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src={iconDT} alt="Loading..." width={100} height={100} className="animate-spin" />
      </div>
    )
  }

  const filteredPlotData = plotData.filter((item) => {
    const isPlantMatch = selectedPlants.length === 0 || selectedPlants.includes(item["Plant"]);
    const isSiteMatch = selectedSites.length === 0 || selectedSites.includes(item["Site"]);
    const isVendorMatch = selectedVendors.length === 0 || selectedVendors.includes(item["Vendor Number"]);
    const isDateMatch =
      (!dateRange[0] || new Date(item["Pstng Date"]) >= dateRange[0]) &&
      (!dateRange[1] || new Date(item["Pstng Date"]) <= dateRange[1]);

    return isPlantMatch && isSiteMatch && isVendorMatch && isDateMatch;
  });

  const aggregatedData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, "Quantity": 0, "Transaction Count": 0 };
      }
      acc[materialNumber]["Transaction Count"] += 1;
      acc[materialNumber]["Quantity"] += item["Quantity"];
      return acc;
    }, {})
  );

  const filteredData = aggregatedData
    .sort((a, b) => b["Quantity"] - a["Quantity"])
    .slice(0, topN !== "All" ? topN : aggregatedData.length);

  const filteredTransactionData = aggregatedData
    .sort((a, b) => b["Transaction Count"] - a["Transaction Count"])
    .slice(0, topN !== "All" ? topN : aggregatedData.length);

  const varianceData = Object.values(
    filteredPlotData.reduce((acc, item) => {
      const materialNumber = item["Material Number"];
      if (!acc[materialNumber]) {
        acc[materialNumber] = { "Material Number": materialNumber, values: [] };
      }
      acc[materialNumber].values.push(item["Quantity"]);
      return acc;
    }, {})
  ).map((material) => ({
    materialNumber: material["Material Number"],
    values: material.values,
  }));

  const filteredVarianceData = varianceData.filter((material) =>
    filteredData.some((topMaterial) => topMaterial["Material Number"] === material.materialNumber)
  );

  const handleInterpret = async (chartId, setLoading, setInsight) => {
    setLoading(true);
    setInsight("");

    try {
      const chartElement = document.getElementById(chartId);

      if (!chartElement) {
        throw new Error("Chart element not found");
      }

      const imageData = await window.Plotly.toImage(chartElement, {
        format: "png",
        width: 800,
        height: 600,
      });

      const base64Image = imageData.split(",")[1];

      const response = await fetch("/api/insightImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartImage: base64Image,
        }),
      });

      const data = await response.json();
      setInsight(data.response || "No insight available.");
    } catch (error) {
      console.error("Error fetching insight:", error);
      setInsight("Failed to fetch insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFiniteShelfComponent = () => {
    const shelfLength = finiteShelfData.length;
    if (shelfLength === 0) {
      return <p>No items with finite shelf life in the selected data.</p>;
    } return (
      <div>
        <h2 className="mt-6 text-xl font-semibold">
          Distribution of Remaining Shelf Life (Days) - Finite Shelf Life
        </h2>
        <Plot
          data={[
            {
              x: finiteShelfData.map((item) => item.remainingShelfLife),
              type: "histogram",
              marker: { color: "blue" },
              hovertemplate: `Remaining Shelf Life (Days)=%{x}<br>Count=%{y}<extra></extra>
            `,
            },
          ]}
          layout={{
            title: { text: "Distribution of Remaining Shelf Life (Days)", font: { color: "black" } },
            xaxis: {
              title: { text: "Days", font: { color: "black" } },
              automargin: true,
            },
            yaxis: {
              title: { text: "Count", font: { color: "black" } },
              automargin: true,
            },
            showlegend: false,
            autosize: true,
            hoverlabel: {
              align: "left",
            },
          }}
          style={{ width: "100%", height: "100%" }}
          config={{ displayModeBar: false }}
        />
      </div>
    )
  }

  const renderInfiniteShelfComponent = () => {
    const shelfLength = infiniteShelfData.length;
    if (shelfLength === 0) {
      return <p>No items with infinite shelf life in the selected data.</p>;
    }

    // Dynamically get the table headers from the keys of the first object, excluding "remainingShelfLife"
    const headers = Object.keys(infiniteShelfData[0]).filter(
      (header) => header !== "remainingShelfLife"
    );

    return (
      <div>
        <h2 className="mt-6 text-xl font-semibold">
          Distribution of Remaining Shelf Life (Days) - Infinite Shelf Life
        </h2>
        <p>Number of Items with Infinite Shelf Life: {infiniteShelfData.length}</p>
        <p>Items with Infinite Shelf Life:</p>
        <br></br>
        <div className="overflow-y-auto max-h-110 border border-gray-300 rounded-lg">
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-2">No</th>
                {headers.map((header) => (
                  <th key={header} className="border border-gray-300 px-2 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {infiniteShelfData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                  {headers.map((header) => (
                    <td key={header} className="border border-gray-300 px-2 py-2">
                      {item[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Material Consumption Analysis</h1>

      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #3719D3",
          borderRadius: "8px",
          padding: "48px 16px",
          textAlign: "center",
          backgroundColor: isDragActive ? "#e3f2fd" : "#fafafa",
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant="body1" color="primary">
            Drop the file here...
          </Typography>
        ) : (
          <Typography variant="body1" color="textSecondary">
            Drag and drop the Material Consumption Excel file here to start the analysis, or click to select a file
          </Typography>
        )}
        {file && (
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: "8px" }}>
            Selected file: {file.name}
          </Typography>
        )}
      </Box>

      {plotData.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Global Filters</h2>

            <Autocomplete
              multiple
              options={plants}
              value={selectedPlants}
              onChange={(event, newValue) => setSelectedPlants(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Plants" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            <Autocomplete
              multiple
              options={sites}
              value={selectedSites}
              onChange={(event, newValue) => setSelectedSites(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Sites" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            <Autocomplete
              multiple
              options={vendors}
              value={selectedVendors}
              onChange={(event, newValue) => setSelectedVendors(newValue)}
              renderInput={(params) => <TextField {...params} label="Select Vendors" variant="outlined" />}
              sx={{ marginBottom: "16px", width: "100%" }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePicker
                startText="Start Date"
                endText="End Date"
                value={dateRange}
                onChange={(newValue) => setDateRange(newValue)}
                minDate={minDate}
                maxDate={maxDate}
                renderInput={(startProps, endProps) => (
                  <>
                    <TextField {...startProps} sx={{ marginRight: "16px", width: "50%" }} />
                    <TextField {...endProps} sx={{ width: "50%" }} />
                  </>
                )}
              />
            </LocalizationProvider>
          </div>

          <div className="mt-4">
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="topN-label">Select Top N Materials</InputLabel>
              <Select
                labelId="topN-label"
                id="topN"
                value={topN}
                onChange={(e) => setTopN(e.target.value === "All" ? "All" : parseInt(e.target.value))}
                label="Select Top N Materials"
              >
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={15}>Top 15</MenuItem>
                <MenuItem value="All">All</MenuItem>
              </Select>
            </FormControl>
          </div>
          <h2 className="mt-6 text-xl font-semibold">Number of Transactions per Material Number</h2>
          <div>
            <Plot
              divId="transactions-chart"
              data={[
                {
                  x: filteredTransactionData.map((item) => item["Material Number"]),
                  y: filteredTransactionData.map((item) => item["Transaction Count"]),
                  type: "bar",
                  marker: { color: "blue" },
                  text: filteredTransactionData.map(
                    (item) =>
                      `Material Number: ${item["Material Number"]}<br>Transaction Count: ${item["Transaction Count"]}`
                  ),
                  hoverinfo: "text",
                  textposition: "none",
                },
              ]}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Transaction Count", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border-2 border-dt-primary">
            {loadingTransactionsInsight && (
              <div className="flex justify-center">
                <Image src={iconDT} alt="Loading..." width={40} height={40} className="animate-spin" />
              </div>
            )}
            {transactionsInsight && (
              <>
                <h3 className="text-xl font-bold text-black">Generated Insight
                  <span className="pl-2 text-sm font-normal">by
                    <Image src={logoGemini} alt="Loading..." width={60} height={25} className="inline-block align-top ml-2" />
                  </span>
                </h3>
                <TypeIt options={{ speed: 10, cursor: false }}>
                  <ReactMarkdown>{transactionsInsight}</ReactMarkdown>
                </TypeIt>
                <br />
                <br />
              </>
            )}
            <div className="flex justify-center">
              <button
                onClick={() =>
                  handleInterpret("transactions-chart", setLoadingTransactionsInsight, setTransactionsInsight)
                }
                className="bg-dt-primary text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700 transition flex items-center"
              >
                <AutoAwesomeIcon className="mr-2" /> Ask Gemini for Insight
              </button>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-semibold">Overall Material Consumption by Material Number</h2>
          <div>
            <Plot
              divId="goods-receipt-chart"
              data={[
                {
                  x: filteredData.map((item) => item["Material Number"]),
                  y: filteredData.map((item) => item["Quantity"]),
                  type: "bar",
                  marker: { color: "blue" },
                  text: filteredData.map(
                    (item) =>
                      `Material Number: ${item["Material Number"]}<br>Material Consumption Quantity: ${item["Quantity"]}`
                  ),
                  hoverinfo: "text",
                  textposition: "none",
                },
              ]}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Quantity", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border-2 border-dt-primary">
            {loadingMaterialConsumptionInsight && (
              <div className="flex justify-center">
                <Image src={iconDT} alt="Loading..." width={40} height={40} className="animate-spin" />
              </div>
            )}
            {MaterialConsumptionInsight && (
              <>
                <h3 className="text-xl font-bold text-black">Generated Insight
                  <span className="pl-2 text-sm font-normal">by
                    <Image src={logoGemini} alt="Loading..." width={60} height={25} className="inline-block align-top ml-2" />
                  </span>
                </h3>
                <TypeIt options={{ speed: 10, cursor: false }}>
                  <ReactMarkdown>{MaterialConsumptionInsight}</ReactMarkdown>
                </TypeIt>
                <br />
                <br />
              </>
            )}
            <div className="flex justify-center">
              <button
                onClick={() =>
                  handleInterpret("goods-receipt-chart", setLoadingMaterialConsumptionInsight, setMaterialConsumptionInsight)
                }
                className="bg-dt-primary text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700 transition flex items-center"
              >
                <AutoAwesomeIcon className="mr-2" /> Ask Gemini for Insight
              </button>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-semibold">Materials by Variance</h2>
          <div>
            <Plot
              divId="variance-chart"
              data={filteredVarianceData.map((material) => ({
                y: material.values,
                name: material.materialNumber,
                type: "box",
                marker: { color: "blue" },
              }))}
              layout={{
                xaxis: {
                  title: { text: "Material Number", font: { color: "black" } },
                  automargin: true,
                },
                yaxis: {
                  title: { text: "Quantity", font: { color: "black" } },
                  automargin: true,
                },
                showlegend: false,
                autosize: true,
              }}
              style={{ width: "100%", height: "100%" }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border-2 border-dt-primary">
            {loadingVarianceInsight && (
              <div className="flex justify-center">
                <Image src={iconDT} alt="Loading..." width={40} height={40} className="animate-spin" />
              </div>
            )}
            {varianceInsight && (
              <>
                <h3 className="text-xl font-bold text-black">Generated Insight
                  <span className="pl-2 text-sm font-normal">by
                    <Image src={logoGemini} alt="Loading..." width={60} height={25} className="inline-block align-top ml-2" />
                  </span>
                </h3>
                <TypeIt options={{ speed: 10, cursor: false }}>
                  <ReactMarkdown>{varianceInsight}</ReactMarkdown>
                </TypeIt>
                <br />
                <br />
              </>
            )}
            <div className="flex justify-center">
              <button
                onClick={() =>
                  handleInterpret("variance-chart", setLoadingVarianceInsight, setVarianceInsight)
                }
                className="bg-dt-primary text-white px-4 py-2 rounded mt-2 hover:bg-indigo-700 transition flex items-center"
              >
                <AutoAwesomeIcon className="mr-2" /> Ask Gemini for Insight
              </button>
            </div>
          </div>
          {renderFiniteShelfComponent()}
          {renderInfiniteShelfComponent()}


          <h2 className="mt-6 text-xl font-semibold">Material-Level Analysis</h2>

        </>
      )}
    </div>
  );
}